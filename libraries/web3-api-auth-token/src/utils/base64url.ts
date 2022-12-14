// https://github.com/beatgammit/base64-js/blob/master/index.js

/**
 * Encode the string to Base64 URL safe
 *
 * @remarks
 * More info here https://www.rfc-editor.org/rfc/rfc4648 #Table 2: The "URL and Filename safe" Base 64 Alphabet
 * @param d - Any kind of string data
 * @param safe - Tell encoder that we are decoding base64Url save payload. This is default behavior.
 * @returns Encoded string or fails with the error if it cannot find `atob` or `Buffer`
 * @public
 */
export function encode(d: string, safe: boolean = true): string {
  let encoded: string;
  if (typeof btoa === 'function') {
    encoded = btoa(d);
  } else if (typeof Buffer === 'function') {
    encoded = Buffer.from(d, 'utf-8').toString('base64');
  } else {
    throw new Error('Failed to determine the platform specific encoder');
  }

  if (safe) {
    return encoded.replace(/\+/g, '-').replace(/\//g, '_');
  } else {
    return encoded;
  }
}
/**
 * Decode the base64Url encoded string to a decoded string.
 * @remarks
 * More info here https://www.rfc-editor.org/rfc/rfc4648 #Table 2: The "URL and Filename safe" Base 64 Alphabet
 * @param d - encoded payload
 * @param safe - Tell decoder that we are decoding base64Url save payload. This is default behavior.
 * @returns Decoded string or fails with the error if it cannot find `atob` or `Buffer`
 * @public
 */
export function decode(d: string, safe: boolean = true): string {
  let decoded: string;
  let replaced: string;

  if (safe) {
    // return back the replacements
    replaced = d.replace(/-/g, '+').replace(/_/g, '/');
  } else {
    replaced = d;
  }

  if (typeof atob === 'function') {
    decoded = atob(replaced);
  } else if (typeof Buffer === 'function') {
    decoded = Buffer.from(replaced, 'base64').toString('utf-8');
  } else {
    throw new Error('Failed to determine the platform specific decoder');
  }

  return decoded;
}
