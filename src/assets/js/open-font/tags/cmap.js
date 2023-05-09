import { Bin } from "../bin";
export const cmap = {
  parseTab: function(e, t, r) {
    var n = { tables: [], ids: {}, off: t };
    (e = new Uint8Array(e.buffer, t, r)), (t = 0);
    var o = Bin,
      a = o.readUshort,
      s = cmap;
    a(e, t);
    t += 2;
    var c = a(e, t);
    t += 2;
    for (var u = [], d = 0; d < c; d++) {
      var l = a(e, t);
      t += 2;
      var f = a(e, t);
      t += 2;
      var h = o.readUint(e, t);
      t += 4;
      var p = "p" + l + "e" + f,
        m = u.indexOf(h);
      if (-1 === m) {
        m = n.tables.length;
        var b = {};
        u.push(h);
        var g = (b.format = a(e, h));
        0 === g
          ? (b = s.parse0(e, h, b))
          : 4 === g
          ? (b = s.parse4(e, h, b))
          : 6 === g
          ? (b = s.parse6(e, h, b))
          : 12 === g && (b = s.parse12(e, h, b)),
          n.tables.push(b);
      }
      null != n.ids[p] &&
        console.log("multiple tables for one platform+encoding: " + p),
        (n.ids[p] = m);
    }
    return n;
  },
  parse0: function(e, t, r) {
    var n = Bin;
    t += 2;
    var o = n.readUshort(e, t);
    t += 2;
    n.readUshort(e, t);
    (t += 2), (r.map = []);
    for (var a = 0; a < o - 6; a++) r.map.push(e[t + a]);
    return r;
  },
  parse4: function(e, t, r) {
    var n = Bin,
      o = n.readUshort,
      a = n.readUshorts,
      s = t;
    t += 2;
    var c = o(e, t);
    t += 2;
    o(e, t);
    t += 2;
    var u = o(e, t);
    t += 2;
    var d = u >>> 1;
    (r.searchRange = o(e, t)),
      (t += 2),
      (r.entrySelector = o(e, t)),
      (t += 2),
      (r.rangeShift = o(e, t)),
      (t += 2),
      (r.endCount = a(e, t, d)),
      (t += 2 * d),
      (t += 2),
      (r.startCount = a(e, t, d)),
      (t += 2 * d),
      (r.idDelta = []);
    for (var l = 0; l < d; l++) r.idDelta.push(n.readShort(e, t)), (t += 2);
    return (
      (r.idRangeOffset = a(e, t, d)),
      (t += 2 * d),
      (r.glyphIdArray = a(e, t, (s + c - t) >>> 1)),
      r
    );
  },
  parse6: function(e, t, r) {
    var n = Bin;
    t += 2;
    n.readUshort(e, t);
    t += 2;
    n.readUshort(e, t);
    (t += 2), (r.firstCode = n.readUshort(e, t)), (t += 2);
    var o = n.readUshort(e, t);
    (t += 2), (r.glyphIdArray = []);
    for (var a = 0; a < o; a++)
      r.glyphIdArray.push(n.readUshort(e, t)), (t += 2);
    return r;
  },
  parse12: function(e, t, r) {
    var n = Bin,
      o = n.readUint;
    t += 4;
    o(e, t);
    t += 4;
    o(e, t);
    t += 4;
    var a = 3 * o(e, t);
    t += 4;
    for (var s = (r.groups = new Uint32Array(a)), c = 0; c < a; c += 3)
      (s[c] = o(e, t + (c << 2))),
        (s[c + 1] = o(e, t + (c << 2) + 4)),
        (s[c + 2] = o(e, t + (c << 2) + 8));
    return r;
  }
};
