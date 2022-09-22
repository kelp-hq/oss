/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable require-atomic-updates */
import { expressWeb3AuthMiddleware } from '@kelp_digital/web3-auth-handler';
import { captureException, startTransaction } from '@sentry/node';
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { NextFunction, Request, Response, Router } from 'express';
import http from 'http';
import https from 'https';
import { dissoc, isEmpty, isNil, last, mergeRight } from 'ramda';

import { ipfsApiURL, ipfsGateway } from '../../config';
import { getDB } from '../../mongodbClient';
import { axiosApiProxyInstance } from '../../proxyServer';
import { redisClient } from '../../redisClient';
import { sentry } from '../../sentry';
import { log } from '../../utils/logger';
import {
  collectionSubdomains,
  findLastModificationDateForHosting,
  findOneSubdomain,
  findOneWebsiteByCid,
  IHostingRecordDocument,
  insertOneToHosting,
  ISubdomainDocument
} from './databaseQueries';
import { validateBodyForAddApi } from './middlewares';
import {
  createCacheKey,
  extractRoute,
  maculaWebsiteMiddleware,
  pathForCompressed,
  returnCorrectHeaders,
  rootCid
} from './utils';

// actual Express router
export const hostingRouter: Router = Router();

// Create the axios instance
export const axiosHostingInstance: AxiosInstance = axios.create({
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
  //follow up to 10 HTTP 3xx redirects
  maxRedirects: 10,
  // this is in milliseconds
  timeout: 1000 * 60 * 7 // seven minutes
  //cap the maximum content length we'll accept to 50MBs, just in case
  // maxContentLength: 50 * 1000 * 1000
});

export interface IHostingRequestContext {
  /**
   * A generated config for the website.
   */
  maculaConfig?: IMaculaConfig;
  /**
   * when requested via the IPFS proxy this is the first thing to the right of the /ipfs/. when requested via the subdomain this is fetched from the DB and assembeled for the url proxy
   */
  baseCid: string;
  /**
   * This is the route AFTER all the static things. cid or a subdomain name
   */
  currentRoute: string;
  /**
   * it seems this is the full ipfs path for the record
   */
  ipfsItemPath: string;
}

/**
 * An interface for the routes
 */
// interface _IRoute {
//   src: string;
//   headers?: Record<string, string | number>;
//   status?: 307 | 308;
// }
/**
 * The keys correspond to the `trailingSlash` sveltekit config
 */
// interface _IRoutes {
//   always: _IRoute[];
//   never: _IRoute[];
//   ignore: _IRoute[];
// }

export type AvailableCompressions = 'br' | 'gz';

export interface IMaculaConfig {
  version: 1;
  source: 'sveltekit';
  account: string;
  preredered: boolean;
  appType: 'spa' | 'static';
  fallback?: {
    file?: string;
    route?: string;
  };
  compressedFor: AvailableCompressions[];
  routes: any[];
  pages: Record<string, { file: string }>;
  subdomain?: string;
}

/**
 * This actually does the retrieveing the files
 * @param req -
 * @param res -
 */
