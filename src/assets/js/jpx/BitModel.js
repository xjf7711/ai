// Section D. Coefficient bit modeling

import { JpxError } from "assets/js/jpx/JpxError";

const UNIFORM_CONTEXT = 17;
const RUNLENGTH_CONTEXT = 18;
// Table D-1
// The index is binary presentation: 0dddvvhh, ddd - sum of Di (0..4),
// vv - sum of Vi (0..2), and hh - sum of Hi (0..2)
const LLAndLHContextsLabel = new Uint8Array([
  0,
  5,
  8,
  0,
  3,
  7,
  8,
  0,
  4,
  7,
  8,
  0,
  0,
  0,
  0,
  0,
  1,
  6,
  8,
  0,
  3,
  7,
  8,
  0,
  4,
  7,
  8,
  0,
  0,
  0,
  0,
  0,
  2,
  6,
  8,
  0,
  3,
  7,
  8,
  0,
  4,
  7,
  8,
  0,
  0,
  0,
  0,
  0,
  2,
  6,
  8,
  0,
  3,
  7,
  8,
  0,
  4,
  7,
  8,
  0,
  0,
  0,
  0,
  0,
  2,
  6,
  8,
  0,
  3,
  7,
  8,
  0,
  4,
  7,
  8
]);
const HLContextLabel = new Uint8Array([
  0,
  3,
  4,
  0,
  5,
  7,
  7,
  0,
  8,
  8,
  8,
  0,
  0,
  0,
  0,
  0,
  1,
  3,
  4,
  0,
  6,
  7,
  7,
  0,
  8,
  8,
  8,
  0,
  0,
  0,
  0,
  0,
  2,
  3,
  4,
  0,
  6,
  7,
  7,
  0,
  8,
  8,
  8,
  0,
  0,
  0,
  0,
  0,
  2,
  3,
  4,
  0,
  6,
  7,
  7,
  0,
  8,
  8,
  8,
  0,
  0,
  0,
  0,
  0,
  2,
  3,
  4,
  0,
  6,
  7,
  7,
  0,
  8,
  8,
  8
]);
const HHContextLabel = new Uint8Array([
  0,
  1,
  2,
  0,
  1,
  2,
  2,
  0,
  2,
  2,
  2,
  0,
  0,
  0,
  0,
  0,
  3,
  4,
  5,
  0,
  4,
  5,
  5,
  0,
  5,
  5,
  5,
  0,
  0,
  0,
  0,
  0,
  6,
  7,
  7,
  0,
  7,
  7,
  7,
  0,
  7,
  7,
  7,
  0,
  0,
  0,
  0,
  0,
  8,
  8,
  8,
  0,
  8,
  8,
  8,
  0,
  8,
  8,
  8,
  0,
  0,
  0,
  0,
  0,
  8,
  8,
  8,
  0,
  8,
  8,
  8,
  0,
  8,
  8,
  8
]);

// eslint-disable-next-line no-shadow
export class BitModel {
  constructor(width, height, subband, zeroBitPlanes, mb) {
    this.width = width;
    this.height = height;

    let contextLabelTable;
    if (subband === "HH") {
      contextLabelTable = HHContextLabel;
    } else if (subband === "HL") {
      contextLabelTable = HLContextLabel;
    } else {
      contextLabelTable = LLAndLHContextsLabel;
    }
    this.contextLabelTable = contextLabelTable;

    const coefficientCount = width * height;

    // coefficients outside the encoding region treated as insignificant
    // add border state cells for significanceState
    this.neighborsSignificance = new Uint8Array(coefficientCount);
    this.coefficentsSign = new Uint8Array(coefficientCount);
    let coefficentsMagnitude;
    if (mb > 14) {
      coefficentsMagnitude = new Uint32Array(coefficientCount);
    } else if (mb > 6) {
      coefficentsMagnitude = new Uint16Array(coefficientCount);
    } else {
      coefficentsMagnitude = new Uint8Array(coefficientCount);
    }
    this.coefficentsMagnitude = coefficentsMagnitude;
    this.processingFlags = new Uint8Array(coefficientCount);

    const bitsDecoded = new Uint8Array(coefficientCount);
    if (zeroBitPlanes !== 0) {
      for (let i = 0; i < coefficientCount; i++) {
        bitsDecoded[i] = zeroBitPlanes;
      }
    }
    this.bitsDecoded = bitsDecoded;

    this.reset();
  }

  setDecoder(decoder) {
    this.decoder = decoder;
  }

  reset() {
    // We have 17 contexts that are accessed via context labels,
    // plus the uniform and runlength context.
    this.contexts = new Int8Array(19);

    // Contexts are packed into 1 byte:
    // highest 7 bits carry the index, lowest bit carries mps
    this.contexts[0] = (4 << 1) | 0;
    this.contexts[UNIFORM_CONTEXT] = (46 << 1) | 0;
    this.contexts[RUNLENGTH_CONTEXT] = (3 << 1) | 0;
  }

