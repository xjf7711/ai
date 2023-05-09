// Section 3.8.2 Irreversible 9-7 filter
import { Transform } from "assets/js/jpx/transform/Transform";

export class IrreversibleTransform extends Transform {
  filter(x, offset, length) {
    const len = length >> 1;
    offset |= 0;
    let j, n, current, next;

    const alpha = -1.586134342059924;
    const beta = -0.052980118572961;
    const gamma = 0.882911075530934;
    const delta = 0.443506852043971;
    const K = 1.230174104914001;
    const K_ = 1 / K;

    // step 1 is combined with step 3

    // step 2
    j = offset - 3;
    for (n = len + 4; n--; j += 2) {
      x[j] *= K_;
    }

    // step 1 & 3
    j = offset - 2;
    current = delta * x[j - 1];
    for (n = len + 3; n--; j += 2) {
      next = delta * x[j + 1];
      x[j] = K * x[j] - current - next;
      if (n--) {
        j += 2;
        current = delta * x[j + 1];
        x[j] = K * x[j] - current - next;
      } else {
        break;
      }
    }

    // step 4
    j = offset - 1;
    current = gamma * x[j - 1];
    for (n = len + 2; n--; j += 2) {
      next = gamma * x[j + 1];
      x[j] -= current + next;
      if (n--) {
        j += 2;
        current = gamma * x[j + 1];
        x[j] -= current + next;
      } else {
        break;
      }
    }

    // step 5
    j = offset;
    current = beta * x[j - 1];
    for (n = len + 1; n--; j += 2) {
      next = beta * x[j + 1];
      x[j] -= current + next;
      if (n--) {
        j += 2;
        current = beta * x[j + 1];
        x[j] -= current + next;
      } else {
        break;
      }
    }

    // step 6
    if (len !== 0) {
      j = offset + 1;
      current = alpha * x[j - 1];
      for (n = len; n--; j += 2) {
        next = alpha * x[j + 1];
        x[j] -= current + next;
        if (n--) {
          j += 2;
          current = alpha * x[j + 1];
          x[j] -= current + next;
        } else {
          break;
        }
      }
    }
  }
}
