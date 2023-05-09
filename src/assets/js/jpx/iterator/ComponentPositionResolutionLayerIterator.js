import {
  createPacket,
  getPrecinctIndexIfExist,
  getPrecinctSizesInImageScale
} from "assets/js/jpx/iterator/util";
import { JpxError } from "assets/js/jpx/JpxError";
export class ComponentPositionResolutionLayerIterator {
  constructor(context) {
    const siz = context.SIZ;
    const tileIndex = context.currentTile.index;
    const tile = context.tiles[tileIndex];
    const layersCount = tile.codingStyleDefaultParameters.layersCount;
    const componentsCount = siz.Csiz;
    const precinctsSizes = getPrecinctSizesInImageScale(tile);
    let l = 0,
      r = 0,
      c = 0,
      px = 0,
      py = 0;

    this.nextPacket = function JpxImage_nextPacket() {
      // Section B.12.1.5 Component-position-resolution-layer
      for (; c < componentsCount; ++c) {
        const component = tile.components[c];
        const precinctsIterationSizes = precinctsSizes.components[c];
        const decompositionLevelsCount =
          component.codingStyleParameters.decompositionLevelsCount;
        for (; py < precinctsIterationSizes.maxNumHigh; py++) {
          for (; px < precinctsIterationSizes.maxNumWide; px++) {
            for (; r <= decompositionLevelsCount; r++) {
              const resolution = component.resolutions[r];
              const sizeInImageScale = precinctsIterationSizes.resolutions[r];
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
          px = 0;
        }
        py = 0;
      }
      throw new JpxError("Out of packets");
    };
  }
}
