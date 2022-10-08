/**
 * MOST OF THIS FILE IS COPIED FROM https://github.com/ipfs/js-ipfs-utils/blob/5eecdcbd81f5448ba1d4c0d2ad2050d0ceb240a0/src/http.js
 * ALL RIGHTS AND APPRECIATION GOES TO THE AUTHORS
 *
 * I HAVE MODIFIED IT TO AN EXTENT THAT I NEED IT TO WORK WITH TYPESCRIPT
 *
 * !!!!note!!!!
 * This will eventually be re-written in Typescript and without errors
 */

import { isNil } from 'ramda';
import type { Readable as NodeReadableStream } from 'stream';
/**
 * @param value -
 * @returns
 */
const isNodeReadableStream = (value: unknown): boolean =>
  Object.prototype.hasOwnProperty.call(value, 'readable') &&
  Object.prototype.hasOwnProperty.call(value, 'writable');

/**
 * Check for web readable stream
 *
 * @param value -
 * @returns
 */
function isWebReadableStream(value: any | ReadableStream<any>): boolean {
  return value && typeof value.getReader === 'function';
}

/**
 * Check if it's an AsyncIterable
 *
 * @typeParam TChunk -
 * @typeParam Other -
 * @param value -
 * @returns
 */
function isAsyncIterable(value: any | AsyncIterable<any>): boolean {
  return typeof value === 'object' && value !== null && typeof value[Symbol.asyncIterator] === 'function';
}

/**
 * Stream to AsyncIterable
 *
 * @typeParam TChunk -
 */
export function fromStream(source: ReadableStream<any> | NodeReadableStream | null): AsyncIterable<any> {
  if (isNil(source)) {
    throw new TypeError("Body can't be converted to AsyncIterable");
  }
  // Workaround for https://github.com/node-fetch/node-fetch/issues/766
  if (isNodeReadableStream(source)) {
    const sourceNew = source as any;
    const iter = sourceNew[Symbol.asyncIterator]();
    return {
      [Symbol.asyncIterator]() {
        return {
          next: iter.next.bind(iter),
          return(value) {
            sourceNew.destroy();
            if (typeof iter.return === 'function') {
              return iter.return();
            }
            return Promise.resolve({ done: true, value });
          }
        };
      }
    };
  }

  if (isWebReadableStream(source)) {
    const sourceNew = source as any;
    const reader = sourceNew.getReader();
    return (async function* () {
      try {
        while (true) {
          // Read from the stream
          const { done, value } = await reader.read();
          // Exit if we're done
          if (done) return;
          // Else yield the chunk
          if (value) {
            yield value;
          }
        }
      } finally {
        reader.releaseLock();
      }
    })();
  }

  if (isAsyncIterable(source)) {
    return source as AsyncIterable<any>;
  }

  throw new TypeError("Body can't be converted to AsyncIterable");
}