async function retrieveFilesFromIpfs(req: Request, res: Response): Promise<void> {
  const tx = sentry.startTransaction({
    name: 'retrieveFilesFromIpfs'
  });
  try {
    let allHeaders = {
      'x-powered-by': `Macula/0.7.0`
    };
    /**
     * we do not have macula config and we just proxy
     */
    if (isNil(req.hostingCtx.maculaConfig)) {
      const { baseCid, currentRoute } = req.hostingCtx;
      const fullPath = `${ipfsGateway}/ipfs${baseCid}${currentRoute}`;

      log.info('macula not available in main get, should just proxy');

      // proxy 🤣
      const { headers, data } = await axiosHostingInstance.get(fullPath, {
        responseType: 'arraybuffer'
      });

      const finalHeaders = mergeRight(dissoc('x-ipfs-roots', headers), allHeaders);

      res.set(finalHeaders);
      tx.finish();
      res.send(data);
    } else {
      /**
       * we have macula config
       */
      const baseIpfsPath = `${ipfsGateway}/ipfs`;
      let fullPath = '';
      if (
        !isNil(req.hostingCtx.maculaConfig.compressedFor) ||
        !isEmpty(req.hostingCtx.maculaConfig.compressedFor)
      ) {
        const { url, headers } = await pathForCompressed(req);

        fullPath = `${baseIpfsPath}/${url}`;
        allHeaders = {
          ...allHeaders,
          ...headers
        };
      } else {
        fullPath = `${baseIpfsPath}${req.hostingCtx.currentRoute}`;
      }

      // proxy 🤣
      const { headers, data } = await axiosHostingInstance.get(fullPath, {
        responseType: 'arraybuffer'
      });

      // const finalHeaders = mergeRight(dissoc('x-ipfs-roots', headers), allHeaders);
      const lastModificationDate = await findLastModificationDateForHosting(req.hostingCtx.baseCid);

      const finalHeaders = returnCorrectHeaders(
        { ...headers, ...allHeaders },
        {
          'x-sentry-trace-id': tx.traceId,
          // it's for ALL requests for the hosted CID
          'Last-Modified': new Date(lastModificationDate?.createdAt as unknown as number).toUTCString()
        }
      );

      // // start value
      // const headersWithIpfsXRoots = Buffer.from(JSON.stringify(mergeRight(headers, allHeaders))).length;
      // // end value
      // const headersWithoutIpfsXRoots = Buffer.from(JSON.stringify(finalHeaders)).length;

      // log.debug(
      //   'headers size decrease after removing x-ipfs-roots %s% [before %s]-[after %s] ',
      //   ((1 - headersWithoutIpfsXRoots / headersWithIpfsXRoots) * 100).toFixed(),
      //   headersWithIpfsXRoots,
      //   headersWithoutIpfsXRoots
      // );

      res.set(finalHeaders);
      tx.finish();
      res.send(data);
    }
  } catch (error) {
    sentry.captureException(error);

    if (error.isAxiosError) {
      const e = error as AxiosError;
      const message = e.message;
      const status = e.response?.status as number;
      console.error('Request failed status code %s ', status, message, req.url);
      res.status(400).send({
        message: `Request failed. Possible reasons are, the CID is not found on the IPFS node, it's not prerendered SPA application, the CID or subdomain are not registered in the Macula DB`
      });
    } else {
      res.status(500).send(error.message);
    }
  }
}

async function retrieveMaculaConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
  let maculaConfig;
  const { baseCid } = req.hostingCtx;
  const redisKey = createCacheKey(baseCid);
  const fromRedis = (await redisClient.json.get(redisKey)) as unknown as IMaculaConfig;

  // if it's not in the cache
  if (isNil(fromRedis)) {
    // look in the DB
    const fromMongo = await findOneWebsiteByCid(baseCid);
    if (isNil(fromMongo)) {
      next(`This CID is not registered in Macula system. macula.json doesn't is not exist in the DB`);
    } else {
      maculaConfig = fromMongo.config;
    }
  } else {
    maculaConfig = fromRedis;
  }
  req.hostingCtx.maculaConfig = maculaConfig;
  next();
}
/**
 * Initialize the URL params and context for the cid route. Sets the context to the request
 * @param req -
 * @param res -
 * @param next -
 * @returns
 */
async function initForIpfsUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
  // req.params looks like this { '0': 'bafybeiaoxjdspqff4ehphbncwxged4rtds5kawffd5k22g3ofmi3ckex7a/features/feature-a/' }
  const urlPath = req.params[0];
  const cid = rootCid(urlPath);
  const currentRoute = extractRoute(urlPath);
  const ipfsItemPath = `/${cid}${currentRoute}`;

  /**
   * set stuff to the req
   */
  const reqContext: IHostingRequestContext = {
    baseCid: cid,
    currentRoute,
    /**
     * this is in the format `/CID/feature/fetures-a/` or `/CID/_app/immutable/some-javascript.js`. This is added to the gateway
     */
    ipfsItemPath
  };

  req.hostingCtx = reqContext;

  next();
}

