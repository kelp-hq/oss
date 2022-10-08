import { split } from 'ramda';

/**
 * From ndjson to array
 * @param ndjson - ndjson string separated by `\n` as per http://ndjson.org/
 * @returns
 * @public
 */
export function toArray(ndjson: string): string {
  return JSON.stringify(split('\n', ndjson));
}

/**
 * Parses NDJSON chunks from an iterator
 *
 * @param {AsyncIterable<Uint8Array>} source
 * @returns {AsyncIterable<any>}
 */
export async function* parseToJson(source: AsyncIterable<Uint8Array>): AsyncGenerator<any, void, unknown> {
  const decoder = new TextDecoder();
  let buf = '';

  for await (const chunk of source) {
    buf += decoder.decode(chunk, { stream: true });
    const lines = buf.split(/\r?\n/);

    for (let i = 0; i < lines.length - 1; i++) {
      const l = lines[i].trim();
      if (l.length > 0) {
        yield JSON.parse(l);
      }
    }
    buf = lines[lines.length - 1];
  }
  buf += decoder.decode();
  buf = buf.trim();
  if (buf.length !== 0) {
    yield JSON.parse(buf);
  }
}