  setNeighborsSignificance(row, column, index) {
    const neighborsSignificance = this.neighborsSignificance;
    const width = this.width,
      height = this.height;
    const left = column > 0;
    const right = column + 1 < width;
    let i;

    if (row > 0) {
      i = index - width;
      if (left) {
        neighborsSignificance[i - 1] += 0x10;
      }
      if (right) {
        neighborsSignificance[i + 1] += 0x10;
      }
      neighborsSignificance[i] += 0x04;
    }

    if (row + 1 < height) {
      i = index + width;
      if (left) {
        neighborsSignificance[i - 1] += 0x10;
      }
      if (right) {
        neighborsSignificance[i + 1] += 0x10;
      }
      neighborsSignificance[i] += 0x04;
    }

    if (left) {
      neighborsSignificance[index - 1] += 0x01;
    }
    if (right) {
      neighborsSignificance[index + 1] += 0x01;
    }
    neighborsSignificance[index] |= 0x80;
  }

  runSignificancePropagationPass() {
    const decoder = this.decoder;
    const width = this.width,
      height = this.height;
    const coefficentsMagnitude = this.coefficentsMagnitude;
    const coefficentsSign = this.coefficentsSign;
    const neighborsSignificance = this.neighborsSignificance;
    const processingFlags = this.processingFlags;
    const contexts = this.contexts;
    const labels = this.contextLabelTable;
    const bitsDecoded = this.bitsDecoded;
    const processedInverseMask = ~1;
    const processedMask = 1;
    const firstMagnitudeBitMask = 2;

    for (let i0 = 0; i0 < height; i0 += 4) {
      for (let j = 0; j < width; j++) {
        let index = i0 * width + j;
        for (let i1 = 0; i1 < 4; i1++, index += width) {
          const i = i0 + i1;
          if (i >= height) {
            break;
          }
          // clear processed flag first
          processingFlags[index] &= processedInverseMask;

          if (coefficentsMagnitude[index] || !neighborsSignificance[index]) {
            continue;
          }

          const contextLabel = labels[neighborsSignificance[index]];
          const decision = decoder.readBit(contexts, contextLabel);
          if (decision) {
            const sign = this.decodeSignBit(i, j, index);
            coefficentsSign[index] = sign;
            coefficentsMagnitude[index] = 1;
            this.setNeighborsSignificance(i, j, index);
            processingFlags[index] |= firstMagnitudeBitMask;
          }
          bitsDecoded[index]++;
          processingFlags[index] |= processedMask;
        }
      }
    }
  }

  decodeSignBit(row, column, index) {
    const width = this.width,
      height = this.height;
    const coefficentsMagnitude = this.coefficentsMagnitude;
    const coefficentsSign = this.coefficentsSign;
    let contribution, sign0, sign1, significance1;
    let contextLabel, decoded;

    // calculate horizontal contribution
    significance1 = column > 0 && coefficentsMagnitude[index - 1] !== 0;
    if (column + 1 < width && coefficentsMagnitude[index + 1] !== 0) {
      sign1 = coefficentsSign[index + 1];
      if (significance1) {
        sign0 = coefficentsSign[index - 1];
        contribution = 1 - sign1 - sign0;
      } else {
        contribution = 1 - sign1 - sign1;
      }
    } else if (significance1) {
      sign0 = coefficentsSign[index - 1];
      contribution = 1 - sign0 - sign0;
    } else {
      contribution = 0;
    }
    const horizontalContribution = 3 * contribution;

    // calculate vertical contribution and combine with the horizontal
    significance1 = row > 0 && coefficentsMagnitude[index - width] !== 0;
    if (row + 1 < height && coefficentsMagnitude[index + width] !== 0) {
      sign1 = coefficentsSign[index + width];
      if (significance1) {
        sign0 = coefficentsSign[index - width];
        contribution = 1 - sign1 - sign0 + horizontalContribution;
      } else {
        contribution = 1 - sign1 - sign1 + horizontalContribution;
      }
    } else if (significance1) {
      sign0 = coefficentsSign[index - width];
      contribution = 1 - sign0 - sign0 + horizontalContribution;
    } else {
      contribution = horizontalContribution;
    }

    if (contribution >= 0) {
      contextLabel = 9 + contribution;
      decoded = this.decoder.readBit(this.contexts, contextLabel);
    } else {
      contextLabel = 9 - contribution;
      decoded = this.decoder.readBit(this.contexts, contextLabel) ^ 1;
    }
    return decoded;
  }