/**
 * Initialize the URL params and context for the subdomain route. Here we check is subdomain registered or not and what's its last CID so we can serve the content. Also sets the context to the request
 * @param req -
 * @param res -
 * @param next -
 * @returns
 */
async function initForSubdomainUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
  // req.params looks like this { '0': 'features/feature-a/', subdomain: 'anagolay' }
  const mongoRecord = await findOneSubdomain(req.params.subdomain);
  if (isNil(mongoRecord)) {
    return next('This subdomain is not registered. Please register it using our app.');
  } else {
    const cid = last(mongoRecord?.cids)?.cid;

    if (isNil(cid)) {
      return next(`This subdomain doesn't have the CID connected to it.`);
    } else {
      const currentRoute = '/' + req.params[0];
      const ipfsItemPath = `${cid}${currentRoute}`;
      /**
       * set stuff to the req
       */
      const reqContext: IHostingRequestContext = {
        baseCid: cid,
        currentRoute,
        ipfsItemPath
      };

      req.hostingCtx = reqContext;

      return next();
    }
  }
}

/**
 * this is the endpoint that serves the CID.on.kelp.digital
 */
hostingRouter
  .route('/hosting/withIpfs/*')
  .all(initForIpfsUrl)
  .all(retrieveMaculaConfig)
  .all(maculaWebsiteMiddleware)
  .get(async (req: Request, res) => {
    await retrieveFilesFromIpfs(req, res);
  });

hostingRouter
  .route('/hosting/withSubdomain/:subdomain/*')
  .all(initForSubdomainUrl)
  .all(retrieveMaculaConfig)
  .all(maculaWebsiteMiddleware)
  .get(async (req: Request, res) => {
    // https://bafybeiaoxjdspqff4ehphbncwxged4rtds5kawffd5k22g3ofmi3ckex7a.on.localhost/features/feature-a/

    // const { headers, data } = await axiosHostingInstance.get(fullPath, {
    //   responseType: 'arraybuffer'
    // });
    await retrieveFilesFromIpfs(req, res);
    // res.set(headers).send(data);
  });

/**
 * Add the CID and maybe subdomain to the macula website storage.
 */
hostingRouter
  .route('/hosting/api/addSubdomain')
  .all(validateBodyForAddApi)
  .all(expressWeb3AuthMiddleware)
  .post(async (req: Request<never, never, { subdomain: string; ipfsCid: string }>, res: Response) => {
    const tx = startTransaction({
      name: 'Register IPFS cid as a wewbsite, fetch the macula.json'
    });

    try {
      const db = await getDB();
      const { subdomain, ipfsCid } = req.body;

      const websiteRedisKey = createCacheKey(ipfsCid);

      // if the key is not found it will throw error, so we catch it and then get the macula.json and store it
      const subdomainInDb = await findOneSubdomain(subdomain);
      const cidInDb = await findOneWebsiteByCid(ipfsCid);

      if (isNil(subdomainInDb) || isEmpty(subdomainInDb)) {
        const fullPath = `${ipfsGateway}/ipfs/${ipfsCid}/macula.json`;

        log.trace('checking for macula.json %s', fullPath);
        const maculaRes: AxiosResponse<IMaculaConfig> = await axiosHostingInstance.get(fullPath);
        log.trace('found it');

        // we are going to pin it first because it takes AGES!!!
        // @TODO this must be done via workers
        // https://docs.ipfs.tech/reference/kubo/rpc/#api-v0-pin-add
        const pinUrl = ipfsApiURL + `/api/v0/pin/add?arg=${ipfsCid}&recursive=true`;
        log.trace('pinning to the ipfs %s', pinUrl);

        await axiosApiProxyInstance({
          method: 'POST',
          url: pinUrl
        });

        await redisClient.json.set(websiteRedisKey, '.', maculaRes.data as any);

        if (isNil(cidInDb)) {
          const hostingWithCid: IHostingRecordDocument = {
            ownerAccount: maculaRes.data.account,
            ipfsCid,
            config: maculaRes.data,
            createdAt: Date.now(),
            pinned: true
          };

          await insertOneToHosting(hostingWithCid);
        }

        const subdomainDocument: ISubdomainDocument = {
          subdomain,
          cids: [
            {
              cid: ipfsCid,
              contentSize: 0, // we need to find a way to have this number, for stat purposes
              createdAt: Date.now()
            }
          ]
        };
        await db.collection(collectionSubdomains).insertOne(subdomainDocument);

        // query the parts of json
        // const val = await redisClient.json.get(websiteRedisKey, {
        //   path: '.account'
        // });

        tx.finish();
        res.status(201).json({
          success: true
        });
      } else {
        // we have a record
        res.status(501).send('not implemented, record exists');
      }
    } catch (error) {
      if (error.isAxiosError) {
        const e = error as AxiosError;
        const message = e.message;
        const status = e.response?.status as number;
        console.error('Request failed', message, req.url);

        captureException(error);
        tx.finish();

        res.status(status).json();
      } else {
        captureException(error);
        console.error(error);
        tx.finish();

        res.status(500).send({ message: error.message, traceId: tx.traceId });
      }
    }
  });

