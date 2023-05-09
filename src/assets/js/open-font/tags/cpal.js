import { Bin } from "assets/js/open-font/bin";

export const cpal = {
  parseTab: function(e, t, r) {
    var n = Bin,
      o = t,
      a = n.readUshort(e, t);
    if (((t += 2), 0 == a)) {
      n.readUshort(e, t);
      t += 2;
      n.readUshort(e, t);
      t += 2;
      var s = n.readUshort(e, t);
      t += 2;
      var c = n.readUint(e, t);
      return (t += 4), new Uint8Array(e.buffer, o + c, 4 * s);
    }
    throw a;
  }
};
