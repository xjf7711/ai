import { Bin } from "../bin";

export const maxp = {
  parseTab: function(e, t, r) {
    var n = Bin,
      o = n.readUshort,
      a = {};
    n.readUint(e, t);
    return (t += 4), (a["numGlyphs"] = o(e, t)), (t += 2), a;
  }
};
