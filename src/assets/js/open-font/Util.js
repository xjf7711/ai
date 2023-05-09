import { fontTags } from "./tags/index";
export const Util = {
  shape: function(e, t, r) {
    for (
      var n = function(e, t, r, n) {
          var i = t[r],
            o = t[r + 1],
            a = e["kern"];
          if (a) {
            var s = a.glyph1.indexOf(i);
            if (-1 !== s) {
              var c = a.rval[s].glyph2.indexOf(o);
              if (-1 !== c) return [0, 0, a.rval[s].vals[c], 0];
            }
          }
          return [0, 0, 0, 0];
        },
        o = [],
        a = 0;
      a < t.length;
      a++
    ) {
      var s = t.codePointAt(a);
      s > 65535 && a++, o.push(Util.codeToGlyph(e, s));
    }
    var c = [];
    for (a = 0; a < o.length; a++) {
      var u = n(e, o, a, r),
        d = o[a],
        l = e["hmtx"].aWidth[d] + u[2];
      c.push({ g: d, cl: a, dx: 0, dy: 0, ax: l, ay: 0 }), l;
    }
    return c;
  },
  shapeToPath: function(e, t, r) {
    for (
      var n = { cmds: [], crds: [] }, o = 0, a = 0, s = 0;
      s < t.length;
      s++
    ) {
      for (
        var c = t[s], u = Util["glyphToPath"](e, c["g"]), d = u["crds"], l = 0;
        l < d.length;
        l += 2
      )
        n.crds.push(d[l] + o + c["dx"]), n.crds.push(d[l + 1] + a + c["dy"]);
      r && n.cmds.push(r);
      for (l = 0; l < u["cmds"].length; l++) n.cmds.push(u["cmds"][l]);
      var f = n.cmds.length;
      r && 0 !== f && "X" !== n.cmds[f - 1] && n.cmds.push("X"),
        (o += c["ax"]),
        (a += c["ay"]);
    }
    return { cmds: n.cmds, crds: n.crds };
  },
  codeToGlyph: (function() {
    function e(e, t, r) {
      var n = 0,
        i = ~~(e.length / t);
      while (n + 1 !== i) {
        var o = n + ((i - n) >>> 1);
        e[o * t] <= r ? (n = o) : (i = o);
      }
      return n * t;
    }

    for (
      var t = [
          9,
          10,
          11,
          12,
          13,
          32,
          133,
          160,
          5760,
          6158,
          8232,
          8233,
          8239,
          8288,
          12288,
          65279
        ],
        r = {},
        n = 0;
      n < t.length;
      n++
    )
      r[t[n]] = 1;
    for (n = 8192; n <= 8205; n++) r[n] = 1;

    function i(t, n) {
      if (null == t["_ctab"]) {
        for (
          var i = t["cmap"],
            o = -1,
            a = [
              "p3e10",
              "p0e4",
              "p3e1",
              "p1e0",
              "p0e3",
              "p0e1",
              "p3e0",
              "p3e5"
            ],
            s = 0;
          s < a.length;
          s++
        )
          if (null !== i.ids[a[s]]) {
            o = i.ids[a[s]];
            break;
          }
        if (-1 == o) throw "no familiar platform and encoding!";
        t["_ctab"] = i.tables[o];
      }
      var c = t["_ctab"],
        u = c.format,
        d = -1;
      if (0 == u) d = n >= c.map.length ? 0 : c.map[n];
      else if (4 == u) {
        var l = c.endCount;
        if (((d = 0), n <= l[l.length - 1])) {
          var f = e(l, 1, n);
          if ((l[f] < n && f++, n >= c.startCount[f])) {
            var h = 0;
            (h =
              0 !== c.idRangeOffset[f]
                ? c.glyphIdArray[
                    n -
                      c.startCount[f] +
                      (c.idRangeOffset[f] >> 1) -
                      (c.idRangeOffset.length - f)
                  ]
                : n + c.idDelta[f]),
              (d = 65535 & h);
          }
        }
      } else if (6 == u) {
        var p = n - c.firstCode,
          m = c.glyphIdArray;
        d = p < 0 || p >= m.length ? 0 : m[p];
      } else {
        if (12 !== u) throw "unknown cmap table format " + c.format;
        var b = c.groups;
        if (((d = 0), n <= b[b.length - 2])) {
          s = e(b, 3, n);
          b[s] <= n && n <= b[s + 1] && (d = b[s + 2] + (n - b[s]));
        }
      }
      var g = t["SVG "],
        y = t["loca"];
      return (
        0 == d ||
          null !== t["CFF "] ||
          (null !== g && null !== g.entries[d]) ||
          !y ||
          y[d] !== y[d + 1] ||
          null !== r[n] ||
          (d = 0),
        d
      );
    }

    return i;
  })(),
  glyphToPath: function(e, t, r) {
    // console.log('glyphToPaht .')
    var n = { cmds: [], crds: [] },
      o = e["SVG "];
    var a = e["CFF "],
      s = e["COLR"],
      c = e["CBLC"],
      u = e["CBDT"],
      d = e["sbix"],
      l = window["UPNG"],
      f = Util,
      h = null;
    if (c && l)
      for (var p = 0; p < c.length; p++)
        c[p][0] <= t && t <= c[p][1] && (h = c[p]);
    if (h || (d && d[t])) {
      if (h && 17 !== h[2]) throw "not a PNG";
      null == e["__tmp"] && (e["__tmp"] = {});
      var m = e["__tmp"]["g" + t];
      if (null == m) {
        var b, g;
        if (d) (b = d[t]), (g = b.length);
        else {
          var y = h[3][t - h[0]] + 5;
          (g = (u[y + 1] << 16) | (u[y + 2] << 8) | u[y + 3]),
            (y += 4),
            (b = new Uint8Array(u.buffer, u.byteOffset + y, g));
        }
        var v = "";
        for (p = 0; p < g; p++) v += String.fromCharCode(b[p]);
        m = e["__tmp"]["g" + t] = "data:image/png;base64," + btoa(v);
      }
      n.cmds.push(m);
      var S = 1.15 * e["head"]["unitsPerEm"],
        w = Math.round(S),
        C = Math.round(S),
        A = Math.round(0.15 * -C);
      n.crds.push(0, C + A, w, C + A, w, A, 0, A);
    } else if (o && o.entries[t]) {
      var _ = o.entries[t];
      null !== _ &&
        ("string" == typeof _ && ((_ = f["SVG"].toPath(_)), (o.entries[t] = _)),
        (n = _));
    } else if (1 !== r && s && s[0]["g" + t] && s[0]["g" + t][1] > 1) {
      var I = function(e) {
          var t = e.toString(16);
          return (1 == t.length ? "0" : "") + t;
        },
        E = e["CPAL"],
        T = s[0]["g" + t];
      for (p = 0; p < T[1]; p++) {
        var x = T[0] + p,
          P = s[1][2 * x],
          k = 4 * s[1][2 * x + 1],
          D = Util["glyphToPath"](e, P, P == t),
          O = "#" + I(E[k + 2]) + I(E[k + 1]) + I(E[k + 0]);
        n.cmds.push(O),
          (n.cmds = n.cmds.concat(D["cmds"])),
          (n.crds = n.crds.concat(D["crds"])),
          n.cmds.push("X");
      }
    } else if (a) {
      var R = a["Private"],
        M = {
          x: 0,
          y: 0,
          stack: [],
          nStems: 0,
          haveWidth: !1,
          width: R ? R["defaultWidthX"] : 0,
          open: !1
        };
      if (a["ROS"]) {
        var N = 0;
        while (a["FDSelect"][N + 2] <= t) N += 2;
        R = a["FDArray"][a["FDSelect"][N + 1]]?.["Private"];
      }
      f["_drawCFF"](a["CharStrings"][t], M, a, R, n);
    } else if (e["glyf"]) f["_drawGlyf"](t, e, n);
    else {
      T = fontTags.glyf._parseGlyf2(e, t);
      null !== T &&
        (T.noc > -1
          ? Util["_simpleGlyph"](T, n)
          : Util["_compoGlyph"](T, e, n));
    }
    // console.log('n is ', n);
    return { cmds: n.cmds, crds: n.crds };
  },
  _drawGlyf: function(e, t, r) {
    var n = t["glyf"][e];
    null == n && (n = t["glyf"][e] = fontTags.glyf._parseGlyf(t, e)),
      null !== n &&
        (n.noc > -1
          ? Util["_simpleGlyph"](n, r)
          : Util["_compoGlyph"](n, t, r));
  },
  _simpleGlyph: function(e, t) {
    for (var r = Util["P"], n = 0; n < e.noc; n++) {
      for (
        var o = 0 == n ? 0 : e.endPts[n - 1] + 1, a = e.endPts[n], s = o;
        s <= a;
        s++
      ) {
        var c = s == o ? a : s - 1,
          u = s == a ? o : s + 1,
          d = 1 & e.flags[s],
          l = 1 & e.flags[c],
          f = 1 & e.flags[u],
          h = e.xs[s],
          p = e.ys[s];
        if (s == o)
          if (d) {
            if (!l) {
              r.MoveTo(t, h, p);
              continue;
            }
            r.MoveTo(t, e.xs[c], e.ys[c]);
          } else
            l
              ? r.MoveTo(t, e.xs[c], e.ys[c])
              : r.MoveTo(
                  t,
                  Math.floor(0.5 * (e.xs[c] + h)),
                  Math.floor(0.5 * (e.ys[c] + p))
                );
        d
          ? l && r.LineTo(t, h, p)
          : f
          ? r.qCurveTo(t, h, p, e.xs[u], e.ys[u])
          : r.qCurveTo(
              t,
              h,
              p,
              Math.floor(0.5 * (h + e.xs[u])),
              Math.floor(0.5 * (p + e.ys[u]))
            );
      }
      r.ClosePath(t);
    }
  },
  _compoGlyph: function(e, t, r) {
    for (var n = 0; n < e.parts.length; n++) {
      var o = { cmds: [], crds: [] },
        a = e.parts[n];
      Util["_drawGlyf"](a.glyphIndex, t, o);
      for (var s = a.m, c = 0; c < o.crds.length; c += 2) {
        var u = o.crds[c],
          d = o.crds[c + 1];
        r.crds.push(u * s.a + d * s.c + s.tx),
          r.crds.push(u * s.b + d * s.d + s.ty);
      }
      for (c = 0; c < o.cmds.length; c++) r.cmds.push(o.cmds[c]);
    }
  },
  pathToSVG: function(e, t) {
    var r = e["cmds"],
      n = e["crds"];

    function i(e) {
      return parseFloat(e.toFixed(t));
    }

    function o(e) {
      for (var t = [], r = !1, n = "", i = 0; i < e.length; i++) {
        var o = e[i],
          a = "number" == typeof o;
        if (!a) {
          if (o == n && 1 == o.length && "m" !== o) continue;
          n = o;
        }
        r && a && o >= 0 && t.push(" "), t.push(o), (r = a);
      }
      return t.join("");
    }

    null == t && (t = 5);
    for (
      var a = [],
        s = 0,
        c = {
          M: 2,
          L: 2,
          Q: 4,
          C: 6
        },
        u = 0,
        d = 0,
        l = 0,
        f = 0,
        h = 0,
        p = 0,
        m = 0;
      m < r.length;
      m++
    ) {
      var b,
        g,
        y,
        v,
        S = r[m],
        w = c[S] ? c[S] : 0,
        C = [];
      if ("L" == S)
        (b = n[s] - u),
          (g = n[s + 1] - d),
          (y = i(b + l)),
          (v = i(g + f)),
          "Z" == r[m + 1] && n[s] == h && n[s + 1] == p
            ? ((y = b), (v = g))
            : (0 == y && 0 == v) ||
              (0 == y
                ? C.push("v", v)
                : 0 == v
                ? C.push("h", y)
                : C.push("l", y, v));
      else {
        C.push(S.toLowerCase());
        for (var A = 0; A < w; A += 2)
          (b = n[s + A] - u),
            (g = n[s + A + 1] - d),
            (y = i(b + l)),
            (v = i(g + f)),
            C.push(y, v);
      }
      0 !== w && ((l += b - y), (f += g - v));
      var _ = C;
      for (A = 0; A < _.length; A++) a.push(_[A]);
      0 !== w && ((s += w), (u = n[s - 2]), (d = n[s - 1])),
        "M" == S && ((h = u), (p = d)),
        "Z" == S && ((u = h), (d = p));
    }
    return o(a);
  },
  SVGToPath: function(e) {
    var t = { cmds: [], crds: [] };
    return Util["SVG"].svgToPath(e, t), { cmds: t.cmds, crds: t.crds };
  },
  pathToContext: (function() {
    var e, t;

    function r(r, n) {
      for (var i = 0, o = r["cmds"], a = r["crds"], s = 0; s < o.length; s++) {
        var c = o[s];
        if ("M" == c) n.moveTo(a[i], a[i + 1]), (i += 2);
        else if ("L" == c) n.lineTo(a[i], a[i + 1]), (i += 2);
        else if ("C" == c)
          n.bezierCurveTo(
            a[i],
            a[i + 1],
            a[i + 2],
            a[i + 3],
            a[i + 4],
            a[i + 5]
          ),
            (i += 6);
        else if ("Q" == c)
          n.quadraticCurveTo(a[i], a[i + 1], a[i + 2], a[i + 3]), (i += 4);
        else if ("d" == c[0]) {
          var u = window["UPNG"],
            d = a[i],
            l = a[i + 1],
            f = a[i + 2],
            h = a[i + 3],
            p = a[i + 4],
            m = a[i + 5],
            b = a[i + 6],
            g = a[i + 7];
          if (((i += 8), null == u)) {
            n.moveTo(d, l),
              n.lineTo(f, h),
              n.lineTo(p, m),
              n.lineTo(b, g),
              n.closePath();
            continue;
          }
          n.save();
          for (
            var y = f - d,
              v = h - l,
              S = Math.sqrt(y * y + v * v),
              w = Math.atan2(v, y),
              C = b - d,
              A = g - l,
              _ = Math.sqrt(C * C + A * A),
              I = Math.sign(y * A - v * C),
              E = atob(c.slice(22)),
              T = [],
              x = 0;
            x < E.length;
            x++
          )
            T[x] = E.charCodeAt(x);
          var P = u["decode"](new Uint8Array(T)),
            k = P["width"],
            D = P["height"],
            O = new Uint8Array(u["toRGBA8"](P)[0]);
          null == e &&
            ((e = document.createElement("canvas")), (t = e.getContext("2d"))),
            (e.width == k && e.height == D) || ((e.width = k), (e.height = D)),
            t.putImageData(
              new ImageData(new Uint8ClampedArray(O.buffer), k, D),
              0,
              0
            ),
            n.translate(d, l),
            n.rotate(w),
            n.scale((S * (k / D)) / k, (I * _) / D),
            n.drawImage(e, 0, 0),
            n.restore();
        } else if ("#" == c.charAt(0) || "r" == c.charAt(0))
          n.beginPath(), (n.fillStyle = c);
        else if ("O" == c.charAt(0) && "OX" !== c) {
          n.beginPath();
          var R = c.split("-");
          (n.lineWidth = parseFloat(R[2])), (n.strokeStyle = R[1]);
        } else
          "Z" == c
            ? n.closePath()
            : "X" == c
            ? n.fill()
            : "OX" == c && n.stroke();
      }
    }

    return r;
  })(),
  P: {
    MoveTo: function(e, t, r) {
      e.cmds.push("M"), e.crds.push(t, r);
    },
    LineTo: function(e, t, r) {
      e.cmds.push("L"), e.crds.push(t, r);
    },
    CurveTo: function(e, t, r, n, i, o, a) {
      e.cmds.push("C"), e.crds.push(t, r, n, i, o, a);
    },
    qCurveTo: function(e, t, r, n, i) {
      e.cmds.push("Q"), e.crds.push(t, r, n, i);
    },
    ClosePath: function(e) {
      e.cmds.push("Z");
    }
  },
  _drawCFF: function(e, t, r, n, o) {
    var a = t.stack,
      s = t.nStems,
      c = t.haveWidth,
      u = t.width,
      d = t.open,
      l = 0,
      f = t.x,
      h = t.y,
      p = 0,
      m = 0,
      b = 0,
      g = 0,
      y = 0,
      v = 0,
      S = 0,
      w = 0,
      C = 0,
      A = 0,
      _ = fontTags.CFF,
      I = Util["P"],
      E = n?.["nominalWidthX"],
      T = { val: 0, size: 0 };
    while (e && l < e.length) {
      _.getCharString(e, l, T);
      var x = T.val;
      if (((l += T.size), "o1" == x || "o18" == x))
        (U = a.length % 2 !== 0),
          U && !c && (u = a.shift() + E),
          (s += a.length >> 1),
          (a.length = 0),
          (c = !0);
      else if ("o3" == x || "o23" == x) {
        (U = a.length % 2 !== 0),
          U && !c && (u = a.shift() + E),
          (s += a.length >> 1),
          (a.length = 0),
          (c = !0);
      } else if ("o4" == x)
        a.length > 1 && !c && ((u = a.shift() + E), (c = !0)),
          d && I.ClosePath(o),
          (h += a.pop()),
          I.MoveTo(o, f, h),
          (d = !0);
      else if ("o5" == x)
        while (a.length > 0)
          (f += a.shift()), (h += a.shift()), I.LineTo(o, f, h);
      else if ("o6" == x || "o7" == x)
        for (var P = a.length, k = "o6" == x, D = 0; D < P; D++) {
          var O = a.shift();
          k ? (f += O) : (h += O), (k = !k), I.LineTo(o, f, h);
        }
      else if ("o8" == x || "o24" == x) {
        P = a.length;
        var R = 0;
        while (R + 6 <= P)
          (p = f + a.shift()),
            (m = h + a.shift()),
            (b = p + a.shift()),
            (g = m + a.shift()),
            (f = b + a.shift()),
            (h = g + a.shift()),
            I.CurveTo(o, p, m, b, g, f, h),
            (R += 6);
        "o24" == x && ((f += a.shift()), (h += a.shift()), I.LineTo(o, f, h));
      } else {
        if ("o11" == x) break;
        if ("o1234" == x || "o1235" == x || "o1236" == x || "o1237" == x)
          "o1234" == x &&
            ((p = f + a.shift()),
            (m = h),
            (b = p + a.shift()),
            (g = m + a.shift()),
            (C = b + a.shift()),
            (A = g),
            (y = C + a.shift()),
            (v = g),
            (S = y + a.shift()),
            (w = h),
            (f = S + a.shift()),
            I.CurveTo(o, p, m, b, g, C, A),
            I.CurveTo(o, y, v, S, w, f, h)),
            "o1235" == x &&
              ((p = f + a.shift()),
              (m = h + a.shift()),
              (b = p + a.shift()),
              (g = m + a.shift()),
              (C = b + a.shift()),
              (A = g + a.shift()),
              (y = C + a.shift()),
              (v = A + a.shift()),
              (S = y + a.shift()),
              (w = v + a.shift()),
              (f = S + a.shift()),
              (h = w + a.shift()),
              a.shift(),
              I.CurveTo(o, p, m, b, g, C, A),
              I.CurveTo(o, y, v, S, w, f, h)),
            "o1236" == x &&
              ((p = f + a.shift()),
              (m = h + a.shift()),
              (b = p + a.shift()),
              (g = m + a.shift()),
              (C = b + a.shift()),
              (A = g),
              (y = C + a.shift()),
              (v = g),
              (S = y + a.shift()),
              (w = v + a.shift()),
              (f = S + a.shift()),
              I.CurveTo(o, p, m, b, g, C, A),
              I.CurveTo(o, y, v, S, w, f, h)),
            "o1237" == x &&
              ((p = f + a.shift()),
              (m = h + a.shift()),
              (b = p + a.shift()),
              (g = m + a.shift()),
              (C = b + a.shift()),
              (A = g + a.shift()),
              (y = C + a.shift()),
              (v = A + a.shift()),
              (S = y + a.shift()),
              (w = v + a.shift()),
              Math.abs(S - f) > Math.abs(w - h)
                ? (f = S + a.shift())
                : (h = w + a.shift()),
              I.CurveTo(o, p, m, b, g, C, A),
              I.CurveTo(o, y, v, S, w, f, h));
        else if ("o14" == x) {
          if (
            (a.length > 0 &&
              4 !== a.length &&
              !c &&
              ((u = a.shift() + r["nominalWidthX"]), (c = !0)),
            4 == a.length)
          ) {
            var M = a.shift(),
              N = a.shift(),
              B = a.shift(),
              F = a.shift(),
              j = _.glyphBySE(r, B),
              K = _.glyphBySE(r, F);
            Util["_drawCFF"](r["CharStrings"][j], t, r, n, o),
              (t.x = M),
              (t.y = N),
              Util["_drawCFF"](r["CharStrings"][K], t, r, n, o);
          }
          d && (I.ClosePath(o), (d = !1));
        } else if ("o19" == x || "o20" == x) {
          var U;
          (U = a.length % 2 !== 0),
            U && !c && (u = a.shift() + E),
            (s += a.length >> 1),
            (a.length = 0),
            (c = !0),
            (l += (s + 7) >> 3);
        } else if ("o21" == x)
          a.length > 2 && !c && ((u = a.shift() + E), (c = !0)),
            (h += a.pop()),
            (f += a.pop()),
            d && I.ClosePath(o),
            I.MoveTo(o, f, h),
            (d = !0);
        else if ("o22" == x)
          a.length > 1 && !c && ((u = a.shift() + E), (c = !0)),
            (f += a.pop()),
            d && I.ClosePath(o),
            I.MoveTo(o, f, h),
            (d = !0);
        else if ("o25" == x) {
          while (a.length > 6)
            (f += a.shift()), (h += a.shift()), I.LineTo(o, f, h);
          (p = f + a.shift()),
            (m = h + a.shift()),
            (b = p + a.shift()),
            (g = m + a.shift()),
            (f = b + a.shift()),
            (h = g + a.shift()),
            I.CurveTo(o, p, m, b, g, f, h);
        } else if ("o26" == x) {
          a.length % 2 && (f += a.shift());
          while (a.length > 0)
            (p = f),
              (m = h + a.shift()),
              (b = p + a.shift()),
              (g = m + a.shift()),
              (f = b),
              (h = g + a.shift()),
              I.CurveTo(o, p, m, b, g, f, h);
        } else if ("o27" == x) {
          a.length % 2 && (h += a.shift());
          while (a.length > 0)
            (p = f + a.shift()),
              (m = h),
              (b = p + a.shift()),
              (g = m + a.shift()),
              (f = b + a.shift()),
              (h = g),
              I.CurveTo(o, p, m, b, g, f, h);
        } else if ("o10" == x || "o29" == x) {
          var L = "o10" == x ? n : r;
          if (0 == a.length) console.log("error: empty stack");
          else {
            var X = a.pop(),
              z = L["Subrs"][X + L["Bias"]];
            (t.x = f),
              (t.y = h),
              (t.nStems = s),
              (t.haveWidth = c),
              (t.width = u),
              (t.open = d),
              Util["_drawCFF"](z, t, r, n, o),
              (f = t.x),
              (h = t.y),
              (s = t.nStems),
              (c = t.haveWidth),
              (u = t.width),
              (d = t.open);
          }
        } else if ("o30" == x || "o31" == x) {
          var G = a.length,
            W = ((R = 0), "o31" == x);
          (P = -3 & G), (R += G - P);
          while (R < P)
            W
              ? ((p = f + a.shift()),
                (m = h),
                (b = p + a.shift()),
                (g = m + a.shift()),
                (h = g + a.shift()),
                P - R == 5 ? ((f = b + a.shift()), R++) : (f = b),
                (W = !1))
              : ((p = f),
                (m = h + a.shift()),
                (b = p + a.shift()),
                (g = m + a.shift()),
                (f = b + a.shift()),
                P - R == 5 ? ((h = g + a.shift()), R++) : (h = g),
                (W = !0)),
              I.CurveTo(o, p, m, b, g, f, h),
              (R += 4);
        } else {
          if ("o" == (x + "").charAt(0))
            throw (console.log("Unknown operation: " + x, e), x);
          a.push(x);
        }
      }
    }
    (t.x = f),
      (t.y = h),
      (t.nStems = s),
      (t.haveWidth = c),
      (t.width = u),
      (t.open = d);
  },
  SVG: (function() {
    var e = {
      getScale: function(e) {
        return Math.sqrt(Math.abs(e[0] * e[3] - e[1] * e[2]));
      },
      translate: function(t, r, n) {
        e.concat(t, [1, 0, 0, 1, r, n]);
      },
      rotate: function(t, r) {
        e.concat(t, [
          Math.cos(r),
          -Math.sin(r),
          Math.sin(r),
          Math.cos(r),
          0,
          0
        ]);
      },
      scale: function(t, r, n) {
        e.concat(t, [r, 0, 0, n, 0, 0]);
      },
      concat: function(e, t) {
        var r = e[0],
          n = e[1],
          i = e[2],
          o = e[3],
          a = e[4],
          s = e[5];
        (e[0] = r * t[0] + n * t[2]),
          (e[1] = r * t[1] + n * t[3]),
          (e[2] = i * t[0] + o * t[2]),
          (e[3] = i * t[1] + o * t[3]),
          (e[4] = a * t[0] + s * t[2] + t[4]),
          (e[5] = a * t[1] + s * t[3] + t[5]);
      },
      invert: function(e) {
        var t = e[0],
          r = e[1],
          n = e[2],
          i = e[3],
          o = e[4],
          a = e[5],
          s = t * i - r * n;
        (e[0] = i / s),
          (e[1] = -r / s),
          (e[2] = -n / s),
          (e[3] = t / s),
          (e[4] = (n * a - i * o) / s),
          (e[5] = (r * o - t * a) / s);
      },
      multPoint: function(e, t) {
        var r = t[0],
          n = t[1];
        return [r * e[0] + n * e[2] + e[4], r * e[1] + n * e[3] + e[5]];
      },
      multArray: function(e, t) {
        for (var r = 0; r < t.length; r += 2) {
          var n = t[r],
            i = t[r + 1];
          (t[r] = n * e[0] + i * e[2] + e[4]),
            (t[r + 1] = n * e[1] + i * e[3] + e[5]);
        }
      }
    };

    function t(e, t, r) {
      var n = [],
        i = 0,
        o = 0,
        a = 0;
      while (1) {
        var s = e.indexOf(t, o),
          c = e.indexOf(r, o);
        if (-1 == s && -1 == c) break;
        -1 == c || (-1 !== s && s < c)
          ? (0 == a && (n.push(e.slice(i, s).trim()), (i = s + 1)),
            a++,
            (o = s + 1))
          : (-1 == s || (-1 !== c && c < s)) &&
            (a--,
            0 == a && (n.push(e.slice(i, c).trim()), (i = c + 1)),
            (o = c + 1));
      }
      return n;
    }

    function r(e) {
      for (var r = t(e, "{", "}"), n = {}, i = 0; i < r.length; i += 2)
        for (var o = r[i].split(","), a = 0; a < o.length; a++) {
          var s = o[a].trim();
          null == n[s] && (n[s] = ""), (n[s] += r[i + 1]);
        }
      return n;
    }

    function n(r) {
      for (
        var n = t(r, "(", ")"), o = [1, 0, 0, 1, 0, 0], a = 0;
        a < n.length;
        a += 2
      ) {
        var s = o;
        (o = i(n[a], n[a + 1])), e.concat(o, s);
      }
      return o;
    }

    function i(t, r) {
      for (var n = [1, 0, 0, 1, 0, 0], i = !0, o = 0; o < r.length; o++) {
        var a = r.charAt(o);
        "," == a || " " == a
          ? (i = !0)
          : "." == a
          ? (i || ((r = r.slice(0, o) + "," + r.slice(o)), o++), (i = !1))
          : "-" == a &&
            o > 0 &&
            "e" !== r[o - 1] &&
            ((r = r.slice(0, o) + " " + r.slice(o)), o++, (i = !0));
      }
      if (((r = r.split(/\s*[\s,]\s*/).map(parseFloat)), "translate" == t))
        1 == r.length ? e.translate(n, r[0], 0) : e.translate(n, r[0], r[1]);
      else if ("scale" == t)
        1 == r.length ? e.scale(n, r[0], r[0]) : e.scale(n, r[0], r[1]);
      else if ("rotate" == t) {
        var s = 0,
          c = 0;
        1 !== r.length && ((s = r[1]), (c = r[2])),
          e.translate(n, -s, -c),
          e.rotate(n, (-Math.PI * r[0]) / 180),
          e.translate(n, s, c);
      } else "matrix" == t ? (n = r) : console.log("unknown transform: ", t);
      return n;
    }

    function o(e) {
      var t = { cmds: [], crds: [] };
      if (null == e) return t;
      var r = new DOMParser(),
        n = r["parseFromString"](e, "image/svg+xml"),
        i = n.getElementsByTagName("svg")[0],
        o = i.getAttribute("viewBox");
      (o = o
        ? o
            .trim()
            .split(" ")
            .map(parseFloat)
        : [0, 0, 1e3, 1e3]),
        a(i.children, t);
      for (var s = 0; s < t.crds.length; s += 2) {
        var c = t.crds[s],
          u = t.crds[s + 1];
        (c -= o[0]),
          (u -= o[1]),
          (u = -u),
          (t.crds[s] = c),
          (t.crds[s + 1] = u);
      }
      return t;
    }

    function a(t, r, i) {
      for (var o = 0; o < t.length; o++) {
        var s = t[o],
          c = s.tagName,
          d = s.getAttribute("fill");
        if ((null == d && (d = i), "g" == c)) {
          var l = { crds: [], cmds: [] };
          a(s.children, l, d);
          var f = s.getAttribute("transform");
          if (f) {
            var h = n(f);
            e.multArray(h, l.crds);
          }
          (r.crds = r.crds.concat(l.crds)), (r.cmds = r.cmds.concat(l.cmds));
        } else if ("path" == c || "circle" == c || "ellipse" == c) {
          var p;
          if (
            (r.cmds.push(d || "#000000"),
            "path" == c && (p = s.getAttribute("d")),
            "circle" == c || "ellipse" == c)
          ) {
            for (
              var m = [0, 0, 0, 0], b = ["cx", "cy", "rx", "ry", "r"], g = 0;
              g < 5;
              g++
            ) {
              var y = s.getAttribute(b[g]);
              y &&
                ((y = parseFloat(y)), g < 4 ? (m[g] = y) : (m[2] = m[3] = y));
            }
            var v = m[0],
              S = m[1],
              w = m[2],
              C = m[3];
            p = [
              "M",
              v - w,
              S,
              "a",
              w,
              C,
              0,
              1,
              0,
              2 * w,
              0,
              "a",
              w,
              C,
              0,
              1,
              0,
              2 * -w,
              0
            ].join(" ");
          }
          u(p, r), r.cmds.push("X");
        } else "defs" == c || console.log(c, s);
      }
    }

    function s(e) {
      var t = [],
        r = 0,
        n = !1,
        i = "",
        o = "",
        a = "",
        s = 0;
      while (r < e.length) {
        var c = e.charCodeAt(r),
          u = e.charAt(r);
        r++;
        var d =
          (48 <= c && c <= 57) ||
          "." == u ||
          "-" == u ||
          "+" == u ||
          "e" == u ||
          "E" == u;
        n
          ? (("+" == u || "-" == u) && "e" !== o) ||
            ("." == u && -1 !== i.indexOf(".")) ||
            (d && ("a" == a || "A" == a) && (s % 7 == 3 || s % 7 == 4))
            ? (t.push(parseFloat(i)), s++, (i = u))
            : d
            ? (i += u)
            : (t.push(parseFloat(i)),
              s++,
              "," !== u && " " !== u && (t.push(u), (a = u), (s = 0)),
              (n = !1))
          : d
          ? ((i = u), (n = !0))
          : "," !== u && " " !== u && (t.push(u), (a = u), (s = 0)),
          (o = u);
      }
      return n && t.push(parseFloat(i)), t;
    }

    function c(e, t, r) {
      var n = t;
      while (n < e.length) {
        if ("string" == typeof e[n]) break;
        n += r;
      }
      return (n - t) / r;
    }

    function u(e, t) {
      var r = s(e),
        n = 0,
        i = 0,
        o = 0,
        a = 0,
        u = 0,
        d = t.crds.length,
        l = { M: 2, L: 2, H: 1, V: 1, T: 2, S: 4, A: 7, Q: 4, C: 6 },
        f = t.cmds,
        h = t.crds;
      while (n < r.length) {
        var p = r[n];
        n++;
        var m = p.toUpperCase();
        if ("Z" == m) f.push("Z"), (i = a), (o = u);
        else
          for (var b = l[m], g = c(r, n, b), y = 0; y < g; y++) {
            1 == y && "M" == m && ((p = p == m ? "L" : "l"), (m = "L"));
            var v = 0,
              S = 0;
            if ((p !== m && ((v = i), (S = o)), "M" == m))
              (i = v + r[n++]),
                (o = S + r[n++]),
                f.push("M"),
                h.push(i, o),
                (a = i),
                (u = o);
            else if ("L" == m)
              (i = v + r[n++]), (o = S + r[n++]), f.push("L"), h.push(i, o);
            else if ("H" == m) (i = v + r[n++]), f.push("L"), h.push(i, o);
            else if ("V" == m) (o = S + r[n++]), f.push("L"), h.push(i, o);
            else if ("Q" == m) {
              var w = v + r[n++],
                C = S + r[n++],
                A = v + r[n++],
                _ = S + r[n++];
              f.push("Q"), h.push(w, C, A, _), (i = A), (o = _);
            } else if ("T" == m) {
              var I = Math.max(h.length - ("Q" == f[f.length - 1] ? 4 : 2), d);
              (w = i + i - h[I]),
                (C = o + o - h[I + 1]),
                (A = v + r[n++]),
                (_ = S + r[n++]);
              f.push("Q"), h.push(w, C, A, _), (i = A), (o = _);
            } else if ("C" == m) {
              (w = v + r[n++]),
                (C = S + r[n++]),
                (A = v + r[n++]),
                (_ = S + r[n++]);
              var E = v + r[n++],
                T = S + r[n++];
              f.push("C"), h.push(w, C, A, _, E, T), (i = E), (o = T);
            } else if ("S" == m) {
              (I = Math.max(h.length - ("C" == f[f.length - 1] ? 4 : 2), d)),
                (w = i + i - h[I]),
                (C = o + o - h[I + 1]),
                (A = v + r[n++]),
                (_ = S + r[n++]),
                (E = v + r[n++]),
                (T = S + r[n++]);
              f.push("C"), h.push(w, C, A, _, E, T), (i = E), (o = T);
            } else if ("A" == m) {
              (w = i), (C = o);
              var x = r[n++],
                P = r[n++],
                k = r[n++] * (Math.PI / 180),
                D = r[n++],
                O = r[n++];
              (A = v + r[n++]), (_ = S + r[n++]);
              if (A == i && _ == o && 0 == x && 0 == P) continue;
              var R = (w - A) / 2,
                M = (C - _) / 2,
                N = Math.cos(k),
                B = Math.sin(k),
                F = N * R + B * M,
                j = -B * R + N * M,
                K = x * x,
                U = P * P,
                L = F * F,
                X = j * j,
                z = (K * U - K * X - U * L) / (K * X + U * L),
                G = (D !== O ? 1 : -1) * Math.sqrt(Math.max(z, 0)),
                W = (G * (x * j)) / P,
                q = (P * F * -G) / x,
                H = N * W - B * q + (w + A) / 2,
                V = B * W + N * q + (C + _) / 2,
                Y = function(e, t, r, n) {
                  var i = Math.sqrt(e * e + t * t),
                    o = Math.sqrt(r * r + n * n),
                    a = (e * r + t * n) / (i * o);
                  return (
                    (e * n - t * r >= 0 ? 1 : -1) *
                    Math.acos(Math.max(-1, Math.min(1, a)))
                  );
                },
                Q = (F - W) / x,
                Z = (j - q) / P,
                J = Y(1, 0, Q, Z),
                $ = Y(Q, Z, (-F - W) / x, (-j - q) / P);
              $ %= 2 * Math.PI;
              var ee = function(e, t, r, n, i, o, a) {
                  var s = function(e, t) {
                      var r = Math.sin(t),
                        n = Math.cos(t),
                        i = ((t = e[0]), e[1]),
                        o = e[2],
                        a = e[3];
                      (e[0] = t * n + i * r),
                        (e[1] = -t * r + i * n),
                        (e[2] = o * n + a * r),
                        (e[3] = -o * r + a * n);
                    },
                    c = function(e, t) {
                      for (var r = 0; r < t.length; r += 2) {
                        var n = t[r],
                          i = t[r + 1];
                        (t[r] = e[0] * n + e[2] * i + e[4]),
                          (t[r + 1] = e[1] * n + e[3] * i + e[5]);
                      }
                    },
                    u = function(e, t) {
                      for (var r = 0; r < t.length; r++) e.push(t[r]);
                    },
                    d = function(e, t) {
                      u(e.cmds, t.cmds), u(e.crds, t.crds);
                    };
                  if (a) while (o > i) o -= 2 * Math.PI;
                  else while (o < i) o += 2 * Math.PI;
                  var l = (o - i) / 4,
                    f = Math.cos(l / 2),
                    h = -Math.sin(l / 2),
                    p = (4 - f) / 3,
                    m = 0 == h ? h : ((1 - f) * (3 - f)) / (3 * h),
                    b = p,
                    g = -m,
                    y = f,
                    v = -h,
                    S = [p, m, b, g, y, v],
                    w = { cmds: ["C", "C", "C", "C"], crds: S.slice(0) },
                    C = [1, 0, 0, 1, 0, 0];
                  s(C, -l);
                  for (var A = 0; A < 3; A++) c(C, S), u(w.crds, S);
                  s(C, l / 2 - i),
                    (C[0] *= n),
                    (C[1] *= n),
                    (C[2] *= n),
                    (C[3] *= n),
                    (C[4] = t),
                    (C[5] = r),
                    c(C, w.crds),
                    c(e.ctm, w.crds),
                    d(e.pth, w);
                },
                te = { pth: t, ctm: [x * N, x * B, -P * B, P * N, H, V] };
              ee(te, 0, 0, 1, J, J + $, 0 == O), (i = A), (o = _);
            } else console.log("Unknown SVG command " + p);
          }
      }
    }

    return { cssMap: r, readTrnf: n, svgToPath: u, toPath: o };
  })(),
  initHB: function(e, t) {
    var r = function(e) {
      var t = 0;
      return (
        0 == (4294967168 & e)
          ? (t = 1)
          : 0 == (4294965248 & e)
          ? (t = 2)
          : 0 == (4294901760 & e)
          ? (t = 3)
          : 0 == (4292870144 & e) && (t = 4),
        t
      );
    };
    fetch(e)
      .then(function(e) {
        return e["arrayBuffer"]();
      })
      .then(function(e) {
        return WebAssembly["instantiate"](e);
      })
      .then(function(e) {
        // console.log("HB ready");
        var n,
          o,
          a,
          s,
          c,
          u,
          d,
          l,
          f = e["instance"]["exports"],
          h = f["memory"];
        (Util["shapeHB"] = (function() {
          var e,
            t = function(e) {
              for (
                var t = f["hb_buffer_get_length"](e),
                  r = [],
                  n = f["hb_buffer_get_glyph_infos"](e, 0) >>> 2,
                  i = f["hb_buffer_get_glyph_positions"](e, 0) >>> 2,
                  s = 0;
                s < t;
                ++s
              ) {
                var c = n + 5 * s,
                  u = i + 5 * s;
                r.push({
                  g: o[c + 0],
                  cl: o[c + 2],
                  ax: a[u + 0],
                  ay: a[u + 1],
                  dx: a[u + 2],
                  dy: a[u + 3]
                });
              }
              return r;
            };
          return function(i, p, m) {
            var b = i["_data"],
              g = i["name"]["postScriptName"],
              y = h.buffer.byteLength,
              v = 2 * b.length + 16 * p.length + 4e6;
            if (
              (y < v && h["grow"](4 + ((v - y) >>> 16)),
              (n = new Uint8Array(h.buffer)),
              (o = new Uint32Array(h.buffer)),
              (a = new Int32Array(h.buffer)),
              s !== g &&
                (null !== c &&
                  (f["hb_blob_destroy"](c),
                  f["free"](u),
                  f["hb_face_destroy"](d),
                  f["hb_font_destroy"](l)),
                (u = f["malloc"](b.byteLength)),
                n.set(b, u),
                (c = f["hb_blob_create"](u, b.byteLength, 2, 0, 0)),
                (d = f["hb_face_create"](c, 0)),
                (l = f["hb_font_create"](d)),
                (s = g)),
              null !== window["TextEncoder"])
            ) {
              null == e && (e = new window["TextEncoder"]("utf8"));
              var S = f["hb_buffer_create"](),
                w = e["encode"](p),
                C = w.length,
                A = f["malloc"](C);
              n.set(w, A),
                f["hb_buffer_add_utf8"](S, A, C, 0, C),
                f["free"](A),
                f["hb_buffer_set_direction"](S, m ? 4 : 5),
                f["hb_buffer_guess_segment_properties"](S),
                f["hb_shape"](l, S, 0, 0);
              var _ = t(S);
              f["hb_buffer_destroy"](S);
              var I = _.slice(0);
              m || I.reverse();
              for (var E = 0, T = 0, x = 1; x < I.length; x++) {
                var P = I[x],
                  k = P["cl"];
                while (1) {
                  var D = p.codePointAt(E),
                    O = r(D);
                  if (!(T + O <= k)) break;
                  (T += O), (E += D <= 65535 ? 1 : 2);
                }
                P["cl"] = E;
              }
              return _;
            }
            alert("Your browser is too old. Please, update it.");
          };
        })()),
          t();
      });
  }
};
