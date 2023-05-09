import { log2, readUint16, readUint32 } from "assets/js/core_utils";
import { info, warn } from "assets/js/shared/util";
import { LayerResolutionComponentPositionIterator } from "assets/js/jpx/iterator/LayerResolutionComponentPositionIterator";
import { ResolutionLayerComponentPositionIterator } from "assets/js/jpx/iterator/ResolutionLayerComponentPositionIterator";
import { ResolutionPositionComponentLayerIterator } from "assets/js/jpx/iterator/ResolutionPositionComponentLayerIterator";
import { PositionComponentResolutionLayerIterator } from "assets/js/jpx/iterator/PositionComponentResolutionLayerIterator";
import { ComponentPositionResolutionLayerIterator } from "assets/js/jpx/iterator/ComponentPositionResolutionLayerIterator";
import { InclusionTree } from "assets/js/jpx/InclusionTree";
import { TagTree } from "assets/js/jpx/TagTree";
import { ReversibleTransform } from "assets/js/jpx/transform/ReversibleTransform";
import { IrreversibleTransform } from "assets/js/jpx/transform/IrreversibleTransform";
import { ArithmeticDecoder } from "assets/js/arithmetic_decoder";
import { BitModel } from "assets/js/jpx/BitModel";
import { JpxError } from "assets/js/jpx/JpxError";

// Table E.1
const SubbandsGainLog2 = {
  LL: 0,
  LH: 1,
  HL: 1,
  HH: 2
};

function calculateComponentDimensions(component, siz) {
  // Section B.2 Component mapping
  component.x0 = Math.ceil(siz.XOsiz / component.XRsiz);
  component.x1 = Math.ceil(siz.Xsiz / component.XRsiz);
  component.y0 = Math.ceil(siz.YOsiz / component.YRsiz);
  component.y1 = Math.ceil(siz.Ysiz / component.YRsiz);
  component.width = component.x1 - component.x0;
  component.height = component.y1 - component.y0;
}

