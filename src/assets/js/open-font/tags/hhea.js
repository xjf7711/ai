import { Bin } from "assets/js/open-font/bin";

export const hhea = {
  parseTab: function(e, t, r) {
    var n = Bin,
      o = {};
    n.readFixed(e, t);
    t += 4;
    for (
      var a = [
          "ascender",
          "descender",
          "lineGap",
          "advanceWidthMax",
          "minLeftSideBearing",
          "minRightSideBearing",
          "xMaxExtent",
          "caretSlopeRise",
          "caretSlopeRun",
          "caretOffset",
          "res0",
          "res1",
          "res2",
          "res3",
          "metricDataFormat",
          "numberOfHMetrics"
        ],
        s = 0;
      s < a.length;
      s++
    ) {
      var c = a[s],
        u =
          "advanceWidthMax" == c || "numberOfHMetrics" == c
            ? n.readUshort
            : n.readShort;
      o[c] = u(e, t + 2 * s);
    }
    return o;
  }
};
