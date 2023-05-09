import { createPacket } from "assets/js/jpx/iterator/util";
import { JpxError } from "assets/js/jpx/JpxError";

export class ResolutionLayerComponentPositionIterator {
  constructor(context) {
    const siz = context.SIZ;
    const tileIndex = context.currentTile.index;
    const tile = context.tiles[tileIndex];
    const layersCount = tile.codingStyleDefaultParameters.layersCount;
    const componentsCount = siz.Csiz;
    let maxDecompositionLevelsCount = 0;
    for (let q = 0; q < componentsCount; q++) {
      maxDecompositionLevelsCount = Math.max(
        maxDecompositionLevelsCount,
        tile.components[q].codingStyleParameters.decompositionLevelsCount
      );
    }

    let r = 0,
      l = 0,
      i = 0,
      k = 0;

    this.nextPacket = function JpxImage_nextPacket() {
      // Section B.12.1.2 Resolution-layer-component-position
      for (; r <= maxDecompositionLevelsCount; r++) {
        for (; l < layersCount; l++) {
          for (; i < componentsCount; i++) {
            const component = tile.components[i];
            if (r > component.codingStyleParameters.decompositionLevelsCount) {
              continue;
            }

            const resolution = component.resolutions[r];
            const numprecincts = resolution.precinctParameters.numprecincts;
            for (; k < numprecincts; ) {
              const packet = createPacket(resolution, k, l);
              k++;
              return packet;
            }
            k = 0;
          }
          i = 0;
        }
        l = 0;
      }
      throw new JpxError("Out of packets");
    };
  }
}