function calculateTileGrids(context, components) {
  const siz = context.SIZ;
  // Section B.3 Division into tile and tile-components
  const tiles = [];
  let tile;
  const numXtiles = Math.ceil((siz.Xsiz - siz.XTOsiz) / siz.XTsiz);
  const numYtiles = Math.ceil((siz.Ysiz - siz.YTOsiz) / siz.YTsiz);
  for (let q = 0; q < numYtiles; q++) {
    for (let p = 0; p < numXtiles; p++) {
      tile = {};
      tile.tx0 = Math.max(siz.XTOsiz + p * siz.XTsiz, siz.XOsiz);
      tile.ty0 = Math.max(siz.YTOsiz + q * siz.YTsiz, siz.YOsiz);
      tile.tx1 = Math.min(siz.XTOsiz + (p + 1) * siz.XTsiz, siz.Xsiz);
      tile.ty1 = Math.min(siz.YTOsiz + (q + 1) * siz.YTsiz, siz.Ysiz);
      tile.width = tile.tx1 - tile.tx0;
      tile.height = tile.ty1 - tile.ty0;
      tile.components = [];
      tiles.push(tile);
    }
  }
  context.tiles = tiles;

  const componentsCount = siz.Csiz;
  for (let i = 0, ii = componentsCount; i < ii; i++) {
    const component = components[i];
    for (let j = 0, jj = tiles.length; j < jj; j++) {
      const tileComponent = {};
      tile = tiles[j];
      tileComponent.tcx0 = Math.ceil(tile.tx0 / component.XRsiz);
      tileComponent.tcy0 = Math.ceil(tile.ty0 / component.YRsiz);
      tileComponent.tcx1 = Math.ceil(tile.tx1 / component.XRsiz);
      tileComponent.tcy1 = Math.ceil(tile.ty1 / component.YRsiz);
      tileComponent.width = tileComponent.tcx1 - tileComponent.tcx0;
      tileComponent.height = tileComponent.tcy1 - tileComponent.tcy0;
      tile.components[i] = tileComponent;
    }
  }
}
function initializeTile(context, tileIndex) {
  const siz = context.SIZ;
  const componentsCount = siz.Csiz;
  const tile = context.tiles[tileIndex];
  for (let c = 0; c < componentsCount; c++) {
    const component = tile.components[c];
    const qcdOrQcc =
      context.currentTile.QCC[c] !== undefined
        ? context.currentTile.QCC[c]
        : context.currentTile.QCD;
    component.quantizationParameters = qcdOrQcc;
    const codOrCoc =
      context.currentTile.COC[c] !== undefined
        ? context.currentTile.COC[c]
        : context.currentTile.COD;
    component.codingStyleParameters = codOrCoc;
  }
  tile.codingStyleDefaultParameters = context.currentTile.COD;
}
function getBlocksDimensions(context, component, r) {
  const codOrCoc = component.codingStyleParameters;
  const result = {};
  if (!codOrCoc.entropyCoderWithCustomPrecincts) {
    result.PPx = 15;
    result.PPy = 15;
  } else {
    result.PPx = codOrCoc.precinctsSizes[r].PPx;
    result.PPy = codOrCoc.precinctsSizes[r].PPy;
  }
  // calculate codeblock size as described in section B.7
  result.xcb_ =
    r > 0
      ? Math.min(codOrCoc.xcb, result.PPx - 1)
      : Math.min(codOrCoc.xcb, result.PPx);
  result.ycb_ =
    r > 0
      ? Math.min(codOrCoc.ycb, result.PPy - 1)
      : Math.min(codOrCoc.ycb, result.PPy);
  return result;
}
function buildPrecincts(context, resolution, dimensions) {
  // Section B.6 Division resolution to precincts
  const precinctWidth = 1 << dimensions.PPx;
  const precinctHeight = 1 << dimensions.PPy;
  // Jasper introduces codeblock groups for mapping each subband codeblocks
  // to precincts. Precinct partition divides a resolution according to width
  // and height parameters. The subband that belongs to the resolution level
  // has a different size than the level, unless it is the zero resolution.

  // From Jasper documentation: jpeg2000.pdf, section K: Tier-2 coding:
  // The precinct partitioning for a particular subband is derived from a
  // partitioning of its parent LL band (i.e., the LL band at the next higher
  // resolution level)... The LL band associated with each resolution level is
  // divided into precincts... Each of the resulting precinct regions is then
  // mapped into its child subbands (if any) at the next lower resolution
  // level. This is accomplished by using the coordinate transformation
  // (u, v) = (ceil(x/2), ceil(y/2)) where (x, y) and (u, v) are the
  // coordinates of a point in the LL band and child subband, respectively.
  const isZeroRes = resolution.resLevel === 0;
  const precinctWidthInSubband = 1 << (dimensions.PPx + (isZeroRes ? 0 : -1));
  const precinctHeightInSubband = 1 << (dimensions.PPy + (isZeroRes ? 0 : -1));
  const numprecinctswide =
    resolution.trx1 > resolution.trx0
      ? Math.ceil(resolution.trx1 / precinctWidth) -
        Math.floor(resolution.trx0 / precinctWidth)
      : 0;
  const numprecinctshigh =
    resolution.try1 > resolution.try0
      ? Math.ceil(resolution.try1 / precinctHeight) -
        Math.floor(resolution.try0 / precinctHeight)
      : 0;
  const numprecincts = numprecinctswide * numprecinctshigh;

  resolution.precinctParameters = {
    precinctWidth,
    precinctHeight,
    numprecinctswide,
    numprecinctshigh,
    numprecincts,
    precinctWidthInSubband,
    precinctHeightInSubband
  };
}
function buildCodeblocks(context, subband, dimensions) {
  // Section B.7 Division sub-band into code-blocks
  const xcb_ = dimensions.xcb_;
  const ycb_ = dimensions.ycb_;
  const codeblockWidth = 1 << xcb_;
  const codeblockHeight = 1 << ycb_;
  const cbx0 = subband.tbx0 >> xcb_;
  const cby0 = subband.tby0 >> ycb_;
  const cbx1 = (subband.tbx1 + codeblockWidth - 1) >> xcb_;
  const cby1 = (subband.tby1 + codeblockHeight - 1) >> ycb_;
  const precinctParameters = subband.resolution.precinctParameters;
  const codeblocks = [];
  const precincts = [];
  let i, j, codeblock, precinctNumber;
  for (j = cby0; j < cby1; j++) {
    for (i = cbx0; i < cbx1; i++) {
      codeblock = {
        cbx: i,
        cby: j,
        tbx0: codeblockWidth * i,
        tby0: codeblockHeight * j,
        tbx1: codeblockWidth * (i + 1),
        tby1: codeblockHeight * (j + 1)
      };

      codeblock.tbx0_ = Math.max(subband.tbx0, codeblock.tbx0);
      codeblock.tby0_ = Math.max(subband.tby0, codeblock.tby0);
      codeblock.tbx1_ = Math.min(subband.tbx1, codeblock.tbx1);
      codeblock.tby1_ = Math.min(subband.tby1, codeblock.tby1);

      // Calculate precinct number for this codeblock, codeblock position
      // should be relative to its subband, use actual dimension and position
      // See comment about codeblock group width and height
      const pi = Math.floor(
        (codeblock.tbx0_ - subband.tbx0) /
          precinctParameters.precinctWidthInSubband
      );
      const pj = Math.floor(
        (codeblock.tby0_ - subband.tby0) /
          precinctParameters.precinctHeightInSubband
      );
      precinctNumber = pi + pj * precinctParameters.numprecinctswide;

      codeblock.precinctNumber = precinctNumber;
      codeblock.subbandType = subband.type;
      codeblock.Lblock = 3;

      if (
        codeblock.tbx1_ <= codeblock.tbx0_ ||
        codeblock.tby1_ <= codeblock.tby0_
      ) {
        continue;
      }
      codeblocks.push(codeblock);
      // building precinct for the sub-band
      let precinct = precincts[precinctNumber];
      if (precinct !== undefined) {
        if (i < precinct.cbxMin) {
          precinct.cbxMin = i;
        } else if (i > precinct.cbxMax) {
          precinct.cbxMax = i;
        }
        if (j < precinct.cbyMin) {
          precinct.cbxMin = j;
        } else if (j > precinct.cbyMax) {
          precinct.cbyMax = j;
        }
      } else {
        precincts[precinctNumber] = precinct = {
          cbxMin: i,
          cbyMin: j,
          cbxMax: i,
          cbyMax: j
        };
      }
      codeblock.precinct = precinct;
    }
  }
  subband.codeblockParameters = {
    codeblockWidth: xcb_,
    codeblockHeight: ycb_,
    numcodeblockwide: cbx1 - cbx0 + 1,
    numcodeblockhigh: cby1 - cby0 + 1
  };
  subband.codeblocks = codeblocks;
  subband.precincts = precincts;
}
function buildPackets(context) {
  const siz = context.SIZ;
  const tileIndex = context.currentTile.index;
  const tile = context.tiles[tileIndex];
  const componentsCount = siz.Csiz;
  // Creating resolutions and sub-bands for each component
  for (let c = 0; c < componentsCount; c++) {
    const component = tile.components[c];
    const decompositionLevelsCount =
      component.codingStyleParameters.decompositionLevelsCount;
    // Section B.5 Resolution levels and sub-bands
    const resolutions = [];
    const subbands = [];
    for (let r = 0; r <= decompositionLevelsCount; r++) {
      const blocksDimensions = getBlocksDimensions(context, component, r);
      const resolution = {};
      const scale = 1 << (decompositionLevelsCount - r);
      resolution.trx0 = Math.ceil(component.tcx0 / scale);
      resolution.try0 = Math.ceil(component.tcy0 / scale);
      resolution.trx1 = Math.ceil(component.tcx1 / scale);
      resolution.try1 = Math.ceil(component.tcy1 / scale);
      resolution.resLevel = r;
      buildPrecincts(context, resolution, blocksDimensions);
      resolutions.push(resolution);

      let subband;
      if (r === 0) {
        // one sub-band (LL) with last decomposition
        subband = {};
        subband.type = "LL";
        subband.tbx0 = Math.ceil(component.tcx0 / scale);
        subband.tby0 = Math.ceil(component.tcy0 / scale);
        subband.tbx1 = Math.ceil(component.tcx1 / scale);
        subband.tby1 = Math.ceil(component.tcy1 / scale);
        subband.resolution = resolution;
        buildCodeblocks(context, subband, blocksDimensions);
        subbands.push(subband);
        resolution.subbands = [subband];
      } else {
        const bscale = 1 << (decompositionLevelsCount - r + 1);
        const resolutionSubbands = [];
        // three sub-bands (HL, LH and HH) with rest of decompositions
        subband = {};
        subband.type = "HL";
        subband.tbx0 = Math.ceil(component.tcx0 / bscale - 0.5);
        subband.tby0 = Math.ceil(component.tcy0 / bscale);
        subband.tbx1 = Math.ceil(component.tcx1 / bscale - 0.5);
        subband.tby1 = Math.ceil(component.tcy1 / bscale);
        subband.resolution = resolution;
        buildCodeblocks(context, subband, blocksDimensions);
        subbands.push(subband);
        resolutionSubbands.push(subband);

        subband = {};
        subband.type = "LH";
        subband.tbx0 = Math.ceil(component.tcx0 / bscale);
        subband.tby0 = Math.ceil(component.tcy0 / bscale - 0.5);
        subband.tbx1 = Math.ceil(component.tcx1 / bscale);
        subband.tby1 = Math.ceil(component.tcy1 / bscale - 0.5);
        subband.resolution = resolution;
        buildCodeblocks(context, subband, blocksDimensions);
        subbands.push(subband);
        resolutionSubbands.push(subband);

        subband = {};
        subband.type = "HH";
        subband.tbx0 = Math.ceil(component.tcx0 / bscale - 0.5);
        subband.tby0 = Math.ceil(component.tcy0 / bscale - 0.5);
        subband.tbx1 = Math.ceil(component.tcx1 / bscale - 0.5);
        subband.tby1 = Math.ceil(component.tcy1 / bscale - 0.5);
        subband.resolution = resolution;
        buildCodeblocks(context, subband, blocksDimensions);
        subbands.push(subband);
        resolutionSubbands.push(subband);

        resolution.subbands = resolutionSubbands;
      }
    }
    component.resolutions = resolutions;
    component.subbands = subbands;
  }
  // Generate the packets sequence
  const progressionOrder = tile.codingStyleDefaultParameters.progressionOrder;
  console.error("progressionOrder is ", progressionOrder);
  switch (progressionOrder) {
    case 0:
      tile.packetsIterator = new LayerResolutionComponentPositionIterator(
        context
      );
      break;
    case 1:
      tile.packetsIterator = new ResolutionLayerComponentPositionIterator(
        context
      );
      break;
    case 2:
      tile.packetsIterator = new ResolutionPositionComponentLayerIterator(
        context
      );
      break;
    case 3:
      tile.packetsIterator = new PositionComponentResolutionLayerIterator(
        context
      );
      break;
    case 4:
      tile.packetsIterator = new ComponentPositionResolutionLayerIterator(
        context
      );
      break;
    default:
      throw new JpxError(`Unsupported progression order ${progressionOrder}`);
  }
}
function parseTilePackets(context, data, offset, dataLength) {
  console.log("parseTilePackets . ");
  console.log("context is ", context);
  console.log("offset is ", offset);
  console.log("dataLength is ", dataLength);
  let position = 0;
  let buffer,
    bufferSize = 0,
    skipNextBit = false;
  function readBits(count) {
    console.log("readBits . ");
    console.log("offset is ", offset);
    while (bufferSize < count) {
      console.log("position is ", position);
      const b = data[offset + position];
      console.log("data[" + (offset + position) + "], is ", b);
      // if (offset === 217 && position === 3107) {
      //   debugger;
      // }
      position++;
      if (skipNextBit) {
        buffer = (buffer << 7) | b;
        bufferSize += 7;
        skipNextBit = false;
      } else {
        buffer = (buffer << 8) | b;
        bufferSize += 8;
      }
      if (b === 0xff) {
        skipNextBit = true;
      }
    }
    bufferSize -= count;
    return (buffer >>> bufferSize) & ((1 << count) - 1);
  }
  function skipMarkerIfEqual(value) {
    if (
      data[offset + position - 1] === 0xff &&
      data[offset + position] === value
    ) {
      skipBytes(1);
      return true;
    } else if (
      data[offset + position] === 0xff &&
      data[offset + position + 1] === value
    ) {
      skipBytes(2);
      return true;
    }
    return false;
  }
  function skipBytes(count) {
    position += count;
  }
  function alignToByte() {
    bufferSize = 0;
    if (skipNextBit) {
      position++;
      skipNextBit = false;
    }
  }
  function readCodingpasses() {
    if (readBits(1) === 0) {
      return 1;
    }
    if (readBits(1) === 0) {
      return 2;
    }
    let value = readBits(2);
    if (value < 3) {
      return value + 3;
    }
    value = readBits(5);
    if (value < 31) {
      return value + 6;
    }
    value = readBits(7);
    return value + 37;
  }
  const tileIndex = context.currentTile.index;
  const tile = context.tiles[tileIndex];
  const sopMarkerUsed = context.COD.sopMarkerUsed;
  const ephMarkerUsed = context.COD.ephMarkerUsed;
  const packetsIterator = tile.packetsIterator;
  let n = 0;
  while (position < dataLength) {
    if (n === 9) {
      console.error("position is  n === 9 ", position);
    }
    alignToByte();
    if (sopMarkerUsed && skipMarkerIfEqual(0x91)) {
      // Skip also marker segment length and packet sequence ID
      skipBytes(4);
    }
    const packet = packetsIterator.nextPacket();
    if (!readBits(1)) {
      continue;
    }
    const layerNumber = packet.layerNumber,
      queue = [];
    let codeblock;
    for (let i = 0, ii = packet.codeblocks.length; i < ii; i++) {
      codeblock = packet.codeblocks[i];
      let precinct = codeblock.precinct;
      const codeblockColumn = codeblock.cbx - precinct.cbxMin;
      const codeblockRow = codeblock.cby - precinct.cbyMin;
      let codeblockIncluded = false;
      let firstTimeInclusion = false;
      let valueReady, zeroBitPlanesTree;
      if (codeblock.included !== undefined) {
        codeblockIncluded = !!readBits(1);
      } else {
        // reading inclusion tree
        precinct = codeblock.precinct;
        let inclusionTree;
        if (precinct.inclusionTree !== undefined) {
          inclusionTree = precinct.inclusionTree;
        } else {
          // building inclusion and zero bit-planes trees
          const width = precinct.cbxMax - precinct.cbxMin + 1;
          const height = precinct.cbyMax - precinct.cbyMin + 1;
          inclusionTree = new InclusionTree(width, height, layerNumber);
          zeroBitPlanesTree = new TagTree(width, height);
          precinct.inclusionTree = inclusionTree;
          precinct.zeroBitPlanesTree = zeroBitPlanesTree;
          for (let l = 0; l < layerNumber; l++) {
            if (readBits(1) !== 0) {
              throw new JpxError("Invalid tag tree");
            }
          }
        }

        if (inclusionTree.reset(codeblockColumn, codeblockRow, layerNumber)) {
          // eslint-disable-next-line no-constant-condition
          while (true) {
            const flag = readBits(1);
            console.error("readBits(1)", flag);
            if (flag) {
              valueReady = !inclusionTree.nextLevel();
              console.log("valueReady is ", valueReady);
              if (valueReady) {
                codeblock.included = true;
                codeblockIncluded = firstTimeInclusion = true;
                break;
              }
            } else {
              console.log("flag is false . ");
              inclusionTree.incrementValue(layerNumber);
              break;
            }
          }
        }
      }
      console.log("codeblockIncluded is ", codeblockIncluded);
      if (!codeblockIncluded) {
        console.error("!codeblockIncluded is true . ");
        continue;
      }
      if (firstTimeInclusion) {
        zeroBitPlanesTree = precinct.zeroBitPlanesTree;
        zeroBitPlanesTree.reset(codeblockColumn, codeblockRow);
        // eslint-disable-next-line no-constant-condition
        while (true) {
          if (readBits(1)) {
            valueReady = !zeroBitPlanesTree.nextLevel();
            if (valueReady) {
              break;
            }
          } else {
            zeroBitPlanesTree.incrementValue();
          }
        }
        codeblock.zeroBitPlanes = zeroBitPlanesTree.value;
      }
      const codingpasses = readCodingpasses();
      while (readBits(1)) {
        codeblock.Lblock++;
      }
      const codingpassesLog2 = log2(codingpasses);
      // rounding down log2
      const bits =
        (codingpasses < 1 << codingpassesLog2
          ? codingpassesLog2 - 1
          : codingpassesLog2) + codeblock.Lblock;
      const codedDataLength = readBits(bits);
      queue.push({
        codeblock,
        codingpasses,
        dataLength: codedDataLength
      });
    }
    alignToByte();
    if (ephMarkerUsed) {
      skipMarkerIfEqual(0x92);
    }
    while (queue.length > 0) {
      const packetItem = queue.shift();
      codeblock = packetItem.codeblock;
      if (codeblock.data === undefined) {
        codeblock.data = [];
      }
      codeblock.data.push({
        data,
        start: offset + position,
        end: offset + position + packetItem.dataLength,
        codingpasses: packetItem.codingpasses
      });
      position += packetItem.dataLength;
    }
    console.log("position is " + n++ + "  ", position);
  }
  console.log("position is ", position);
  return position;
}

