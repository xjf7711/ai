import { Bin } from "assets/js/open-font/bin";

export const CFF = {
  parseTab: function(e, t, r) {
    console.log('CFF parseTab . ');
    const n = Bin;
    const o = CFF;
    e = new Uint8Array(e.buffer, t, r);
    t = 0;
    e[t];
    t++;
    e[t];
    t++;
    e[t];
    t++;
    e[t];
    t++;
    var a = [];
    t = o.readIndex(e, t, a);
    for (var s = [], c = 0; c < a.length - 1; c++)
      s.push(n.readASCII(e, t + a[c], a[c + 1] - a[c]));
    t += a[a.length - 1];
    var u = [];
    t = o.readIndex(e, t, u);
    var d = [];
    for (c = 0; c < u.length - 1; c++)
      d.push(o.readDict(e, t + u[c], t + u[c + 1]));
    t += u[u.length - 1];
    var l = d[0],
      f = [];
    t = o.readIndex(e, t, f);
    var h = [];
    for (c = 0; c < f.length - 1; c++)
      h.push(n.readASCII(e, t + f[c], f[c + 1] - f[c]));
    if (
      ((t += f[f.length - 1]),
      o.readSubrs(e, t, l),
      l["CharStrings"] && (l["CharStrings"] = o.readBytes(e, l["CharStrings"])),
      l["ROS"])
    ) {
      t = l["FDArray"];
      var p = [];
      (t = o.readIndex(e, t, p)), (l["FDArray"] = []);
      for (c = 0; c < p.length - 1; c++) {
        var m = o.readDict(e, t + p[c], t + p[c + 1]);
        o._readFDict(e, m, h), l["FDArray"].push(m);
      }
      (t += p[p.length - 1]), (t = l["FDSelect"]), (l["FDSelect"] = []);
      var b = e[t];
      if ((t++, 3 != b)) throw b;
      var g = n.readUshort(e, t);
      t += 2;
      for (c = 0; c < g + 1; c++)
        l["FDSelect"].push(n.readUshort(e, t), e[t + 2]), (t += 3);
    }
    return (
      l["charset"] &&
        (l["charset"] = o.readCharset(
          e,
          l["charset"],
          l["CharStrings"].length
        )),
      o._readFDict(e, l, h),
      l
    );
  },
  _readFDict: function(e, t, r) {
    var n,
      o = CFF;
    for (var a in (t["Private"] &&
      ((n = t["Private"][1]),
      (t["Private"] = o.readDict(e, n, n + t["Private"][0])),
      t["Private"]["Subrs"] &&
        o.readSubrs(e, n + t["Private"]["Subrs"], t["Private"])),
    t))
      -1 !=
        [
          "FamilyName",
          "FontName",
          "FullName",
          "Notice",
          "version",
          "Copyright"
        ].indexOf(a) && (t[a] = r[t[a] - 426 + 35]);
  },
  readSubrs: function(e, t, r) {
    r["Subrs"] = CFF.readBytes(e, t);
    var n,
      o = r["Subrs"].length + 1;
    (n = o < 1240 ? 107 : o < 33900 ? 1131 : 32768), (r["Bias"] = n);
  },
  readBytes: function(e, t) {
    var r = [];
    t = CFF.readIndex(e, t, r);
    for (
      var n = [], o = r.length - 1, a = e.byteOffset + t, s = 0;
      s < o;
      s++
    ) {
      var c = r[s];
      n.push(new Uint8Array(e.buffer, a + c, r[s + 1] - c));
    }
    return n;
  },
  tableSE: [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29,
    30,
    31,
    32,
    33,
    34,
    35,
    36,
    37,
    38,
    39,
    40,
    41,
    42,
    43,
    44,
    45,
    46,
    47,
    48,
    49,
    50,
    51,
    52,
    53,
    54,
    55,
    56,
    57,
    58,
    59,
    60,
    61,
    62,
    63,
    64,
    65,
    66,
    67,
    68,
    69,
    70,
    71,
    72,
    73,
    74,
    75,
    76,
    77,
    78,
    79,
    80,
    81,
    82,
    83,
    84,
    85,
    86,
    87,
    88,
    89,
    90,
    91,
    92,
    93,
    94,
    95,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    96,
    97,
    98,
    99,
    100,
    101,
    102,
    103,
    104,
    105,
    106,
    107,
    108,
    109,
    110,
    0,
    111,
    112,
    113,
    114,
    0,
    115,
    116,
    117,
    118,
    119,
    120,
    121,
    122,
    0,
    123,
    0,
    124,
    125,
    126,
    127,
    128,
    129,
    130,
    131,
    0,
    132,
    133,
    0,
    134,
    135,
    136,
    137,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    138,
    0,
    139,
    0,
    0,
    0,
    0,
    140,
    141,
    142,
    143,
    0,
    0,
    0,
    0,
    0,
    144,
    0,
    0,
    0,
    145,
    0,
    0,
    146,
    147,
    148,
    149,
    0,
    0,
    0,
    0
  ],
  glyphByUnicode: function(e, t) {
    for (var r = 0; r < e["charset"].length; r++)
      if (e["charset"][r] === t) return r;
    return -1;
  },
  glyphBySE: function(e, t) {
    return t < 0 || t > 255 ? -1 : CFF.glyphByUnicode(e, CFF.tableSE[t]);
  },
  readCharset: function(e, t, r) {
    var n = Bin,
      o = [".notdef"],
      a = e[t];
    if ((t++, 0 === a))
      for (var s = 0; s < r; s++) {
        var c = n.readUshort(e, t);
        (t += 2), o.push(c);
      }
    else {
      if (1 != a && 2 != a) throw "error: format: " + a;
      while (o.length < r) {
        c = n.readUshort(e, t);
        t += 2;
        var u = 0;
        1 === a ? ((u = e[t]), t++) : ((u = n.readUshort(e, t)), (t += 2));
        for (s = 0; s <= u; s++) o.push(c), c++;
      }
    }
    return o;
  },
  readIndex: function(e, t, r) {
    console.log('readIndex . ');
    var n = Bin,
      o = n.readUshort(e, t) + 1;
    t += 2;
    var a = e[t];
    if ((t++, 1 === a)) for (var s = 0; s < o; s++) r.push(e[t + s]);
    else if (2 === a) for (s = 0; s < o; s++) r.push(n.readUshort(e, t + 2 * s));
    else if (3 === a)
      for (s = 0; s < o; s++) r.push(16777215 & n.readUint(e, t + 3 * s - 1));
    else if (4 === a) for (s = 0; s < o; s++) r.push(n.readUint(e, t + 4 * s));
    else if (1 != o) throw "unsupported offset size: " + a + ", count: " + o;
    return (t += o * a), t - 1;
  },
  getCharString: function(e, t, r) {
    var n = Bin,
      o = e[t],
      a = e[t + 1],
      s = (e[t + 2], e[t + 3], e[t + 4], 1),
      c = null,
      u = null;
    o <= 20 && ((c = o), (s = 1)),
      12 === o && ((c = 100 * o + a), (s = 2)),
      21 <= o && o <= 27 && ((c = o), (s = 1)),
      28 === o && ((u = n.readShort(e, t + 1)), (s = 3)),
      29 <= o && o <= 31 && ((c = o), (s = 1)),
      32 <= o && o <= 246 && ((u = o - 139), (s = 1)),
      247 <= o && o <= 250 && ((u = 256 * (o - 247) + a + 108), (s = 2)),
      251 <= o && o <= 254 && ((u = 256 * -(o - 251) - a - 108), (s = 2)),
      255 === o && ((u = n.readInt(e, t + 1) / 65535), (s = 5)),
      (r.val = null != u ? u : "o" + c),
      (r.size = s);
  },
  readCharString: function(e, t, r) {
    var n = t + r,
      o = Bin,
      a = [];
    while (t < n) {
      var s = e[t],
        c = e[t + 1],
        u = (e[t + 2], e[t + 3], e[t + 4], 1),
        d = null,
        l = null;
      s <= 20 && ((d = s), (u = 1)),
        12 === s && ((d = 100 * s + c), (u = 2)),
        (19 != s && 20 != s) || ((d = s), (u = 2)),
        21 <= s && s <= 27 && ((d = s), (u = 1)),
        28 === s && ((l = o.readShort(e, t + 1)), (u = 3)),
        29 <= s && s <= 31 && ((d = s), (u = 1)),
        32 <= s && s <= 246 && ((l = s - 139), (u = 1)),
        247 <= s && s <= 250 && ((l = 256 * (s - 247) + c + 108), (u = 2)),
        251 <= s && s <= 254 && ((l = 256 * -(s - 251) - c - 108), (u = 2)),
        255 === s && ((l = o.readInt(e, t + 1) / 65535), (u = 5)),
        a.push(null != l ? l : "o" + d),
        (t += u);
    }
    return a;
  },
  readDict: function(e, t, r) {
    var n = Bin,
      o = {},
      a = [];
    while (t < r) {
      var s = e[t],
        c = e[t + 1],
        u = (e[t + 2], e[t + 3], e[t + 4], 1),
        d = null,
        l = null;
      if (
        (28 === s && ((l = n.readShort(e, t + 1)), (u = 3)),
        29 === s && ((l = n.readInt(e, t + 1)), (u = 5)),
        32 <= s && s <= 246 && ((l = s - 139), (u = 1)),
        247 <= s && s <= 250 && ((l = 256 * (s - 247) + c + 108), (u = 2)),
        251 <= s && s <= 254 && ((l = 256 * -(s - 251) - c - 108), (u = 2)),
        255 === s)
      )
        throw ((l = n.readInt(e, t + 1) / 65535), (u = 5), "unknown number");
      if (30 === s) {
        var f = [];
        u = 1;
        while (1) {
          var h = e[t + u];
          u++;
          var p = h >> 4,
            m = 15 & h;
          if ((15 != p && f.push(p), 15 != m && f.push(m), 15 === m)) break;
        }
        for (
          var b = "",
            g = [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              ".",
              "e",
              "e-",
              "reserved",
              "-",
              "endOfNumber"
            ],
            y = 0;
          y < f.length;
          y++
        )
          b += g[f[y]];
        l = parseFloat(b);
      }
      if (s <= 21) {
        var v = [
          "version",
          "Notice",
          "FullName",
          "FamilyName",
          "Weight",
          "FontBBox",
          "BlueValues",
          "OtherBlues",
          "FamilyBlues",
          "FamilyOtherBlues",
          "StdHW",
          "StdVW",
          "escape",
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
        if (((d = v[s]), (u = 1), 12 === s)) {
          v = [
            "Copyright",
            "isFixedPitch",
            "ItalicAngle",
            "UnderlinePosition",
            "UnderlineThickness",
            "PaintType",
            "CharstringType",
            "FontMatrix",
            "StrokeWidth",
            "BlueScale",
            "BlueShift",
            "BlueFuzz",
            "StemSnapH",
            "StemSnapV",
            "ForceBold",
            "",
            "",
            "LanguageGroup",
            "ExpansionFactor",
            "initialRandomSeed",
            "SyntheticBase",
            "PostScript",
            "BaseFontName",
            "BaseFontBlend",
            "",
            "",
            "",
            "",
            "",
            "",
            "ROS",
            "CIDFontVersion",
            "CIDFontRevision",
            "CIDFontType",
            "CIDCount",
            "UIDBase",
            "FDArray",
            "FDSelect",
            "FontName"
          ];
          (d = v[c]), (u = 2);
        }
      }
      null != d ? ((o[d] = 1 === a.length ? a[0] : a), (a = [])) : a.push(l),
        (t += u);
    }
    return o;
  }
};
