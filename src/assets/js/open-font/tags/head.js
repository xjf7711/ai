import { Bin } from "assets/js/open-font/bin";
export const head = {
  parseTab: function(e, t, r) {
    var n = Bin,
      o = {};
    n.readFixed(e, t);
    (t += 4), (o["fontRevision"] = n.readFixed(e, t)), (t += 4);
    n.readUint(e, t);
    t += 4;
    n.readUint(e, t);
    return (
      (t += 4),
      (o["flags"] = n.readUshort(e, t)),
      (t += 2),
      (o["unitsPerEm"] = n.readUshort(e, t)),
      (t += 2),
      (o["created"] = n.readUint64(e, t)),
      (t += 8),
      (o["modified"] = n.readUint64(e, t)),
      (t += 8),
      (o["xMin"] = n.readShort(e, t)),
      (t += 2),
      (o["yMin"] = n.readShort(e, t)),
      (t += 2),
      (o["xMax"] = n.readShort(e, t)),
      (t += 2),
      (o["yMax"] = n.readShort(e, t)),
      (t += 2),
      (o["macStyle"] = n.readUshort(e, t)),
      (t += 2),
      (o["lowestRecPPEM"] = n.readUshort(e, t)),
      (t += 2),
      (o["fontDirectionHint"] = n.readShort(e, t)),
      (t += 2),
      (o["indexToLocFormat"] = n.readShort(e, t)),
      (t += 2),
      (o["glyphDataFormat"] = n.readShort(e, t)),
      (t += 2),
      o
    );
  }
};
