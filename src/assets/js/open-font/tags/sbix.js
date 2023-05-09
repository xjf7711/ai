import { Bin } from "assets/js/open-font/bin";

export const sbix = {
  parseTab: function(e, t, r, n) {
    for (
      var o = n["maxp"]["numGlyphs"],
        a = t,
        s = Bin,
        c = s.readUint(e, t + 4),
        u = [],
        d = c - 1;
      d < c;
      d++
    )
      for (var l = a + s.readUint(e, t + 8 + 4 * d), f = 0; f < o; f++) {
        var h = s.readUint(e, l + 4 + 4 * f),
          p = s.readUint(e, l + 4 + 4 * f + 4);
        if (h != p) {
          var m = l + h,
            b = s.readASCII(e, m + 4, 4);
          if ("png " != b) throw b;
          u[f] = new Uint8Array(e.buffer, e.byteOffset + m + 8, p - h - 8);
        } else u[f] = null;
      }
    return u;
  }
};
