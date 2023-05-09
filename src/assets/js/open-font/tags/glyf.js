import { Bin } from "assets/js/open-font/bin";
import { openFont } from "assets/js/open-font/open-font";

export const glyf = {
  parseTab: function(e, t, r, n) {
    for (var i = [], o = n["maxp"]["numGlyphs"], a = 0; a < o; a++)
      i.push(null);
    return i;
  },
  _parseGlyf: function(e, t) {
    var r = Bin,
      n = e["_data"],
      o = e["loca"];
    if (o[t] === o[t + 1]) return null;
    var a = openFont.findTable(n, "glyf", e["_offset"])[0] + o[t],
      s = {};
    if (
      ((s.noc = r.readShort(n, a)),
      (a += 2),
      (s.xMin = r.readShort(n, a)),
      (a += 2),
      (s.yMin = r.readShort(n, a)),
      (a += 2),
      (s.xMax = r.readShort(n, a)),
      (a += 2),
      (s.yMax = r.readShort(n, a)),
      (a += 2),
      s.xMin >= s.xMax || s.yMin >= s.yMax)
    )
      return null;
    if (s.noc > 0) {
      s.endPts = [];
      for (var c = 0; c < s.noc; c++)
        s.endPts.push(r.readUshort(n, a)), (a += 2);
      var u = r.readUshort(n, a);
      if (((a += 2), n.length - a < u)) return null;
      (s.instructions = r.readBytes(n, a, u)), (a += u);
      var d = s.endPts[s.noc - 1] + 1;
      s.flags = [];
      for (c = 0; c < d; c++) {
        var l = n[a];
        if ((a++, s.flags.push(l), 0 != (8 & l))) {
          var f = n[a];
          a++;
          for (var h = 0; h < f; h++) s.flags.push(l), c++;
        }
      }
      s.xs = [];
      for (c = 0; c < d; c++) {
        var p = 0 != (2 & s.flags[c]),
          m = 0 != (16 & s.flags[c]);
        p
          ? (s.xs.push(m ? n[a] : -n[a]), a++)
          : m
          ? s.xs.push(0)
          : (s.xs.push(r.readShort(n, a)), (a += 2));
      }
      s.ys = [];
      for (c = 0; c < d; c++) {
        (p = 0 != (4 & s.flags[c])), (m = 0 != (32 & s.flags[c]));
        p
          ? (s.ys.push(m ? n[a] : -n[a]), a++)
          : m
          ? s.ys.push(0)
          : (s.ys.push(r.readShort(n, a)), (a += 2));
      }
      var b = 0,
        g = 0;
      for (c = 0; c < d; c++)
        (b += s.xs[c]), (g += s.ys[c]), (s.xs[c] = b), (s.ys[c] = g);
    } else {
      var y,
        v = 1,
        S = 2,
        w = 8,
        C = 32,
        A = 64,
        _ = 128,
        I = 256;
      s.parts = [];
      do {
        (y = r.readUshort(n, a)), (a += 2);
        var E = { m: { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }, p1: -1, p2: -1 };
        if (
          (s.parts.push(E),
          (E.glyphIndex = r.readUshort(n, a)),
          (a += 2),
          y & v)
        ) {
          var T = r.readShort(n, a);
          a += 2;
          var x = r.readShort(n, a);
          a += 2;
        } else {
          T = r.readInt8(n, a);
          a++;
          x = r.readInt8(n, a);
          a++;
        }
        y & S ? ((E.m.tx = T), (E.m.ty = x)) : ((E.p1 = T), (E.p2 = x)),
          y & w
            ? ((E.m.a = E.m.d = r.readF2dot14(n, a)), (a += 2))
            : y & A
            ? ((E.m.a = r.readF2dot14(n, a)),
              (a += 2),
              (E.m.d = r.readF2dot14(n, a)),
              (a += 2))
            : y & _ &&
              ((E.m.a = r.readF2dot14(n, a)),
              (a += 2),
              (E.m.b = r.readF2dot14(n, a)),
              (a += 2),
              (E.m.c = r.readF2dot14(n, a)),
              (a += 2),
              (E.m.d = r.readF2dot14(n, a)),
              (a += 2));
      } while (y & C);
      if (y & I) {
        var P = r.readUshort(n, a);
        (a += 2), (s.instr = []);
        for (c = 0; c < P; c++) s.instr.push(n[a]), a++;
      }
    }
    return s;
  },
  _parseGlyf2: function(e, t) {
    var r = Bin,
      n = e["_data"],
      o = 0;
    r.readASCII(n, 0, 4);
    o += 4;
    for (
      var a = function(e) {
          var t = r.readShort(e, o);
          if (((o += 2), 0 === t)) return null;
          var n = new ArrayBuffer(t + 1),
            i = r.readBytes(e, o, 1)[0];
          o += 1;
          for (var a = 0; a <= t; a++) {
            var s = r.readOffset(e, o, i);
            if (((o += i), s > e.length))
              throw "illegal offset value " + s + " in CFF font";
            n[a] = s;
          }
          var c = new ArrayBuffer(t);
          for (a = 0; a < t; a++) {
            var u = n[a + 1] - n[a];
            if (u < 0)
              throw "Negative index data length + " +
                u +
                " at " +
                a +
                ": offsets[" +
                (a + 1) +
                "]=" +
                n[a + 1] +
                ", offsets[" +
                a +
                "]=" +
                n[a];
            (c[a] = r.readASCII(e, o, u)), (o += u);
          }
          return c;
        },
        s = function(e) {
          var t = r.readShort(e, o);
          if (((o += 2), 0 === t)) return null;
          var n = new ArrayBuffer(t + 1),
            i = r.readBytes(e, o, 1)[0];
          o += 1;
          for (var a = 0; a <= t; a++) {
            var s = r.readOffset(e, o, i);
            if (((o += i), s > e.length))
              throw "illegal offset value " + s + " in CFF font";
            n[a] = s;
          }
          var c = new ArrayBuffer(t);
          for (a = 0; a < t; a++) {
            var u = n[a + 1] - n[a];
            (c[a] = r.readBytes(e, o, u)), (o += u);
          }
          return c;
        },
        c = a(n),
        u = s(n),
        d =
          (a(n),
          s(n),
          function(e) {
            for (var t, n = 0, i = e.length, o = 0; o <= i; o++) {
              var a = new ArrayBuffer(3),
                s = 0;
              while (1) {
                var c = r.readUint8(e, n);
                if (((n += 1), c >= 0 && c <= 21)) {
                  if (12 == c) {
                    c = r.readUint8(e, n);
                    n += 1;
                  }
                  var u = [
                    "version",
                    "Notice",
                    "FullName",
                    "FamilyName",
                    "Weight",
                    "FontBBox",
                    "BlueValues",
                    "OtherBlues",
                    "FamilyBlues",
                    "FamilyOtherBl",
                    "StdHW",
                    "StdVW",
                    "",
                    "UniqueID",
                    "XUID",
                    "charset",
                    "Encoding",
                    "CharStrings",
                    "Private",
                    "Subrs",
                    "defaultWidthX",
                    "nominalWidthX"
                  ];
                  u[c];
                  break;
                }
                if (28 == c || 29 == c || (c >= 32 && c <= 254)) {
                  var d;
                  if (28 == c) (d = r.readShort(e, n)), (n += 2);
                  else if (29 == c) (d = r.readInt(e, n)), (n += 4);
                  else if (c >= 32 && c <= 246) d = c - 139;
                  else if (c >= 247 && c <= 250) {
                    var l = r.readUint8(e, n);
                    (n += 1), (d = 256 * (c - 247) + l + 108);
                  } else {
                    if (!(c >= 251 && c <= 254))
                      throw "IllegalArgumentExceptionnew";
                    l = r.readUint8(e, n);
                    (n += 1), (d = 256 * -(c - 251) - l - 108);
                  }
                  (a[s] = d), (s += 1);
                } else if (30 != c) throw "invalid DICT data b0 byte: " + c;
              }
            }
            return t;
          }),
        l = (new ArrayBuffer(c.byteLength), 0);
      l <= c.byteLength;
      l++
    )
      d(u[l]);
    var f = {};
    if (
      ((f.noc = r.readShort(n, o)),
      (o += 2),
      (f.xMin = r.readShort(n, o)),
      (o += 2),
      (f.yMin = r.readShort(n, o)),
      (o += 2),
      (f.xMax = r.readShort(n, o)),
      (o += 2),
      (f.yMax = r.readShort(n, o)),
      (o += 2),
      f.noc > 0)
    ) {
      f.endPts = [];
      for (l = 0; l < f.noc; l++) f.endPts.push(r.readUshort(n, o)), (o += 2);
      var h = r.readUshort(n, o);
      if (((o += 2), n.length - o < h)) return null;
      (f.instructions = r.readBytes(n, o, h)), (o += h);
      var p = f.endPts[f.noc - 1] + 1;
      f.flags = [];
      for (l = 0; l < p; l++) {
        var m = n[o];
        if ((o++, f.flags.push(m), 0 != (8 & m))) {
          var b = n[o];
          o++;
          for (var g = 0; g < b; g++) f.flags.push(m), l++;
        }
      }
      f.xs = [];
      for (l = 0; l < p; l++) {
        var y = 0 != (2 & f.flags[l]),
          v = 0 != (16 & f.flags[l]);
        y
          ? (f.xs.push(v ? n[o] : -n[o]), o++)
          : v
          ? f.xs.push(0)
          : (f.xs.push(r.readShort(n, o)), (o += 2));
      }
      f.ys = [];
      for (l = 0; l < p; l++) {
        (y = 0 != (4 & f.flags[l])), (v = 0 != (32 & f.flags[l]));
        y
          ? (f.ys.push(v ? n[o] : -n[o]), o++)
          : v
          ? f.ys.push(0)
          : (f.ys.push(r.readShort(n, o)), (o += 2));
      }
      var S = 0,
        w = 0;
      for (l = 0; l < p; l++)
        (S += f.xs[l]), (w += f.ys[l]), (f.xs[l] = S), (f.ys[l] = w);
    } else {
      var C,
        A = 1,
        _ = 2,
        I = 8,
        E = 32,
        T = 64,
        x = 128,
        P = 256;
      f.parts = [];
      do {
        (C = r.readUshort(n, o)), (o += 2);
        var k = { m: { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }, p1: -1, p2: -1 };
        if (
          (f.parts.push(k),
          (k.glyphIndex = r.readUshort(n, o)),
          (o += 2),
          C & A)
        ) {
          var D = r.readShort(n, o);
          o += 2;
          var O = r.readShort(n, o);
          o += 2;
        } else {
          D = r.readInt8(n, o);
          o++;
          O = r.readInt8(n, o);
          o++;
        }
        C & _ ? ((k.m.tx = D), (k.m.ty = O)) : ((k.p1 = D), (k.p2 = O)),
          C & I
            ? ((k.m.a = k.m.d = r.readF2dot14(n, o)), (o += 2))
            : C & T
            ? ((k.m.a = r.readF2dot14(n, o)),
              (o += 2),
              (k.m.d = r.readF2dot14(n, o)),
              (o += 2))
            : C & x &&
              ((k.m.a = r.readF2dot14(n, o)),
              (o += 2),
              (k.m.b = r.readF2dot14(n, o)),
              (o += 2),
              (k.m.c = r.readF2dot14(n, o)),
              (o += 2),
              (k.m.d = r.readF2dot14(n, o)),
              (o += 2));
      } while (C & E);
      if (C & P) {
        var R = r.readUshort(n, o);
        (o += 2), (f.instr = []);
        for (l = 0; l < R; l++) f.instr.push(n[o]), o++;
      }
    }
    return f;
  }
};
