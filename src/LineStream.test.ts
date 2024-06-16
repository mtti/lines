import fs from "fs";
import path from "path";
import { LineStream } from "./LineStream";

function createReadStream(filename: string): fs.ReadStream {
  return fs.createReadStream(path.join(__dirname, "..", "test", filename));
}

function readTestFileToArray(filename: string): Promise<string[]> {
  return new Promise((resolve): void => {
    const input = createReadStream(filename);
    const ls = new LineStream();
    const lines: string[] = [];

    input.pipe(ls);

    ls.on("data", (data) => {
      lines.push(data as string);
    });

    input.on("close", () => {
      resolve(lines);
    });
  });
}

function feedChunks(chunks: Buffer[]): Promise<string[]> {
  return new Promise((resolve, reject): void => {
    const ls = new LineStream();
    const lines: string[] = [];

    ls.on("data", (data) => {
      lines.push(data as string);
    });

    ls.on("error", (err) => {
      reject(err);
    });

    chunks.forEach((chunk) => {
      ls.write(chunk, "utf8");
    });

    ls.end(() => {
      resolve(lines);
    });
  });
}

function createBuffers(chunks: string[], encoding: string = "utf8"): Buffer[] {
  return chunks.map((chunk) => Buffer.from(chunk, encoding as BufferEncoding));
}

describe(LineStream.name, () => {
  it("throws if encoding changes mid-stream", async (): Promise<void> => {
    const func = (): Promise<void> =>
      new Promise((resolve, reject): void => {
        const ls = new LineStream();
        const lines: string[] = [];

        ls.on("data", (data) => {
          lines.push(data as string);
        });

        ls.on("error", (err) => {
          reject(err);
        });

        ls.write("hello", "utf8");
        ls.write("abcd", "hex");

        ls.end(() => {
          resolve();
        });
      });

    await expect(func()).rejects.toBeTruthy();
  });

  it("handles CRLF at chunk border", async (): Promise<void> => {
    const lines = await feedChunks(createBuffers(["hello\r", "\nworld"]));
    expect(lines).toEqual(["hello", "world"]);
  });

  it("handles unicode multi-part character at chunk border", async (): Promise<void> => {
    const lines = await feedChunks([
      Buffer.from([0xe2, 0x82]),
      Buffer.from([0xac]),
      Buffer.from("\nHello world", "utf8"),
    ]);
    expect(lines).toEqual(["€", "Hello world"]);
  });

  describe("with a short file and default options", () => {
    it("produces 31 lines", async (): Promise<void> => {
      const lines = await readTestFileToArray("lipsum.txt");
      expect(lines.length).toBe(31);
    });
  });
});
