import stream from "stream";
import { StringDecoder } from "string_decoder";

export class LineStream extends stream.Transform {
  private _chunkEncoding: BufferEncoding = "utf8";

  private _lastChunkEndedWithCR: boolean = false;

  private _lineBuffer: string[] = [];

  private _decoder?: StringDecoder;

  constructor() {
    super({ objectMode: true });
  }

  /**
   * Implements `Transform::_transform`.
   *
   * @param chunk
   * @param encoding
   * @param callback
   */
  _transform(
    chunk: unknown,
    encoding: BufferEncoding,
    callback: stream.TransformCallback,
  ): void {
    // decode binary chunks as UTF-8
    const enc = encoding || "utf8";

    if (enc !== this._chunkEncoding) {
      throw new Error(
        `Encoding changed mid-stream, expected ${this._chunkEncoding} got ${enc}`,
      );
    }

    let data: string;
    if (Buffer.isBuffer(chunk)) {
      if (!this._decoder) {
        this._decoder = new StringDecoder(enc);
      }
      data = this._decoder.write(chunk);
    } else if (typeof chunk === "string") {
      data = chunk;
    } else {
      throw new Error(`Unexpected ${typeof chunk}`);
    }
    this._chunkEncoding = encoding;

    // see: http://www.unicode.org/reports/tr18/#Line_Boundaries
    const lines = data.split(/\r\n|[\n\v\f\r\x85\u2028\u2029]/g);

    // don't split CRLF which spans chunks
    if (this._lastChunkEndedWithCR && data[0] === "\n") {
      lines.shift();
    }

    if (this._lineBuffer.length > 0) {
      this._lineBuffer[this._lineBuffer.length - 1] += lines[0];
      lines.shift();
    }

    this._lastChunkEndedWithCR = data[chunk.length - 1] === "\r";
    this._lineBuffer = [...this._lineBuffer, ...lines];
    this._pushBuffer(encoding, 1, callback);
  }

  /**
   * Implements `Transform::_flush`.
   *
   * @param callback
   */
  _flush(callback: stream.TransformCallback): void {
    this._pushBuffer(this._chunkEncoding, 0, callback);
  }

  private _pushBuffer(
    encoding: BufferEncoding,
    keep: number,
    done: stream.TransformCallback,
  ): void {
    // always buffer the last (possibly partial) line
    while (this._lineBuffer.length > keep) {
      const line = this._lineBuffer.shift();
      if (!this.push(line, encoding)) {
        // when the high-water mark is reached, defer pushes until the next
        // tick
        setImmediate(() => this._pushBuffer(encoding, keep, done));
        return;
      }
    }
    done();
  }
}
