// Section F, Discrete wavelet transformation
import { unreachable } from "assets/js/shared/util";

export class Transform {
  constructor() {
    if (this.constructor === Transform) {
      unreachable("Cannot initialize Transform.");
    }
  }

  calculate(subbands, u0, v0) {
    let ll = subbands[0];
    for (let i = 1, ii = subbands.length; i < ii; i++) {
      ll = this.iterate(ll, subbands[i], u0, v0);
    }
    return ll;
  }

  extend(buffer, offset, size) {
    // Section F.3.7 extending... using max extension of 4
    let i1 = offset - 1;
    let j1 = offset + 1;
    let i2 = offset + size - 2;
    let j2 = offset + size;
    buffer[i1--] = buffer[j1++];
    buffer[j2++] = buffer[i2--];
    buffer[i1--] = buffer[j1++];
    buffer[j2++] = buffer[i2--];
    buffer[i1--] = buffer[j1++];
    buffer[j2++] = buffer[i2--];
    buffer[i1] = buffer[j1];
    buffer[j2] = buffer[i2];
  }

  // eslint-disable-next-line no-unused-vars
  filter(x, offset, length) {
    unreachable("Abstract method `filter` called");
  }

  iterate(ll, hl_lh_hh, u0, v0) {
    const llWidth = ll.width,
      llHeight = ll.height;
    let llItems = ll.items;
    const width = hl_lh_hh.width;
    const height = hl_lh_hh.height;
    const items = hl_lh_hh.items;
    let i, j, k, l, u, v;

    // Interleave LL according to Section F.3.3
    for (k = 0, i = 0; i < llHeight; i++) {
      l = i * 2 * width;
      for (j = 0; j < llWidth; j++, k++, l += 2) {
        items[l] = llItems[k];
      }
    }
    // The LL band is not needed anymore.
    llItems = ll.items = null;

    const bufferPadding = 4;
    const rowBuffer = new Float32Array(width + 2 * bufferPadding);

    // Section F.3.4 HOR_SR
    if (width === 1) {
      // if width = 1, when u0 even keep items as is, when odd divide by 2
      if ((u0 & 1) !== 0) {
        for (v = 0, k = 0; v < height; v++, k += width) {
          items[k] *= 0.5;
        }
      }
    } else {
      for (v = 0, k = 0; v < height; v++, k += width) {
        rowBuffer.set(items.subarray(k, k + width), bufferPadding);

        this.extend(rowBuffer, bufferPadding, width);
        this.filter(rowBuffer, bufferPadding, width);

        items.set(rowBuffer.subarray(bufferPadding, bufferPadding + width), k);
      }
    }

    // Accesses to the items array can take long, because it may not fit into
    // CPU cache and has to be fetched from main memory. Since subsequent
    // accesses to the items array are not local when reading columns, we
    // have a cache miss every time. To reduce cache misses, get up to
    // 'numBuffers' items at a time and store them into the individual
    // buffers. The colBuffers should be small enough to fit into CPU cache.
    let numBuffers = 16;
    const colBuffers = [];
    for (i = 0; i < numBuffers; i++) {
      colBuffers.push(new Float32Array(height + 2 * bufferPadding));
    }
    let b,
      currentBuffer = 0;
    ll = bufferPadding + height;

    // Section F.3.5 VER_SR
    if (height === 1) {
      // if height = 1, when v0 even keep items as is, when odd divide by 2
      if ((v0 & 1) !== 0) {
        for (u = 0; u < width; u++) {
          items[u] *= 0.5;
        }
      }
    } else {
      for (u = 0; u < width; u++) {
        // if we ran out of buffers, copy several image columns at once
        if (currentBuffer === 0) {
          numBuffers = Math.min(width - u, numBuffers);
          for (k = u, l = bufferPadding; l < ll; k += width, l++) {
            for (b = 0; b < numBuffers; b++) {
              colBuffers[b][l] = items[k + b];
            }
          }
          currentBuffer = numBuffers;
        }

        currentBuffer--;
        const buffer = colBuffers[currentBuffer];
        this.extend(buffer, bufferPadding, height);
        this.filter(buffer, bufferPadding, height);

        // If this is last buffer in this group of buffers, flush all buffers.
        if (currentBuffer === 0) {
          k = u - numBuffers + 1;
          for (l = bufferPadding; l < ll; k += width, l++) {
            for (b = 0; b < numBuffers; b++) {
              items[k + b] = colBuffers[b][l];
            }
          }
        }
      }
    }

    return { width, height, items };
  }
}
