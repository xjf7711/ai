import { Bin } from "../bin";
import { fontTags } from "assets/js/open-font/tags/index";

export const name = {
  parseTab: function(e, t, r) {
    let n = Bin,
      o = {};
    n.readUshort(e, t);
    t += 2;
    let a = n.readUshort(e, t);
    t += 2;
    n.readUshort(e, t);
    t += 2;
    for (
      let s = [
          "copyright",
          "fontFamily",
          "fontSubfamily",
          "ID",
          "fullName",
          "version",
          "postScriptName",
          "trademark",
          "manufacturer",
          "designer",
          "description",
          "urlVendor",
          "urlDesigner",
          "licence",
          "licenceURL",
          "---",
          "typoFamilyName",
          "typoSubfamilyName",
          "compatibleFull",
          "sampleText",
          "postScriptCID",
          "wwsFamilyName",
          "wwsSubfamilyName",
          "lightPalette",
          "darkPalette"
        ],
        c = t,
        u = n.readUshort,
        d = 0;
      d < a;
      d++
    ) {
      let l = u(e, t);
      t += 2;
      let f = u(e, t);
      t += 2;
      let h = u(e, t);
      t += 2;
      let p = u(e, t);
      t += 2;
      let m = u(e, t);
      t += 2;
      let b = u(e, t);
      t += 2;
      let g,
        y = c + 12 * a + b;
      0 === l || (3 === l && 0 === f) || (1 === l && 25 === f)
        ? (g = n.readUnicode(e, y, m / 2))
        : 0 === f
        ? (g = n.readASCII(e, y, m))
        : 1 === f || 3 === f || 4 === f || 5 === f || 10 === f
        ? (g = n.readUnicode(e, y, m / 2))
        : 1 === l
        ? ((g = n.readASCII(e, y, m)),
          console.log("reading unknown MAC encoding " + f + " as ASCII"))
        : (console.log("unknown encoding " + f + ", platformID: " + l),
          (g = n.readASCII(e, y, m)));
      let v = "p" + l + "," + h.toString(16);
      null === o[v] && (o[v] = {}), (o[v][s[p]] = g), (o[v]["_lang"] = h);
    }
    let S = fontTags.name.selectOne(o),
      w = "fontFamily";
    if (null === S[w]) for (var C in o) null != o[C][w] && (S[w] = o[C][w]);
    return S;
  },
  selectOne: function(e) {
    let t,
      r = "postScriptName";
    for (let n in e) if (null != e[n][r] && 1033 === e[n]["_lang"]) return e[n];
    for (let n in e) if (null != e[n][r] && 0 === e[n]["_lang"]) return e[n];
    for (let n in e) if (null != e[n][r] && 3084 === e[n]["_lang"]) return e[n];
    for (let n in e) if (null != e[n][r]) return e[n];
    for (let n in e) {
      t = e[n];
      break;
    }
    return (
      console.log("returning name table with languageID " + t._lang),
      null === t[r] && null != t["ID"] && (t[r] = t["ID"]),
      t
    );
  }
};
