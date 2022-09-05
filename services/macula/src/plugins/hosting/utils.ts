/* eslint-disable require-atomic-updates */
import { NextFunction, Request, Response } from 'express';
import { IncomingHttpHeaders } from 'http';
import { endsWith, includes, mergeAll, pick } from 'ramda';
import { equals, head, isEmpty, isNil, join, prepend, reject, split, tail } from 'ramda';

import { ipfsGateway } from '../../config';
import { log } from '../../utils/logger';
import { IMaculaConfig } from '.';

/**
 *
 * @param url - it is a string that does NOT start with the /. it is the right path of th route the `*` and it looks like `bafybeiemqcvr5uftg7yy7uzki5mawmfjm4tu77ln4lkmwdfivlj2v736ym/_app/immutable/chunks/index-3901c72f.js`
 * @returns the root CID only, `bafybeiemqcvr5uftg7yy7uzki5mawmfjm4tu77ln4lkmwdfivlj2v736ym` as per above example
 */
export function rootCid(url: string): string {
  const cid = head(split('/')(url));
  if (isNil(cid)) {
    throw new Error(`${url} doesn't have cid`);
  }
  return cid;
}

/**
 *
 * @param url - it is a string that does NOT start with the /. it is the right path of th route the `*` and it looks like `bafybeiemqcvr5uftg7yy7uzki5mawmfjm4tu77ln4lkmwdfivlj2v736ym/_app/immutable/chunks/index-3901c72f.js`
 * @returns All but the root CID, which is `/_app/immutable/chunks/index-3901c72f.js` as per example
 */
export function extractRoute(url: string): string {
  // return all but first element which is the root CID
  const urlParts = tail(split('/')(url));
  const res = join('/', prepend('', urlParts));

  return res;
}

/**
 * Website middleware which deals with the checking does config exists in the DB, handles the redirects for the SPA and static pretty urls
 * @param req -
 * @param res -
 * @param next -
 * @returns
 */
export async function maculaWebsiteMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { baseCid, currentRoute, maculaConfig } = req.hostingCtx;
  // i want to know how this is handled
  if (req.xhr) {
    log.trace('xhr request', req.url);
  }
  /**
   * this is everything to the RIGHT of the /on/ route
   */
  const baseIpfsPath = `${ipfsGateway}/ipfs/${req.hostingCtx.baseCid}`;

  if (isNil(maculaConfig)) {
    log.trace('macula does not exist will not parse the routes');
    next();
  } else {
    const appType = maculaConfig.appType;
    if (equals(appType, 'static')) {
      log.trace('[maculaWebsiteMiddleware] Checking routes for [%s]', appType);
      if (!equals(currentRoute, '/')) {
        // this will trigger if the url is requeste without the end slash like this /features instead of /features. it wil redirect to the latter
        const reg = new RegExp('^/((?:[^/]+/)*[^/\\.]+)$');
        const matches = reg.exec(currentRoute);

        if (!isNil(matches)) {
          res.redirect(308, `${baseIpfsPath}${currentRoute}/`);
          return;
        } else {
          const prerenderedPage = maculaConfig.pages[currentRoute];
          if (!isNil(prerenderedPage)) {
            req.hostingCtx.currentRoute = prerenderedPage.file;
            log.trace('route in config.pages %s, changed the req %s', req.url, req.hostingCtx.currentRoute);
            next();
          } else {
            log.trace('route is not in config.pages %s', currentRoute);
            next();
          }
        }
      } else {
        log.trace('requestd route is a home route %s', currentRoute);
        next();
      }
    } else if (equals(appType, 'spa')) {
      log.trace('[maculaWebsiteMiddleware] Checking routes for [%s] route [%s]', appType, currentRoute);
      const { fallback } = maculaConfig;

      if (maculaConfig.preredered) {
        //we got prerendered SPA
        log.trace('[maculaWebsiteMiddleware] we got prerendered SPA');
        const prerenderedPage = maculaConfig.pages[currentRoute];

        // if this exists for the SPA it means there was prerender involved and we should serve its route rathr than the fallback url
        if (!isNil(prerenderedPage)) {
          req.hostingCtx.ipfsItemPath = prerenderedPage.file;
          next();
        } else {
          next();
        }
      } else {
        log.trace('[maculaWebsiteMiddleware] we got non-prerendered SPA');
        if (!equals(currentRoute, fallback?.route)) {
          /**
           * here url parts like `/features` are requested and they are valid but the `/features/` it is not since that it is a directory and only useful in the static web or prerendered spa
           */
          const noEndSlashRegex = new RegExp('^/((?:[^/]+/)*[^/\\.]+)$');
          const noEndSlashRegexMatches = noEndSlashRegex.exec(currentRoute);
          const endSlashRegex = new RegExp('^/(.*)/$');
          const endSlashRegexMatches = endSlashRegex.exec(currentRoute);

          if (!isNil(noEndSlashRegexMatches) || !isNil(endSlashRegexMatches)) {
            log.trace('redirecting %s -> %s', currentRoute, fallback?.route);

            const routeParts = join('/', reject(isEmpty, split('/')(fallback?.route as string)));
            const reforgedPath = reject(isEmpty, [baseCid, routeParts, fallback?.file]);

            req.hostingCtx.ipfsItemPath = join('/', reforgedPath);
            next();
          } else {
            next();
          }
        } else {
          // we go default route
          next();
        }
      }
    } else {
      console.error(`appType ${appType} not supported`);
      next(`appType ${appType} not supported`);
    }
  }
}

