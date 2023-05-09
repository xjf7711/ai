import { Bin } from "assets/js/open-font/bin";

export const hmtx = {
  parseTab: function(e, t, r, n) {
    var o = Bin,
      a = [],
      s = [],
      c = n["maxp"]["numGlyphs"],
      u = n["hhea"]["numberOfHMetrics"],
      d = 0,
      l = 0,
      f = 0;
    while (f < u)
      (d = o.readUshort(e, t + (f << 2))),
        (l = o.readShort(e, t + (f << 2) + 2)),
        a.push(d),
        s.push(l),
        f++;
    while (f < c) a.push(d), s.push(l), f++;
    return { aWidth: a, lsBearing: s };
  }
};
