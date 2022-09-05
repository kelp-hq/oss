import axios from 'axios';
import type { Request, Response } from 'express';
import { includes } from 'ramda';

import { ipfsGateway, version } from '../../config';
import { redisClient } from '../../redisClient';
import { sentry } from '../../sentry';
import { makeUniqueFileNameBasedOnURLAndSearchParams } from '../../utils/identifiers';
import { log } from '../../utils/logger';
import { storeRenditionOnIpfs } from './ipfsCache';
import macula from './macula';
/**
 * Express plugin for Macula. Does all the processing and responds to the `res` correctly
 * @param req -
 * @param res -
 */
export default async function expressPlugin(req: Request, res: Response): Promise<void> {
  const maculaMainTx = sentry?.startTransaction({
    op: 'macula-via-express',
    name: 'macula-via-express',
    description: 'Main macula function using Express'
  });

  sentry.configureScope((scope) => {
    scope.setSpan(maculaMainTx);
  });
  // build IPFS gateway url, this also contains all Search params, maybe should remove them??
  const url = new URL(ipfsGateway + req.url);

  const urlString = url.toString();

  // Do ALL the magic here, then process everything else
  const { image, originalCid, renditionCid: WorkflowRenditionCid } = await macula(url);

  let renditionCid: string = WorkflowRenditionCid;
  let storedOnIPFS = false;

  if (includes('pin=1', urlString)) {
    log.trace('Pinning rendition to IPFS');
    const storeRenditionOnIpfsTx = maculaMainTx?.startChild({
      op: 'store-rendition-on-ipfs',
      description: 'Main macula function'
    });

    renditionCid = await storeRenditionOnIpfs({
      imageBytes: image.data,
      ipfsPath: originalCid,
      mime: image.mime,
      url
    });

    storedOnIPFS = true;
    const uniqueName = makeUniqueFileNameBasedOnURLAndSearchParams(url);
    await redisClient.set(
      uniqueName,
      JSON.stringify({ renditionCid, originalCid, storedOnIPFS, mime: image.mime })
    );

    storeRenditionOnIpfsTx?.finish();
  }

  if (includes('replicas=', urlString)) {
    log.trace(`Got a request to store ${url.searchParams.get('replicas')} replicas. TODO`);
  }

  if (includes('account=', urlString)) {
    log.trace(`User with ${url.searchParams.get('account')} account will pay the replicas. TODO`);
  }

  const finalHeaders = await createHeaders({
    'x-kelp-cid-requested': originalCid,
    'x-kelp-cid-rendition': renditionCid,
    'x-kelp-stored-on-ipfs': storedOnIPFS,
    etag: renditionCid,
    'Content-Type': image.mime,
    Accept: image.mime,
    'Last-Modified': new Date(),
    'x-sentry-trace-id': maculaMainTx?.traceId
  });
  maculaMainTx?.finish();
  // If includes redirect do it
  if (includes('redirect=1', urlString)) {
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/301 for internal redirects
    log.trace(`Got the redirect request.`);
    res.set(finalHeaders).redirect(301, `/ipfs/${renditionCid}`);
  } else {
    res.set(finalHeaders).status(200).end(image.data);
  }
}

/**
 * MErge custom headers with the default ones
 * @param headers - Express Headers in format `Record<string,unknown>`
 * @returns New combined Headers. Does not modify the input param
 */
export async function createHeaders(headers: Record<string, unknown>): Promise<Record<string, unknown>> {
  const defaultHeaders = {
    // 'x-kelp-verified': true,
    // 'x-kelp-copyright-verified': true,
    // 'x-kelp-copyright': `urn:kelp:id:copyright:${'copyrightOwner'}`,

    'X-Powered-By': `Macula/v${version}`,
    // 'x-error-message': 'Failed silently, cannot use the f_* without the f param',
    // 'Content-Disposition': `filename="${photo.title ||
    //   photo.renditions.nodes[0].name}"`,
    /* Required for CORS support to work */
    'Access-Control-Allow-Origin': '*',
    /* Required for cookies, authorization headers with HTTPS */
    // 'Access-Control-Allow-Credentials': true,
    //https://varvy.com/pagespeed/cache-control.html
    // 'Cache-Control': 'max-age=2592000, private', // 720 Hour (h)
    // 'Cache-Control': 'max-age=3600, private, stale-while-revalidate=60',
    'Last-Modified': new Date()
  };
  const finalHeaders = {
    ...defaultHeaders,
    ...headers
  };
  return finalHeaders;
}

/**
 * Take the Redis record and fetch the item from the IPFS then return it
 * @param cachedRenditionRedisRecord - Redis record as string, must will be JSON.parseable
 * @param res - Express response
 */
export async function returnCachedRenditionFromRedisRecord(
  cachedRenditionRedisRecord: string,
  res: Response
): Promise<void> {
  const cachedRenditionTx = sentry?.startTransaction({
    op: 'cached-rendition',
    name: 'cached-rendition',
    description: 'Cached rendition on Redis, download from IPFS'
  });

  const { mime, originalCid, renditionCid, storedOnIPFS } = JSON.parse(cachedRenditionRedisRecord) as {
    renditionCid: string;
    storedOnIPFS: boolean;
    originalCid: string;
    mime: string;
  };
  log.trace(`Found cached record, fetching from IPFS. IPFS cid ${renditionCid}`);

  const ipfsUrl = new URL(ipfsGateway + '/ipfs/' + renditionCid);

  const r = await axios.get(ipfsUrl.toString(), {
    responseType: 'arraybuffer'
  });

  cachedRenditionTx?.setData('cached', true);
  cachedRenditionTx?.setData('cid', renditionCid);
  cachedRenditionTx?.finish();

  const finalHeaders = await createHeaders({
    'x-kelp-cid-requested': originalCid,
    'x-kelp-cid-rendition': renditionCid,
    'x-kelp-stored-on-ipfs': storedOnIPFS,
    etag: renditionCid,
    'Content-Type': mime,
    Accept: mime,
    'Last-Modified': new Date(),
    'x-sentry-trace-id': cachedRenditionTx?.traceId
  });
  cachedRenditionTx?.finish();
  res.set(finalHeaders).status(200).end(r.data);
}
