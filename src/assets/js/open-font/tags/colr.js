import { Bin } from "assets/js/open-font/bin";

export const colr = {
  parseTab: function(e, t, r) {
    var n = Bin,
      o = t;
    t += 2;
    var a = n.readUshort(e, t);
    t += 2;
    var s = n.readUint(e, t);
    t += 4;
    var c = n.readUint(e, t);
    t += 4;
    var u = n.readUshort(e, t);
    t += 2;
    for (var d = {}, l = o + s, f = 0; f < a; f++)
      (d["g" + n.readUshort(e, l)] = [
        n.readUshort(e, l + 2),
        n.readUshort(e, l + 4)
      ]),
        (l += 6);
    var h = [];
    l = o + c;
    for (f = 0; f < u; f++)
      h.push(n.readUshort(e, l), n.readUshort(e, l + 2)), (l += 4);
    return [d, h];
  }
};