function copyCoefficients(
  coefficients,
  levelWidth,
  levelHeight,
  subband,
  delta,
  mb,
  reversible,
  segmentationSymbolUsed,
  resetContextProbabilities
) {
  const x0 = subband.tbx0;
  const y0 = subband.tby0;
  const width = subband.tbx1 - subband.tbx0;
  const codeblocks = subband.codeblocks;
  const right = subband.type.charAt(0) === "H" ? 1 : 0;
  const bottom = subband.type.charAt(1) === "H" ? levelWidth : 0;

  for (let i = 0, ii = codeblocks.length; i < ii; ++i) {
    const codeblock = codeblocks[i];
    const blockWidth = codeblock.tbx1_ - codeblock.tbx0_;
    const blockHeight = codeblock.tby1_ - codeblock.tby0_;
    if (blockWidth === 0 || blockHeight === 0) {
      continue;
    }
    if (codeblock.data === undefined) {
      continue;
    }

    const bitModel = new BitModel(
      blockWidth,
      blockHeight,
      codeblock.subbandType,
      codeblock.zeroBitPlanes,
      mb
    );
    let currentCodingpassType = 2; // first bit plane starts from cleanup

    // collect data
    const data = codeblock.data;
    let totalLength = 0,
      codingpasses = 0;
    let j, jj, dataItem;
    for (j = 0, jj = data.length; j < jj; j++) {
      dataItem = data[j];
      totalLength += dataItem.end - dataItem.start;
      codingpasses += dataItem.codingpasses;
    }
    const encodedData = new Uint8Array(totalLength);
    let position = 0;
    for (j = 0, jj = data.length; j < jj; j++) {
      dataItem = data[j];
      const chunk = dataItem.data.subarray(dataItem.start, dataItem.end);
      encodedData.set(chunk, position);
      position += chunk.length;
    }
    // decoding the item
    const decoder = new ArithmeticDecoder(encodedData, 0, totalLength);
    bitModel.setDecoder(decoder);

    for (j = 0; j < codingpasses; j++) {
      switch (currentCodingpassType) {
        case 0:
          bitModel.runSignificancePropagationPass();
          break;
        case 1:
          bitModel.runMagnitudeRefinementPass();
          break;
        case 2:
          bitModel.runCleanupPass();
          if (segmentationSymbolUsed) {
            bitModel.checkSegmentationSymbol();
          }
          break;
      }

      if (resetContextProbabilities) {
        bitModel.reset();
      }

      currentCodingpassType = (currentCodingpassType + 1) % 3;
    }

    let offset = codeblock.tbx0_ - x0 + (codeblock.tby0_ - y0) * width;
    const sign = bitModel.coefficentsSign;
    const magnitude = bitModel.coefficentsMagnitude;
    const bitsDecoded = bitModel.bitsDecoded;
    const magnitudeCorrection = reversible ? 0 : 0.5;
    let k, n, nb;
    position = 0;
    // Do the interleaving of Section F.3.3 here, so we do not need
    // to copy later. LL level is not interleaved, just copied.
    const interleave = subband.type !== "LL";
    for (j = 0; j < blockHeight; j++) {
      const row = (offset / width) | 0; // row in the non-interleaved subband
      const levelOffset = 2 * row * (levelWidth - width) + right + bottom;
      for (k = 0; k < blockWidth; k++) {
        n = magnitude[position];
        if (n !== 0) {
          n = (n + magnitudeCorrection) * delta;
          if (sign[position] !== 0) {
            n = -n;
          }
          nb = bitsDecoded[position];
          const pos = interleave ? levelOffset + (offset << 1) : offset;
          if (reversible && nb >= mb) {
            coefficients[pos] = n;
          } else {
            coefficients[pos] = n * (1 << (mb - nb));
          }
        }
        offset++;
        position++;
      }
      offset += width - blockWidth;
    }
  }
}
function transformTile(context, tile, c) {
  const component = tile.components[c];
  const codingStyleParameters = component.codingStyleParameters;
  const quantizationParameters = component.quantizationParameters;
  const decompositionLevelsCount =
    codingStyleParameters.decompositionLevelsCount;
  const spqcds = quantizationParameters.SPqcds;
  const scalarExpounded = quantizationParameters.scalarExpounded;
  const guardBits = quantizationParameters.guardBits;
  const segmentationSymbolUsed = codingStyleParameters.segmentationSymbolUsed;
  const resetContextProbabilities =
    codingStyleParameters.resetContextProbabilities;
  const precision = context.components[c].precision;

  const reversible = codingStyleParameters.reversibleTransformation;
  const transform = reversible
    ? new ReversibleTransform()
    : new IrreversibleTransform();

  const subbandCoefficients = [];
  let b = 0;
  for (let i = 0; i <= decompositionLevelsCount; i++) {
    const resolution = component.resolutions[i];

    const width = resolution.trx1 - resolution.trx0;
    const height = resolution.try1 - resolution.try0;
    // Allocate space for the whole sublevel.
    const coefficients = new Float32Array(width * height);

    for (let j = 0, jj = resolution.subbands.length; j < jj; j++) {
      let mu, epsilon;
      if (!scalarExpounded) {
        // formula E-5
        mu = spqcds[0].mu;
        epsilon = spqcds[0].epsilon + (i > 0 ? 1 - i : 0);
      } else {
        mu = spqcds[b].mu;
        epsilon = spqcds[b].epsilon;
        b++;
      }

      const subband = resolution.subbands[j];
      const gainLog2 = SubbandsGainLog2[subband.type];

      // calculate quantization coefficient (Section E.1.1.1)
      const delta = reversible
        ? 1
        : 2 ** (precision + gainLog2 - epsilon) * (1 + mu / 2048);
      const mb = guardBits + epsilon - 1;

      // In the first resolution level, copyCoefficients will fill the
      // whole array with coefficients. In the succeeding passes,
      // copyCoefficients will consecutively fill in the values that belong
      // to the interleaved positions of the HL, LH, and HH coefficients.
      // The LL coefficients will then be interleaved in Transform.iterate().
      copyCoefficients(
        coefficients,
        width,
        height,
        subband,
        delta,
        mb,
        reversible,
        segmentationSymbolUsed,
        resetContextProbabilities
      );
    }
    subbandCoefficients.push({
      width,
      height,
      items: coefficients
    });
  }

  const result = transform.calculate(
    subbandCoefficients,
    component.tcx0,
    component.tcy0
  );
  return {
    left: component.tcx0,
    top: component.tcy0,
    width: result.width,
    height: result.height,
    items: result.items
  };
}
function transformComponents(context) {
  console.log("transformComponents . ");
  console.log("context is ", context);
  const siz = context.SIZ;
  const components = context.components;
  const componentsCount = siz.Csiz;
  const resultImages = [];
  for (let i = 0, ii = context.tiles.length; i < ii; i++) {
    const tile = context.tiles[i];
    const transformedTiles = [];
    for (let c = 0; c < componentsCount; c++) {
      transformedTiles[c] = transformTile(context, tile, c);
    }
    const tile0 = transformedTiles[0];
    const out = new Uint8ClampedArray(tile0.items.length * componentsCount);
    const result = {
      left: tile0.left,
      top: tile0.top,
      width: tile0.width,
      height: tile0.height,
      items: out
    };

    // Section G.2.2 Inverse multi component transform
    let shift, offset;
    let pos = 0,
      j,
      jj,
      y0,
      y1,
      y2;
    if (tile.codingStyleDefaultParameters.multipleComponentTransform) {
      const fourComponents = componentsCount === 4;
      const y0items = transformedTiles[0].items;
      const y1items = transformedTiles[1].items;
      const y2items = transformedTiles[2].items;
      const y3items = fourComponents ? transformedTiles[3].items : null;

      // HACK: The multiple component transform formulas below assume that
      // all components have the same precision. With this in mind, we
      // compute shift and offset only once.
      shift = components[0].precision - 8;
      offset = (128 << shift) + 0.5;

      const component0 = tile.components[0];
      const alpha01 = componentsCount - 3;
      jj = y0items.length;
      if (!component0.codingStyleParameters.reversibleTransformation) {
        // inverse irreversible multiple component transform
        for (j = 0; j < jj; j++, pos += alpha01) {
          y0 = y0items[j] + offset;
          y1 = y1items[j];
          y2 = y2items[j];
          out[pos++] = (y0 + 1.402 * y2) >> shift;
          out[pos++] = (y0 - 0.34413 * y1 - 0.71414 * y2) >> shift;
          out[pos++] = (y0 + 1.772 * y1) >> shift;
        }
      } else {
        // inverse reversible multiple component transform
        for (j = 0; j < jj; j++, pos += alpha01) {
          y0 = y0items[j] + offset;
          y1 = y1items[j];
          y2 = y2items[j];
          const g = y0 - ((y2 + y1) >> 2);

          out[pos++] = (g + y2) >> shift;
          out[pos++] = g >> shift;
          out[pos++] = (g + y1) >> shift;
        }
      }
      if (fourComponents) {
        for (j = 0, pos = 3; j < jj; j++, pos += 4) {
          out[pos] = (y3items[j] + offset) >> shift;
        }
      }
    } else {
      // no multi-component transform
      for (let c = 0; c < componentsCount; c++) {
        const items = transformedTiles[c].items;
        shift = components[c].precision - 8;
        offset = (128 << shift) + 0.5;
        for (pos = c, j = 0, jj = items.length; j < jj; j++) {
          out[pos] = (items[j] + offset) >> shift;
          pos += componentsCount;
        }
      }
    }
    resultImages.push(result);
  }
  return resultImages;
}

