import {Bin} from "assets/js/open-font/bin";
export const CBLC = {
  parseTab: function (e, t) {
    var n = Bin, o = t;
    n.readUshort(e, t);
    t += 2;
    n.readUshort(e, t);
    t += 2;
    var a = n.readUint(e, t);
    t += 4;
    for (var s = [], c = 0; c < a; c++) {
      var u = n.readUint(e, t);
      t += 4;
      n.readUint(e, t);
      t += 4;
      n.readUint(e, t);
      t += 4, t += 4, t += 24;
      n.readUshort(e, t);
      t += 2;
      n.readUshort(e, t);
      t += 2, t += 4;
      for (var d = o + u, l = 0; l < 3; l++) {
        var f = n.readUshort(e, d);
        d += 2;
        var h = n.readUshort(e, d);
        d += 2;
        var p = n.readUint(e, d);
        d += 4;
        var m = h - f + 1, b = o + u + p, g = n.readUshort(e, b);
        if (b += 2, 1 != g) throw g;
        var y = n.readUshort(e, b);
        b += 2;
        var v = n.readUint(e, b);
        b += 4;
        for (var S = [], w = 0; w < m; w++) {
          var C = n.readUint(e, b + 4 * w);
          S.push(v + C)
        }
        s.push([f, h, y, S])
      }
    }
    return s
  }
}