export interface IWerbsiteAddCidBody {
  ipfsCid: string;
}
/**
 * Add the CID to the macula website storage. this will make hosting available
 * only for the CID rutes like this : `https://CID.on.macula.link`
 */
hostingRouter
  .route('/hosting/api/addCid')
  .all(validateBodyForAddApi)
  .all(expressWeb3AuthMiddleware)
  .post(async (req: Request<never, never, IWerbsiteAddCidBody>, res: Response) => {
    const tx = startTransaction({
      name: 'Register IPFS cid as a website',
      description: 'store the cid to the DB with the macula.json'
    });

    try {
      const { ipfsCid } = req.body;
      let statusCode = 200;

      const websiteRedisKey = createCacheKey(ipfsCid);

      // this is set only in one scenario.
      // the record is saved in the DB first then set in the cache
      // this also prevents the api to hit the db
      const cachedResult = (await redisClient.json.get(websiteRedisKey)) as any;
      if (!isNil(cachedResult)) {
        res.status(statusCode).json({
          success: true
        });
      } else {
        const mongoModel = await findOneWebsiteByCid(ipfsCid);

        if (isNil(mongoModel) || isEmpty(mongoModel)) {
          const fullPath = `${ipfsGateway}/ipfs/${ipfsCid}/macula.json`;

          log.trace('checking for macula.json %s', fullPath);
          const res: AxiosResponse<IMaculaConfig> = await axiosHostingInstance.get(fullPath);
          log.trace('found it');

          await insertOneToHosting({
            ownerAccount: res.data.account,
            ipfsCid,
            config: res.data,
            createdAt: Date.now(),
            pinned: false
          });

          // set the cache
          await redisClient.json.set(websiteRedisKey, '.', res.data as any);

          // query the parts of json
          // const val = await redisClient.json.get(websiteRedisKey, {
          //   path: '.account'
          // });

          statusCode = 201;
        }

        tx.finish();
        res.status(statusCode).json({
          success: true
        });
      }
    } catch (error) {
      if (error.isAxiosError) {
        const e = error as AxiosError;
        const message = e.message;
        const status = e.response?.status as number;
        console.error('Request failed', message, req.url);

        captureException(error);
        tx.finish();

        res.status(status).json({
          error: true,
          message: 'Cannot find the CID on IPFS node'
        });
      } else {
        captureException(error);
        tx.finish();

        res.status(500).send({ message: error.message, traceId: tx.traceId });
      }
    }
  });
