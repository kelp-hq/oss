import { addOneWithPath, createIPFSConnection, IUploadParamsSingleFile } from '@anagolay/utils';
import { printf } from 'fast-printf';
import * as mimeTypes from 'mime-types';
import { head, isEmpty, isNil, length } from 'ramda';

import { ipfsCacheApiURL } from '../../config';
import { sentry } from '../../sentry';
import { makeUniqueFileNameBasedOnURLAndSearchParams } from '../../utils/identifiers';

/**
 * Cached record  in Redis
 */
export interface IStoreRenditionOnIPFSParams {
  imageBytes: Buffer;
  ipfsPath: string;
  mime: string;
  url: URL;
}

/**
 * Store the Rendition on the IPFS node and return its CID so we can tell to the user
 * @param params -
 */
export async function storeRenditionOnIpfs(params: IStoreRenditionOnIPFSParams): Promise<string> {
  const { imageBytes, mime, url } = params;

  const extension = mimeTypes.extension(mime);

  const ipfsClient = createIPFSConnection({
    ipfsOptions: {
      url: ipfsCacheApiURL
    }
  });

  const ipfsPath = printf('/%s.%s', makeUniqueFileNameBasedOnURLAndSearchParams(url), extension);

  const opts: IUploadParamsSingleFile = {
    ipfs: ipfsClient,
    ipfsPath,
    filePathOrBytes: imageBytes,
    opts: {
      wrapWithDirectory: true,
      pin: true
    }
  };

  const uploadedRendition = await addOneWithPath(opts);

  if (isEmpty(uploadedRendition) && length(uploadedRendition) >= 2) {
    sentry.captureException(
      `Upload failed for the rendition. Got ${length(uploadedRendition)} items in the rendition`
    );
    throw new Error(
      `Upload failed for the rendition. Got ${length(uploadedRendition)} items in the rendition`
    );
  }

  // this is the first OR deepest item stored, it's our image
  const firstItem = head(uploadedRendition);

  if (isNil(firstItem)) {
    throw new Error('THIS SHOULD NEVER HAPPEN, CHECK FOR EXISTING IS ABOVE, THIS IS ONLY TO SHUT THE TS');
  }

  // // this is the root folder that we wrapped our path with
  // const lastItem = last(uploadedRendition);

  // if (isNil(lastItem)) {
  //   throw new Error('THIS SHOULD NEVER HAPPEN, CHECK FOR EXISTING IS ABOVE, THIS IS ONLY TO SHUT THE TS');
  // }

  // const gatewayPath = `https://${process.env.GITPOD_WORKSPACE_URL?.replace('https://', '8080-')}/ipfs/%s/%s`;
  // /**
  //  * Build the URL, the first %s it must be the wrapped folder CID, the rest is the full path from the first item
  //  */
  // const imageGatewayPath = printf(gatewayPath, lastItem.cid, firstItem.path);

  // console.log('uploadedRendition', uploadedRendition, imageGatewayPath);

  return firstItem.cid.toString();
}
