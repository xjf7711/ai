import { Bin } from "./bin";
import { fontTags } from "./tags";

export const openFont = {
  parse: function(e) {
    console.log("parse , e is ", e);
    var t = function(e, t, r, n) {
      console.log('t ');
      // Bin;
      var o = fontTags;
      var a = {
          cmap: o.cmap,
          head: o.head,
          hhea: o.hhea,
          maxp: o.maxp,
          hmtx: o.hmtx,
          name: o.name,
          "OS/2": o.OS2,
          post: o.post,
          loca: o.loca,
          kern: o.kern,
          glyf: o.glyf,
          "CFF ": o.CFF,
          CBLC: o.CBLC,
          CBDT: o.CBDT,
          "SVG ": o.SVG,
          COLR: o.colr,
          CPAL: o.cpal,
          sbix: o.sbix
        },
        s = { _data: e, _index: t, _offset: r };
      for (var c in a) {
        var u = openFont.findTable(e, c, r);
        console.log('u is ', u)
        if (u) {
          var d = u[0],
            l = n[d];
          null == l && (l = a[c].parseTab(e, d, s)), (s[c] = n[d] = l);
        }
      }
      console.log('s is ', s);
      console.log('n is ', n);
      if (!s["head"]) {
        l = a["CFF "].parseTab(e, 0);
        s["CFF "] = l;
      }
      return s;
    };
    var r = Bin;
    var n = new Uint8Array(e);
    var o = {};
    var a = r.readASCII(n, 0, 4);
    if ("ttcf" == a) {
      var s = 4;
      r.readUshort(n, s);
      s += 2;
      r.readUshort(n, s);
      s += 2;
      var c = r.readUint(n, s);
      s += 4;
      for (var u = [], d = 0; d < c; d++) {
        var l = r.readUint(n, s);
        s += 4;
        u.push(t(n, d, l, o));
      }
      return u;
    }
    return [t(n, 0, 0, o)];
  },
  findTable: function(e, t, r) {
    for (
      var n = Bin, o = n.readUshort(e, r + 4), a = r + 12, s = 0;
      s < o;
      s++
    ) {
      var c = n.readASCII(e, a, 4),
        u = (n.readUint(e, a + 4), n.readUint(e, a + 8)),
        d = n.readUint(e, a + 12);
      if (c == t) return [u, d];
      a += 16;
    }
    return null;
  }
};
