// Section 3.8.1 Reversible 5-3 filter
import { Transform } from "assets/js/jpx/transform/Transform";
export class ReversibleTransform extends Transform {
  filter(x, offset, length) {
    const len = length >> 1;
    offset |= 0;
    let j, n;

    for (j = offset, n = len + 1; n--; j += 2) {
      x[j] -= (x[j - 1] + x[j + 1] + 2) >> 2;
    }

    for (j = offset + 1, n = len; n--; j += 2) {
      x[j] += (x[j - 1] + x[j + 1]) >> 1;
    }
  }
}
