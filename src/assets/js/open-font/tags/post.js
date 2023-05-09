import { Bin } from "assets/js/open-font/bin";
export const post = {
  parseTab: function(e, t, r) {
    let n = Bin,
      o = {};
    return (
      (o["version"] = n.readFixed(e, t)),
      (t += 4),
      (o["italicAngle"] = n.readFixed(e, t)),
      (t += 4),
      (o["underlinePosition"] = n.readShort(e, t)),
      (t += 2),
      (o["underlineThickness"] = n.readShort(e, t)),
      (t += 2),
      o
    );
  }
};
