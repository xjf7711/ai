import { BaseException } from "../shared/util.js";

export class JpxError extends BaseException {
  constructor(msg) {
    super(`JPX error: ${msg}`, "JpxError");
  }
}
