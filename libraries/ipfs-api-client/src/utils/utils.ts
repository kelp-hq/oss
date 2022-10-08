// import type { Readable as NodeReadableStream } from 'stream';
// /**
//  * @param value -
//  * @returns {value is NodeReadableStream}
//  */
// const isNodeReadableStream = (value: unknown) =>
//   Object.prototype.hasOwnProperty.call(value, 'readable') &&
//   Object.prototype.hasOwnProperty.call(value, 'writable');

// /**
//  * Check for web readable stream
//  *
//  * @typeParam TChunk -
//  * @typeParam Other -
//  * @param value -
//  * @returns
//  */
// function isWebReadableStream<Other, TChunk>(value: Other | ReadableStream<TChunk>): ReadableStream<TChunk> {
//   return value && typeof (/** @type {any} */ value.getReader) === 'function';
// }

// /**
//  * Stream to AsyncIterable
//  *
//  * @typeParam TChunk -
//  */
// export function fromStream<TChunk>(
//   source: ReadableStream<TChunk> | NodeReadableStream | null
// ): AsyncIterable<TChunk> {
//   // Workaround for https://github.com/node-fetch/node-fetch/issues/766
//   if (isNodeReadableStream(source)) {
//     const iter = source[Symbol.asyncIterator]();
//     return {
//       [Symbol.asyncIterator]() {
//         return {
//           next: iter.next.bind(iter),
//           return(value) {
//             source.destroy();
//             if (typeof iter.return === 'function') {
//               return iter.return();
//             }
//             return Promise.resolve({ done: true, value });
//           }
//         };
//       }
//     };
//   }

//   if (isWebReadableStream(source)) {
//     const reader = source.getReader();
//     return (async function* () {
//       try {
//         while (true) {
//           // Read from the stream
//           const { done, value } = await reader.read();
//           // Exit if we're done
//           if (done) return;
//           // Else yield the chunk
//           if (value) {
//             yield value;
//           }
//         }
//       } finally {
//         reader.releaseLock();
//       }
//     })();
//   }

//   if (isAsyncIterable(source)) {
//     return source;
//   }

//   throw new TypeError("Body can't be converted to AsyncIterable");
// }
