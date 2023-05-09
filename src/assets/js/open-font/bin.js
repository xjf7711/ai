export const Bin = {
  readFixed: function (e, t) {
    return (e[t] << 8 | e[t + 1]) + (e[t + 2] << 8 | e[t + 3]) / 65540
  },
  readOffset: function (e, t, r) {
    for (var n = 0, i = 0; i < r; i++) n = n << 8 | e[t + i];
    return n
  },
  readF2dot14: function (e, t) {
    var r = Bin.readShort(e, t);
    return r / 16384
  },
  readInt: function (e, t) {
    var r = Bin.t.uint8;
    return r[0] = e[t + 3], r[1] = e[t + 2], r[2] = e[t + 1], r[3] = e[t], Bin.t.int32[0]
  },
  readInt8: function (e, t) {
    var r = Bin.t.uint8;
    return r[0] = e[t], Bin.t.int8[0]
  },
  readUint8: function (e, t) {
    return e[t]
  },
  readShort: function (e, t) {
    var r = Bin.t.uint16;
    return r[0] = e[t] << 8 | e[t + 1], Bin.t.int16[0]
  },
  readUshort: function (e, t) {
    return e[t] << 8 | e[t + 1]
  },
  writeUshort: function (e, t, r) {
    e[t] = r >> 8 & 255, e[t + 1] = 255 & r
  },
  readUshorts: function (e, t, r) {
    for (var n = [], o = 0; o < r; o++) {
      var a = Bin.readUshort(e, t + 2 * o);
      n.push(a)
    }
    return n
  },
  readUint: function (e, t) {
    var r = Bin.t.uint8;
    return r[3] = e[t], r[2] = e[t + 1], r[1] = e[t + 2], r[0] = e[t + 3], Bin.t.uint32[0]
  },
  writeUint: function (e, t, r) {
    e[t] = r >> 24 & 255, e[t + 1] = r >> 16 & 255, e[t + 2] = r >> 8 & 255, e[t + 3] = r >> 0 & 255
  },
  readUint64: function (e, t) {
    return 4294967296 * Bin.readUint(e, t) + Bin.readUint(e, t + 4)
  },
  readASCII: function (e, t, r) {
    for (var n = "", i = 0; i < r; i++) n += String.fromCharCode(e[t + i]);
    return n
  },
  writeASCII: function (e, t, r) {
    for (var n = 0; n < r.length; n++) e[t + n] = r.charCodeAt(n)
  },
  readUnicode: function (e, t, r) {
    for (var n = "", i = 0; i < r; i++) {
      var o = e[t++] << 8 | e[t++];
      n += String.fromCharCode(o)
    }
    return n
  },
  _tdec: window["TextDecoder"] ? new window["TextDecoder"] : null, readUTF8: function (e, t, r) {
    var n = Bin._tdec;
    return n && 0 == t && r == e.length ? n["decode"](e) : Bin.readASCII(e, t, r)
  },
  readBytes: function (e, t, r) {
    for (var n = [], i = 0; i < r; i++) n.push(e[t + i]);
    return n
  },
  readASCIIArray: function (e, t, r) {
    for (var n = [], i = 0; i < r; i++) n.push(String.fromCharCode(e[t + i]));
    return n
  },
  t: function () {
    var e = new ArrayBuffer(8);
    return {
      buff: e,
      int8: new Int8Array(e),
      uint8: new Uint8Array(e),
      int16: new Int16Array(e),
      uint16: new Uint16Array(e),
      int32: new Int32Array(e),
      uint32: new Uint32Array(e)
    }
  }()
}