  runMagnitudeRefinementPass() {
    const decoder = this.decoder;
    const width = this.width,
      height = this.height;
    const coefficentsMagnitude = this.coefficentsMagnitude;
    const neighborsSignificance = this.neighborsSignificance;
    const contexts = this.contexts;
    const bitsDecoded = this.bitsDecoded;
    const processingFlags = this.processingFlags;
    const processedMask = 1;
    const firstMagnitudeBitMask = 2;
    const length = width * height;
    const width4 = width * 4;

    for (let index0 = 0, indexNext; index0 < length; index0 = indexNext) {
      indexNext = Math.min(length, index0 + width4);
      for (let j = 0; j < width; j++) {
        for (let index = index0 + j; index < indexNext; index += width) {
          // significant but not those that have just become
          if (
            !coefficentsMagnitude[index] ||
            (processingFlags[index] & processedMask) !== 0
          ) {
            continue;
          }

          let contextLabel = 16;
          if ((processingFlags[index] & firstMagnitudeBitMask) !== 0) {
            processingFlags[index] ^= firstMagnitudeBitMask;
            // first refinement
            const significance = neighborsSignificance[index] & 127;
            contextLabel = significance === 0 ? 15 : 14;
          }

          const bit = decoder.readBit(contexts, contextLabel);
          coefficentsMagnitude[index] =
            (coefficentsMagnitude[index] << 1) | bit;
          bitsDecoded[index]++;
          processingFlags[index] |= processedMask;
        }
      }
    }
  }

  runCleanupPass() {
    const decoder = this.decoder;
    const width = this.width,
      height = this.height;
    const neighborsSignificance = this.neighborsSignificance;
    const coefficentsMagnitude = this.coefficentsMagnitude;
    const coefficentsSign = this.coefficentsSign;
    const contexts = this.contexts;
    const labels = this.contextLabelTable;
    const bitsDecoded = this.bitsDecoded;
    const processingFlags = this.processingFlags;
    const processedMask = 1;
    const firstMagnitudeBitMask = 2;
    const oneRowDown = width;
    const twoRowsDown = width * 2;
    const threeRowsDown = width * 3;
    let iNext;
    for (let i0 = 0; i0 < height; i0 = iNext) {
      iNext = Math.min(i0 + 4, height);
      const indexBase = i0 * width;
      const checkAllEmpty = i0 + 3 < height;
      for (let j = 0; j < width; j++) {
        const index0 = indexBase + j;
        // using the property: labels[neighborsSignificance[index]] === 0
        // when neighborsSignificance[index] === 0
        const allEmpty =
          checkAllEmpty &&
          processingFlags[index0] === 0 &&
          processingFlags[index0 + oneRowDown] === 0 &&
          processingFlags[index0 + twoRowsDown] === 0 &&
          processingFlags[index0 + threeRowsDown] === 0 &&
          neighborsSignificance[index0] === 0 &&
          neighborsSignificance[index0 + oneRowDown] === 0 &&
          neighborsSignificance[index0 + twoRowsDown] === 0 &&
          neighborsSignificance[index0 + threeRowsDown] === 0;
        let i1 = 0,
          index = index0;
        let i = i0,
          sign;
        if (allEmpty) {
          const hasSignificantCoefficent = decoder.readBit(
            contexts,
            RUNLENGTH_CONTEXT
          );
          if (!hasSignificantCoefficent) {
            bitsDecoded[index0]++;
            bitsDecoded[index0 + oneRowDown]++;
            bitsDecoded[index0 + twoRowsDown]++;
            bitsDecoded[index0 + threeRowsDown]++;
            continue; // next column
          }
          i1 =
            (decoder.readBit(contexts, UNIFORM_CONTEXT) << 1) |
            decoder.readBit(contexts, UNIFORM_CONTEXT);
          if (i1 !== 0) {
            i = i0 + i1;
            index += i1 * width;
          }

          sign = this.decodeSignBit(i, j, index);
          coefficentsSign[index] = sign;
          coefficentsMagnitude[index] = 1;
          this.setNeighborsSignificance(i, j, index);
          processingFlags[index] |= firstMagnitudeBitMask;

          index = index0;
          for (let i2 = i0; i2 <= i; i2++, index += width) {
            bitsDecoded[index]++;
          }

          i1++;
        }
        for (i = i0 + i1; i < iNext; i++, index += width) {
          if (
            coefficentsMagnitude[index] ||
            (processingFlags[index] & processedMask) !== 0
          ) {
            continue;
          }

          const contextLabel = labels[neighborsSignificance[index]];
          const decision = decoder.readBit(contexts, contextLabel);
          if (decision === 1) {
            sign = this.decodeSignBit(i, j, index);
            coefficentsSign[index] = sign;
            coefficentsMagnitude[index] = 1;
            this.setNeighborsSignificance(i, j, index);
            processingFlags[index] |= firstMagnitudeBitMask;
          }
          bitsDecoded[index]++;
        }
      }
    }
  }

  checkSegmentationSymbol() {
    const decoder = this.decoder;
    const contexts = this.contexts;
    const symbol =
      (decoder.readBit(contexts, UNIFORM_CONTEXT) << 3) |
      (decoder.readBit(contexts, UNIFORM_CONTEXT) << 2) |
      (decoder.readBit(contexts, UNIFORM_CONTEXT) << 1) |
      decoder.readBit(contexts, UNIFORM_CONTEXT);
    if (symbol !== 0xa) {
      throw new JpxError("Invalid segmentation symbol");
    }
  }
}
