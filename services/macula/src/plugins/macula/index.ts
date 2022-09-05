import { Router } from 'express';
import { isEmpty, isNil } from 'ramda';

import { ipfsGateway } from '../../config';
import { createProxy } from '../../proxyServer';
import { redisClient } from '../../redisClient';
import { sentry } from '../../sentry';
import { makeUniqueFileNameBasedOnURLAndSearchParams } from '../../utils/identifiers';
import { log } from '../../utils/logger';
import maculaExpressPlugin, { returnCachedRenditionFromRedisRecord } from './expressPlugin';
import { shouldProcess } from './utils';

export const maculaRouter: Router = Router({
  caseSensitive: true
});

/**
 * IPFS proxy with image processing
 */
maculaRouter.get('/ipfs/*', async (req, res) => {
  log.debug('Proxying GATEWAY %s', req.url);
  try {
    // build IPFS gateway url, this also contains all Search params, maybe should remove them??
    const url = new URL(ipfsGateway + req.url);

    const uniqueName = makeUniqueFileNameBasedOnURLAndSearchParams(url);

    // maybe we cached this already? get the CID
    const cachedRendition = await redisClient.get(uniqueName);

    if (!isNil(cachedRendition) && !isEmpty(cachedRendition)) {
      await returnCachedRenditionFromRedisRecord(cachedRendition, res);
    } else {
      const shouldWeProcess = await shouldProcess(new URL(ipfsGateway + req.path), req.query);

      // process the image
      if (shouldWeProcess) {
        log.trace(`Processing ${req.url}`);
        await maculaExpressPlugin(req, res);
      }
      // or else just proxy the request
      else {
        await createProxy(req, res, ipfsGateway);
      }
    }
  } catch (error) {
    sentry.captureException(error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        errors: [error.message]
      })
    );
  }
});
