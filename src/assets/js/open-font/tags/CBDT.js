export const CBDT = {
  parseTab(e, t, r) {
    // i["B"];
    return new Uint8Array(e.buffer, e.byteOffset + t, r);
  }
}
