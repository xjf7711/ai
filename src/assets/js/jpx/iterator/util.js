export function createPacket(resolution, precinctNumber, layerNumber) {
  const precinctCodeblocks = [];
  // Section B.10.8 Order of info in packet
  const subbands = resolution.subbands;
  // sub-bands already ordered in 'LL', 'HL', 'LH', and 'HH' sequence
  for (let i = 0, ii = subbands.length; i < ii; i++) {
    const subband = subbands[i];
    const codeblocks = subband.codeblocks;
    for (let j = 0, jj = codeblocks.length; j < jj; j++) {
      const codeblock = codeblocks[j];
      if (codeblock.precinctNumber !== precinctNumber) {
        continue;
      }
      precinctCodeblocks.push(codeblock);
    }
  }
  return {
    layerNumber,
    codeblocks: precinctCodeblocks
  };
}
export function getPrecinctIndexIfExist(
  pxIndex,
  pyIndex,
  sizeInImageScale,
  precinctIterationSizes,
  resolution
) {
  const posX = pxIndex * precinctIterationSizes.minWidth;
  const posY = pyIndex * precinctIterationSizes.minHeight;
  if (
    posX % sizeInImageScale.width !== 0 ||
    posY % sizeInImageScale.height !== 0
  ) {
    return null;
  }
  const startPrecinctRowIndex =
    (posY / sizeInImageScale.width) *
    resolution.precinctParameters.numprecinctswide;
  return posX / sizeInImageScale.height + startPrecinctRowIndex;
}
export function getPrecinctSizesInImageScale(tile) {
  const componentsCount = tile.components.length;
  let minWidth = Number.MAX_VALUE;
  let minHeight = Number.MAX_VALUE;
  let maxNumWide = 0;
  let maxNumHigh = 0;
  const sizePerComponent = new Array(componentsCount);
  for (let c = 0; c < componentsCount; c++) {
    const component = tile.components[c];
    const decompositionLevelsCount =
      component.codingStyleParameters.decompositionLevelsCount;
    const sizePerResolution = new Array(decompositionLevelsCount + 1);
    let minWidthCurrentComponent = Number.MAX_VALUE;
    let minHeightCurrentComponent = Number.MAX_VALUE;
    let maxNumWideCurrentComponent = 0;
    let maxNumHighCurrentComponent = 0;
    let scale = 1;
    for (let r = decompositionLevelsCount; r >= 0; --r) {
      const resolution = component.resolutions[r];
      const widthCurrentResolution =
        scale * resolution.precinctParameters.precinctWidth;
      const heightCurrentResolution =
        scale * resolution.precinctParameters.precinctHeight;
      minWidthCurrentComponent = Math.min(
        minWidthCurrentComponent,
        widthCurrentResolution
      );
      minHeightCurrentComponent = Math.min(
        minHeightCurrentComponent,
        heightCurrentResolution
      );
      maxNumWideCurrentComponent = Math.max(
        maxNumWideCurrentComponent,
        resolution.precinctParameters.numprecinctswide
      );
      maxNumHighCurrentComponent = Math.max(
        maxNumHighCurrentComponent,
        resolution.precinctParameters.numprecinctshigh
      );
      sizePerResolution[r] = {
        width: widthCurrentResolution,
        height: heightCurrentResolution
      };
      scale <<= 1;
    }
    minWidth = Math.min(minWidth, minWidthCurrentComponent);
    minHeight = Math.min(minHeight, minHeightCurrentComponent);
    maxNumWide = Math.max(maxNumWide, maxNumWideCurrentComponent);
    maxNumHigh = Math.max(maxNumHigh, maxNumHighCurrentComponent);
    sizePerComponent[c] = {
      resolutions: sizePerResolution,
      minWidth: minWidthCurrentComponent,
      minHeight: minHeightCurrentComponent,
      maxNumWide: maxNumWideCurrentComponent,
      maxNumHigh: maxNumHighCurrentComponent
    };
  }
  return {
    components: sizePerComponent,
    minWidth,
    minHeight,
    maxNumWide,
    maxNumHigh
  };
}
