import { Bin } from "../bin";
import { fontTags } from "./index";

export const OS2 = {
  parseTab: function(e, t, r) {
    let n = Bin,
      o = n.readUshort(e, t);
    t += 2;
    let a = fontTags.OS2,
      s = {};
    if (0 === o) a.version0(e, t, s);
    else if (1 === o) a.version1(e, t, s);
    else if (2 === o || 3 === o || 4 === o) a.version2(e, t, s);
    else {
      if (5 !== o) throw "unknown OS/2 table version: " + o;
      a.version5(e, t, s);
    }
    return s;
  },
  version0: function(e, t, r) {
    let n = Bin;
    return (
      (r["xAvgCharWidth"] = n.readShort(e, t)),
      (t += 2),
      (r["usWeightClass"] = n.readUshort(e, t)),
      (t += 2),
      (r["usWidthClass"] = n.readUshort(e, t)),
      (t += 2),
      (r["fsType"] = n.readUshort(e, t)),
      (t += 2),
      (r["ySubscriptXSize"] = n.readShort(e, t)),
      (t += 2),
      (r["ySubscriptYSize"] = n.readShort(e, t)),
      (t += 2),
      (r["ySubscriptXOffset"] = n.readShort(e, t)),
      (t += 2),
      (r["ySubscriptYOffset"] = n.readShort(e, t)),
      (t += 2),
      (r["ySuperscriptXSize"] = n.readShort(e, t)),
      (t += 2),
      (r["ySuperscriptYSize"] = n.readShort(e, t)),
      (t += 2),
      (r["ySuperscriptXOffset"] = n.readShort(e, t)),
      (t += 2),
      (r["ySuperscriptYOffset"] = n.readShort(e, t)),
      (t += 2),
      (r["yStrikeoutSize"] = n.readShort(e, t)),
      (t += 2),
      (r["yStrikeoutPosition"] = n.readShort(e, t)),
      (t += 2),
      (r["sFamilyClass"] = n.readShort(e, t)),
      (t += 2),
      (r["panose"] = n.readBytes(e, t, 10)),
      (t += 10),
      (r["ulUnicodeRange1"] = n.readUint(e, t)),
      (t += 4),
      (r["ulUnicodeRange2"] = n.readUint(e, t)),
      (t += 4),
      (r["ulUnicodeRange3"] = n.readUint(e, t)),
      (t += 4),
      (r["ulUnicodeRange4"] = n.readUint(e, t)),
      (t += 4),
      (r["achVendID"] = n.readASCII(e, t, 4)),
      (t += 4),
      (r["fsSelection"] = n.readUshort(e, t)),
      (t += 2),
      (r["usFirstCharIndex"] = n.readUshort(e, t)),
      (t += 2),
      (r["usLastCharIndex"] = n.readUshort(e, t)),
      (t += 2),
      (r["sTypoAscender"] = n.readShort(e, t)),
      (t += 2),
      (r["sTypoDescender"] = n.readShort(e, t)),
      (t += 2),
      (r["sTypoLineGap"] = n.readShort(e, t)),
      (t += 2),
      (r["usWinAscent"] = n.readUshort(e, t)),
      (t += 2),
      (r["usWinDescent"] = n.readUshort(e, t)),
      (t += 2),
      t
    );
  },
  version1: function(e, t, r) {
    let n = Bin;
    return (
      (t = fontTags.OS2.version0(e, t, r)),
      (r["ulCodePageRange1"] = n.readUint(e, t)),
      (t += 4),
      (r["ulCodePageRange2"] = n.readUint(e, t)),
      (t += 4),
      t
    );
  },
  version2: function(e, t, r) {
    let n = Bin,
      o = n.readUshort;
    return (
      (t = fontTags.OS2.version1(e, t, r)),
      (r["sxHeight"] = n.readShort(e, t)),
      (t += 2),
      (r["sCapHeight"] = n.readShort(e, t)),
      (t += 2),
      (r["usDefault"] = o(e, t)),
      (t += 2),
      (r["usBreak"] = o(e, t)),
      (t += 2),
      (r["usMaxContext"] = o(e, t)),
      (t += 2),
      t
    );
  },
  version5: function(e, t, r) {
    let n = Bin.readUshort;
    return (
      (t = fontTags.OS2.version2(e, t, r)),
      (r["usLowerOpticalPointSize"] = n(e, t)),
      (t += 2),
      (r["usUpperOpticalPointSize"] = n(e, t)),
      (t += 2),
      t
    );
  }
};
