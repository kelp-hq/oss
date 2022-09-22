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