export class JpxImage {
  constructor() {
    this.failOnCorruptedImage = false;
  }

  parse(data) {
    console.log("data is ", data);
    console.log("parse . ");
    const head = readUint16(data, 0);
    // No box header, immediate start of codestream (SOC)
    if (head === 0xff4f) {
      console.log("head === 0xff4f");
      this.parseCodestream(data, 0, data.length);
      return;
    }

    const length = data.length;
    console.log("length is ", length);
    let position = 0;
    while (position < length) {
      let headerSize = 8;
      let lbox = readUint32(data, position);
      console.log("lbox is ", lbox);
      const tbox = readUint32(data, position + 4);
      position += headerSize;
      if (lbox === 1) {
        // XLBox: read UInt64 according to spec.
        // JavaScript's int precision of 53 bit should be sufficient here.
        lbox =
          readUint32(data, position) * 4294967296 +
          readUint32(data, position + 4);
        position += 8;
        headerSize += 8;
      }
      if (lbox === 0) {
        lbox = length - position + headerSize;
      }
      if (lbox < headerSize) {
        throw new JpxError("Invalid box field size");
      }
      console.log("lbox is ", lbox, " headerSize is ", headerSize);
      const dataLength = lbox - headerSize;
      console.log("dataLenth is ", dataLength);
      let jumpDataLength = true;
      let method;
      let headerType;
      switch (tbox) {
        case 0x6a703268: // 'jp2h'
          jumpDataLength = false; // parsing child boxes
          break;
        case 0x636f6c72: // 'colr'
          // Colorspaces are not used, the CS from the PDF is used.
          method = data[position];
          if (method === 1) {
            // enumerated colorspace
            const colorspace = readUint32(data, position + 3);
            switch (colorspace) {
              case 16: // this indicates a sRGB colorspace
              case 17: // this indicates a grayscale colorspace
              case 18: // this indicates a YUV colorspace
                break;
              default:
                warn("Unknown colorspace " + colorspace);
                break;
            }
          } else if (method === 2) {
            info("ICC profile not supported");
          }
          break;
        case 0x6a703263: // 'jp2c'
          console.log("jp2c . ");
          console.log("data is ", data);
          console.log("position is ", position);
          console.log("dataLength is ", dataLength);
          this.parseCodestream(data, position, position + dataLength);
          break;
        case 0x6a502020: // 'jP\024\024'
          if (readUint32(data, position) !== 0x0d0a870a) {
            warn("Invalid JP2 signature");
          }
          break;
        // The following header types are valid but currently not used:
        case 0x6a501a1a: // 'jP\032\032'
        case 0x66747970: // 'ftyp'
        case 0x72726571: // 'rreq'
        case 0x72657320: // 'res '
        case 0x69686472: // 'ihdr'
          break;
        default:
          headerType = String.fromCharCode(
            (tbox >> 24) & 0xff,
            (tbox >> 16) & 0xff,
            (tbox >> 8) & 0xff,
            tbox & 0xff
          );
          warn(`Unsupported header type ${tbox} (${headerType}).`);
          break;
      }
      if (jumpDataLength) {
        position += dataLength;
      }
    }
  }

