import { Bin } from "assets/js/open-font/bin";

export const kern = {
  parseTab: function(e, t, r, n) {
    var o = Bin,
      a = kern,
      s = o.readUshort(e, t);
    if (1 == s) return a.parseV1(e, t, r, n);
    var c = o.readUshort(e, t + 2);
    t += 4;
    for (var u = { glyph1: [], rval: [] }, d = 0; d < c; d++) {
      t += 2;
      r = o.readUshort(e, t);
      t += 2;
      var l = o.readUshort(e, t);
      t += 2;
      var f = l >>> 8;
      (f &= 15), 0 == f && (t = a.readFormat0(e, t, u));
    }
    return u;
  },
  parseV1: function(e, t, r, n) {
    var o = Bin,
      a = kern,
      s = (o.readFixed(e, t), o.readUint(e, t + 4));
    t += 8;
    for (var c = { glyph1: [], rval: [] }, u = 0; u < s; u++) {
      o.readUint(e, t);
      t += 4;
      var d = o.readUshort(e, t);
      t += 2;
      o.readUshort(e, t);
      t += 2;
      var l = 255 & d;
      0 == l && (t = a.readFormat0(e, t, c));
    }
    return c;
  },
  readFormat0: function(e, t, r) {
    var n = Bin,
      o = n.readUshort,
      a = -1,
      s = o(e, t);
    o(e, t + 2), o(e, t + 4), o(e, t + 6);
    t += 8;
    for (var c = 0; c < s; c++) {
      var u = o(e, t);
      t += 2;
      var d = o(e, t);
      t += 2;
      var l = n.readShort(e, t);
      (t += 2),
        u != a && (r.glyph1.push(u), r.rval.push({ glyph2: [], vals: [] }));
      var f = r.rval[r.rval.length - 1];
      f.glyph2.push(d), f.vals.push(l), (a = u);
    }
    return t;
  }
};
