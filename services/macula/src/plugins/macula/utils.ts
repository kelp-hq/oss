import axios from 'axios';
import { fromBuffer } from 'file-type';
import { compose, equals, includes, isEmpty, isNil, last, split } from 'ramda';

import { minimumBytes, sharpSupportedImageFormats } from '../../config';

/**
 * If the URL contains the extension it will be used and trusted, if not it checks is the payload image and if it is will also check do we need to process it, the searchParams are not empty. Internally this method will fetch the minimum amount of bytes (4100) using the Range header and try to determine the mime type.
 *
 * Example:
 *
 * ```ts
 * // this will return false because it doesn't have the searchParams
 * url = 'ipfs/bafykCID/image1.png' << this will be trusted and not processed, saving ~50ms
 *
 * // this will return true because it has the searchParams
 * url = 'ipfs/bafykCID/image1.png?w=100'
 * ```
 * @param url -
 * @param queryParams -
 * @returns
 */
export async function shouldProcess(url: URL, queryParams: Record<string, unknown>): Promise<boolean> {
  if (urlHasSupportedExtension(url) && !isEmpty(queryParams)) {
    return true;
  } else {
    // we cannot use HEAD because we need bytes (a response body) and head doesn't provide that
    const c = await axios.get(url.toString(), {
      responseType: 'arraybuffer',
      // get first minimum amount of bytes to see is it image or not
      headers: { Range: `bytes=0-${minimumBytes}` }
    });

    const mimeT = await fromBuffer(c.data);

    return !isNil(mimeT) && includes(mimeT.ext, sharpSupportedImageFormats) && !isEmpty(queryParams);
  }
}

/**
 * if the URL has extension at the end return true
 * @param url -
 * @returns
 */
export function urlHasSupportedExtension(url: URL): boolean {
  function isSupportedExtension(extension: string): boolean {
    return includes(extension, sharpSupportedImageFormats);
  }
  return compose(isSupportedExtension, last, split('.'))(url.pathname);
}

/**
 * Return true if we are getting the `/ipfs`
 *
 * @param url -
 */
export function isIpfsUrl(url: string): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, maybeIpfs] = split('/', url);

  return equals('ipfs', maybeIpfs);
}

/**
 * Return origin and pathname removing ALL Search params
 * @param url -
 * @returns
 */
export function removeSearchParamsFromUrl(url: URL): string {
  return `${url.origin}${url.pathname}`;
}
