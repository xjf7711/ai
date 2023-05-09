import { Bin } from "assets/js/open-font/bin";

export const SVG = {
  parseTab(e, t, r) {
    var n = Bin,
      o = { entries: [] },
      a = t;
    n.readUshort(e, t);
    t += 2;
    var s = n.readUint(e, t);
    t += 4;
    n.readUint(e, t);
    (t += 4), (t = s + a);
    var c = n.readUshort(e, t);
    t += 2;
    for (var u = 0; u < c; u++) {
      var d = n.readUshort(e, t);
      t += 2;
      var l = n.readUshort(e, t);
      t += 2;
      var f = n.readUint(e, t);
      t += 4;
      var h = n.readUint(e, t);
      t += 4;
      var p = new Uint8Array(e.buffer, a + f + s, h);
      31 == p[0] && 139 == p[1] && 8 == p[2] && (p = pako["inflate"](p));
      for (var m = n.readUTF8(p, 0, p.length), b = d; b <= l; b++)
        o.entries[b] = m;
    }
    return o;
  }
};
