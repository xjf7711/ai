import { createPacket } from "assets/js/jpx/iterator/util";
import { JpxError } from "assets/js/jpx/JpxError";

export class ResolutionPositionComponentLayerIterator {
  constructor(context) {
    const siz = context.SIZ;
    const tileIndex = context.currentTile.index;
    const tile = context.tiles[tileIndex];
    const layersCount = tile.codingStyleDefaultParameters.layersCount;
    const componentsCount = siz.Csiz;
    let l, r, c, p;
    let maxDecompositionLevelsCount = 0;
    for (c = 0; c < componentsCount; c++) {
      const component = tile.components[c];
      maxDecompositionLevelsCount = Math.max(
        maxDecompositionLevelsCount,
        component.codingStyleParameters.decompositionLevelsCount
      );
    }
    const maxNumPrecinctsInLevel = new Int32Array(
      maxDecompositionLevelsCount + 1
    );
    for (r = 0; r <= maxDecompositionLevelsCount; ++r) {
      let maxNumPrecincts = 0;
      for (c = 0; c < componentsCount; ++c) {
        const resolutions = tile.components[c].resolutions;
        if (r < resolutions.length) {
          maxNumPrecincts = Math.max(
            maxNumPrecincts,
            resolutions[r].precinctParameters.numprecincts
          );
        }
      }
      maxNumPrecinctsInLevel[r] = maxNumPrecincts;
    }
    l = 0;
    r = 0;
    c = 0;
    p = 0;

    this.nextPacket = function JpxImage_nextPacket() {
      // Section B.12.1.3 Resolution-position-component-layer
      for (; r <= maxDecompositionLevelsCount; r++) {
        for (; p < maxNumPrecinctsInLevel[r]; p++) {
          for (; c < componentsCount; c++) {
            const component = tile.components[c];
            if (r > component.codingStyleParameters.decompositionLevelsCount) {
              continue;
            }
            const resolution = component.resolutions[r];
            const numprecincts = resolution.precinctParameters.numprecincts;
            if (p >= numprecincts) {
              continue;
            }
            for (; l < layersCount; ) {
              const packet = createPacket(resolution, p, l);
              l++;
              return packet;
            }
            l = 0;
          }
          c = 0;
        }
        p = 0;
      }
      throw new JpxError("Out of packets");
    };
  }
}