  // parseImageProperties(stream) {
  //   let newByte = stream.getByte();
  //   while (newByte >= 0) {
  //     const oldByte = newByte;
  //     newByte = stream.getByte();
  //     const code = (oldByte << 8) | newByte;
  //     // Image and tile size (SIZ)
  //     if (code === 0xff51) {
  //       stream.skip(4);
  //       const Xsiz = stream.getInt32() >>> 0; // Byte 4
  //       const Ysiz = stream.getInt32() >>> 0; // Byte 8
  //       const XOsiz = stream.getInt32() >>> 0; // Byte 12
  //       const YOsiz = stream.getInt32() >>> 0; // Byte 16
  //       stream.skip(16);
  //       const Csiz = stream.getUint16(); // Byte 36
  //       this.width = Xsiz - XOsiz;
  //       this.height = Ysiz - YOsiz;
  //       this.componentsCount = Csiz;
  //       // Results are always returned as `Uint8ClampedArray`s.
  //       this.bitsPerComponent = 8;
  //       return;
  //     }
  //   }
  //   throw new JpxError("No size marker found in JPX stream");
  // }

  parseCodestream(data, start, end) {
    console.log("parseCodestream . ");
    console.log("start is ", start);
    console.log("end is ", end);
    const context = {};
    let doNotRecover = false;
    try {
      let position = start;
      while (position + 1 < end) {
        const code = readUint16(data, position);
        position += 2;

        let length = 0,
          j,
          sqcd,
          spqcds,
          spqcdSize,
          scalarExpounded,
          tile;
        let siz;
        let componentsCount;
        let components;
        let qcd;
        let qcc;
        let cqcc;
        let cod;
        let scod;
        let blockStyle;
        let unsupported;
        switch (code) {
          case 0xff4f: // Start of codestream (SOC)
            console.log("Start of codestream (SOC)");
            context.mainHeader = true;
            break;
          case 0xffd9: // End of codestream (EOC)
            console.log("End of codestream(EOC)");
            break;
          case 0xff51: // Image and tile size (SIZ)
            length = readUint16(data, position);
            siz = {};
            siz.Xsiz = readUint32(data, position + 4);
            siz.Ysiz = readUint32(data, position + 8);
            siz.XOsiz = readUint32(data, position + 12);
            siz.YOsiz = readUint32(data, position + 16);
            siz.XTsiz = readUint32(data, position + 20);
            siz.YTsiz = readUint32(data, position + 24);
            siz.XTOsiz = readUint32(data, position + 28);
            siz.YTOsiz = readUint32(data, position + 32);
            componentsCount = readUint16(data, position + 36);
            siz.Csiz = componentsCount;
            components = [];
            j = position + 38;
            for (let i = 0; i < componentsCount; i++) {
              const component = {
                precision: (data[j] & 0x7f) + 1,
                isSigned: !!(data[j] & 0x80),
                XRsiz: data[j + 1],
                YRsiz: data[j + 2]
              };
              j += 3;
              calculateComponentDimensions(component, siz);
              components.push(component);
            }
            context.SIZ = siz;
            context.components = components;
            calculateTileGrids(context, components);
            context.QCC = [];
            context.COC = [];
            break;
          case 0xff5c: // Quantization default (QCD)
            console.log("Quantization default (QCD)");
            length = readUint16(data, position);
            qcd = {};
            j = position + 2;
            sqcd = data[j++];
            switch (sqcd & 0x1f) {
              case 0:
                spqcdSize = 8;
                scalarExpounded = true;
                break;
              case 1:
                spqcdSize = 16;
                scalarExpounded = false;
                break;
              case 2:
                spqcdSize = 16;
                scalarExpounded = true;
                break;
              default:
                throw new Error("Invalid SQcd value " + sqcd);
            }
            qcd.noQuantization = spqcdSize === 8;
            qcd.scalarExpounded = scalarExpounded;
            qcd.guardBits = sqcd >> 5;
            spqcds = [];
            while (j < length + position) {
              const spqcd = {};
              if (spqcdSize === 8) {
                spqcd.epsilon = data[j++] >> 3;
                spqcd.mu = 0;
              } else {
                spqcd.epsilon = data[j] >> 3;
                spqcd.mu = ((data[j] & 0x7) << 8) | data[j + 1];
                j += 2;
              }
              spqcds.push(spqcd);
            }
            qcd.SPqcds = spqcds;
            if (context.mainHeader) {
              context.QCD = qcd;
            } else {
              context.currentTile.QCD = qcd;
              context.currentTile.QCC = [];
            }
            break;
          case 0xff5d: // Quantization component (QCC)
            length = readUint16(data, position);
            qcc = {};
            j = position + 2;
            // let cqcc;
            if (context.SIZ.Csiz < 257) {
              cqcc = data[j++];
            } else {
              cqcc = readUint16(data, j);
              j += 2;
            }
            sqcd = data[j++];
            switch (sqcd & 0x1f) {
              case 0:
                spqcdSize = 8;
                scalarExpounded = true;
                break;
              case 1:
                spqcdSize = 16;
                scalarExpounded = false;
                break;
              case 2:
                spqcdSize = 16;
                scalarExpounded = true;
                break;
              default:
                throw new Error("Invalid SQcd value " + sqcd);
            }
            qcc.noQuantization = spqcdSize === 8;
            qcc.scalarExpounded = scalarExpounded;
            qcc.guardBits = sqcd >> 5;
            spqcds = [];
            while (j < length + position) {
              const spqcd = {};
              if (spqcdSize === 8) {
                spqcd.epsilon = data[j++] >> 3;
                spqcd.mu = 0;
              } else {
                spqcd.epsilon = data[j] >> 3;
                spqcd.mu = ((data[j] & 0x7) << 8) | data[j + 1];
                j += 2;
              }
              spqcds.push(spqcd);
            }
            qcc.SPqcds = spqcds;
            if (context.mainHeader) {
              context.QCC[cqcc] = qcc;
            } else {
              context.currentTile.QCC[cqcc] = qcc;
            }
            break;
          case 0xff52: // Coding style default (COD)
            length = readUint16(data, position);
            cod = {};
            j = position + 2;
            scod = data[j++];
            cod.entropyCoderWithCustomPrecincts = !!(scod & 1);
            cod.sopMarkerUsed = !!(scod & 2);
            cod.ephMarkerUsed = !!(scod & 4);
            cod.progressionOrder = data[j++];
            cod.layersCount = readUint16(data, j);
            j += 2;
            cod.multipleComponentTransform = data[j++];

            cod.decompositionLevelsCount = data[j++];
            cod.xcb = (data[j++] & 0xf) + 2;
            cod.ycb = (data[j++] & 0xf) + 2;
            blockStyle = data[j++];
            cod.selectiveArithmeticCodingBypass = !!(blockStyle & 1);
            cod.resetContextProbabilities = !!(blockStyle & 2);
            cod.terminationOnEachCodingPass = !!(blockStyle & 4);
            cod.verticallyStripe = !!(blockStyle & 8);
            cod.predictableTermination = !!(blockStyle & 16);
            cod.segmentationSymbolUsed = !!(blockStyle & 32);
            cod.reversibleTransformation = data[j++];
            if (cod.entropyCoderWithCustomPrecincts) {
              const precinctsSizes = [];
              while (j < length + position) {
                const precinctsSize = data[j++];
                precinctsSizes.push({
                  PPx: precinctsSize & 0xf,
                  PPy: precinctsSize >> 4
                });
              }
              cod.precinctsSizes = precinctsSizes;
            }
            unsupported = [];
            if (cod.selectiveArithmeticCodingBypass) {
              unsupported.push("selectiveArithmeticCodingBypass");
            }
            if (cod.terminationOnEachCodingPass) {
              unsupported.push("terminationOnEachCodingPass");
            }
            if (cod.verticallyStripe) {
              unsupported.push("verticallyStripe");
            }
            if (cod.predictableTermination) {
              unsupported.push("predictableTermination");
            }
            if (unsupported.length > 0) {
              doNotRecover = true;
              warn(`JPX: Unsupported COD options (${unsupported.join(", ")}).`);
            }
            if (context.mainHeader) {
              context.COD = cod;
            } else {
              context.currentTile.COD = cod;
              context.currentTile.COC = [];
            }
            break;
          case 0xff90: // Start of tile-part (SOT)
            console.log("Start of tile-part (SOT)");
            length = readUint16(data, position);
            tile = {};
            tile.index = readUint16(data, position + 2);
            tile.length = readUint32(data, position + 4);
            tile.dataEnd = tile.length + position - 2;
            tile.partIndex = data[position + 8];
            tile.partsCount = data[position + 9];

            context.mainHeader = false;
            if (tile.partIndex === 0) {
              // reset component specific settings
              tile.COD = context.COD;
              tile.COC = context.COC.slice(0); // clone of the global COC
              tile.QCD = context.QCD;
              tile.QCC = context.QCC.slice(0); // clone of the global COC
            }
            context.currentTile = tile;
            break;
          case 0xff93: // Start of data (SOD)
            console.log("Start of data (SOD)");
            tile = context.currentTile;
            if (tile.partIndex === 0) {
              initializeTile(context, tile.index);
              buildPackets(context);
            }

            // moving to the end of the data
            length = tile.dataEnd - position;
            parseTilePackets(context, data, position, length);
            break;
          case 0xff53: // Coding style component (COC)
            warn("JPX: Codestream code 0xFF53 (COC) is not implemented.");
          /* falls through */
          case 0xff55: // Tile-part lengths, main header (TLM)
          case 0xff57: // Packet length, main header (PLM)
          case 0xff58: // Packet length, tile-part header (PLT)
          case 0xff64: // Comment (COM)
            length = readUint16(data, position);
            // skipping content
            break;
          default:
            throw new Error("Unknown codestream code: " + code.toString(16));
        }
        position += length;
      }
    } catch (e) {
      if (doNotRecover || this.failOnCorruptedImage) {
        throw new JpxError(e.message);
      } else {
        warn(`JPX: Trying to recover from: "${e.message}".`);
      }
    }
    console.log("context is ", context);
    this.tiles = transformComponents(context);
    this.width = context.SIZ.Xsiz - context.SIZ.XOsiz;
    this.height = context.SIZ.Ysiz - context.SIZ.YOsiz;
    this.componentsCount = context.SIZ.Csiz;
  }
}
