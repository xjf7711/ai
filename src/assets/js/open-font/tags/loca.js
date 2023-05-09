import { Bin } from "assets/js/open-font/bin";

export const loca = {
  parseTab: function(e, t, r, n) {
    var o = Bin,
      a = [],
      s = n["head"]["indexToLocFormat"],
      c = n["maxp"]["numGlyphs"] + 1;
    if (0 === s)
      for (var u = 0; u < c; u++) a.push(o.readUshort(e, t + (u << 1)) << 1);
    if (1 === s) for (u = 0; u < c; u++) a.push(o.readUint(e, t + (u << 2)));
    return a;
  }
};
