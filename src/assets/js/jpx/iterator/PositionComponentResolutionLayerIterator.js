import {
  createPacket,
  getPrecinctIndexIfExist,
  getPrecinctSizesInImageScale
} from "assets/js/jpx/iterator/util";
import { JpxError } from "assets/js/jpx/JpxError";

export class PositionComponentResolutionLayerIterator {
  constructor(context) {
    const siz = context.SIZ;
    const tileIndex = context.currentTile.index;
    const tile = context.tiles[tileIndex];
    const layersCount = tile.codingStyleDefaultParameters.layersCount;
    const componentsCount = siz.Csiz;
    const precinctsSizes = getPrecinctSizesInImageScale(tile);
    const precinctsIterationSizes = precinctsSizes;
    let l = 0,
      r = 0,
      c = 0,
      px = 0,
      py = 0;

    this.nextPacket = function JpxImage_nextPacket() {
      // Section B.12.1.4 Position-component-resolution-layer
      for (; py < precinctsIterationSizes.maxNumHigh; py++) {
        for (; px < precinctsIterationSizes.maxNumWide; px++) {
          for (; c < componentsCount; c++) {
            const component = tile.components[c];
            const decompositionLevelsCount =
              component.codingStyleParameters.decompositionLevelsCount;
            for (; r <= decompositionLevelsCount; r++) {
              const resolution = component.resolutions[r];
              const sizeInImageScale =
                precinctsSizes.components[c].resolutions[r];
              const k = getPrecinctIndexIfExist(
                px,
                py,
                sizeInImageScale,
                precinctsIterationSizes,
                resolution
              );
              if (k === null) {
                continue;
              }
              for (; l < layersCount; ) {
                const packet = createPacket(resolution, k, l);
                l++;
                return packet;
              }
              l = 0;
            }
            r = 0;
          }
          c = 0;
        }
        px = 0;
      }
      throw new JpxError("Out of packets");
    };
  }
}