interface IParamsForCompressed {
  headers: Record<string, string>;
  url: string;
}
/**
 * Will return the url containing the compression extension like .br or .gz for different extensions
 * @param req -
 * @returns
 */
export async function pathForCompressed(req: Request): Promise<IParamsForCompressed> {
  const { maculaConfig, currentRoute, ipfsItemPath } = req.hostingCtx;

  const { compressedFor } = maculaConfig as IMaculaConfig;

  let headers = {};
  let finalPath = ipfsItemPath;

  if (endsWith('.js', finalPath as string)) {
    if (includes('br', compressedFor)) {
      finalPath += '.br';
      headers = {
        'content-encoding': 'br',
        'content-type': 'application/javascript; charset=UTF-8'
      };
    } else if (includes('gz', compressedFor)) {
      finalPath += '.gz';
      headers = {
        'content-encoding': 'gzip',
        'content-type': 'application/javascript; charset=UTF-8'
      };
    } else {
      log.error('[pathForCompressed] Compression not supported %s for %s', compressedFor, finalPath);
    }
  } else if (endsWith('.html', currentRoute as string)) {
    if (includes('br', compressedFor)) {
      finalPath += `index.html.br`;
      headers = {
        'content-encoding': 'br',
        'content-type': 'text/html; charset=UTF-8'
      };
    } else if (includes('gz', compressedFor)) {
      finalPath += `index.html.gz`;
      headers = {
        'content-encoding': 'gzip',
        'content-type': 'text/html; charset=UTF-8'
      };
    } else {
      log.error('[pathForCompressed] Compression not supported %s for %s', compressedFor, finalPath);
    }
  } else {
    log.trace('[pathForCompressed] not compressing %s', currentRoute);
  }

  return { headers, url: finalPath };
}

/**
 * Create cache key for redis
 * @param cid -
 * @returns
 */
export function createCacheKey(cid: string): string {
  return `urn:macula:key:redis:${cid}`;
}

/**
 * Return proper headers for hosting
 * @param headers -all other headers, including the ipfs
 * @param mustMergeWith - These headers will ALWAYS be added at the end, overwriting the previous. be careful with this param. Useful when adding the sentry trace id
 * @returns
 */
export function returnCorrectHeaders(
  headers: IncomingHttpHeaders,
  mustMergeWith: IncomingHttpHeaders = {}
): IncomingHttpHeaders {
  // const cleanHeaders = {
  //   ...omit(['x-ipfs-roots', ], allHeaders)
  // };
  // const finalHeaders = mergeRight(requestHeaders, cleanHeaders);
  const allowedHeaders = [
    'cache-control',
    'content-encoding',
    'etag',
    'content-length',
    'content-type',
    'accept-ranges'
    // ipfs part
    // 'x-ipfs-path'
  ];

  const maculaHeaders = {
    // our custom headers
    'x-powered-by': `Macula/0.7.0`
  };
  const finalHeaders = mergeAll([pick(allowedHeaders, headers), maculaHeaders, mustMergeWith]);

  return finalHeaders as IncomingHttpHeaders;
}
