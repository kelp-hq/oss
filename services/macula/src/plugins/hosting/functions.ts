import { RedisJSON } from '@redis/json/dist/commands';
import { captureException, startTransaction } from '@sentry/node';
import { AxiosError, AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { append, find, includes, isEmpty, isNil, propEq } from 'ramda';

import { ipfsApiURL, ipfsGateway } from '../../config';
import { axiosApiInstance } from '../../proxyServer';
import { redisClient } from '../../redisClient';
import { log } from '../../utils/logger';
import { axiosHostingInstance, IMaculaConfig } from '.';
import {
  findMySubdomains,
  findOneSubdomain,
  findOneWebsiteByCid,
  insertOneToHosting,
  ISubdomainDocument,
  updateOneToHosting
} from './databaseQueries';
import { IAddVersionApi } from './middlewares';
import { createCacheKey } from './utils';

/**
 * The record struct for redis cache
 * @internal
 */
export interface IRedisCacheRecord {
  subdomain: string;
  config: IMaculaConfig;
}

/**
 * Return the domains for the user. The user is added via the token
 * @param req -
 * @param res -
 */
export async function myDomains(req: Request, res: Response): Promise<void> {
  const subdomains = await findMySubdomains(req.user.address);
  res.json(subdomains);
}

export async function addVersion(req: Request<never, never, IAddVersionApi>, res: Response): Promise<void> {
  const tx = startTransaction({
    name: 'Register IPFS cid as a website',
    description: 'store the cid to the DB with the macula.json'
  });

  try {
    const { ipfsVersionCid, subdomain } = req.body;
    let statusCode = 200;

    const websiteRedisKey = createCacheKey(ipfsVersionCid);

    const mongoModel = await findOneWebsiteByCid(ipfsVersionCid);
    // console.log('mongoModel', mongoModel);

    const fullPath = `${ipfsGateway}/ipfs/${ipfsVersionCid}/macula.json`;

    log.trace('checking for macula.json %s', fullPath);
    const { data: maculaJsonData }: AxiosResponse<IMaculaConfig> = await axiosHostingInstance.get(fullPath);
    log.trace('found it');

    // we do not have the record
    if (isNil(mongoModel) || isEmpty(mongoModel)) {
      if (!includes(req.user.address, maculaJsonData.account)) {
        res.status(400).json({
          error: true,
          message: 'Only user address that is in the macula.json config can make this request'
        });
      } else {
        // we are going to pin it first because it takes AGES!!!
        // @TODO this must be done via workers
        // https://docs.ipfs.tech/reference/kubo/rpc/#api-v0-pin-add
        const pinUrl = ipfsApiURL + `/api/v0/pin/add?arg=${ipfsVersionCid}&recursive=true`;
        log.trace('pinning to the ipfs %s', pinUrl);

        // not that intuitive fetching
        await axiosApiInstance({
          method: 'POST',
          url: pinUrl
        });

        const t: Pick<ISubdomainDocument, 'cids' | 'createdAt'> = {
          cids: [
            {
              cid: ipfsVersionCid,
              createdAt: Date.now(),
              config: maculaJsonData
            }
          ],
          createdAt: Date.now()
        };
        // let's check do we have already the subdomain. it seems this is the new CID version
        const mongoModelBySubdomain = await findOneSubdomain(subdomain);
        if (!isNil(mongoModelBySubdomain) && !isEmpty(mongoModelBySubdomain)) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { _id, ...rest } = mongoModelBySubdomain;

          t.cids = append(
            {
              cid: ipfsVersionCid,
              createdAt: Date.now(),
              config: maculaJsonData
            },
            mongoModelBySubdomain.cids
          );

          await updateOneToHosting(mongoModelBySubdomain._id, {
            ...rest,
            updatedAt: Date.now(),
            lastCid: ipfsVersionCid,
            pinned: true,
            ...t
          });
        } else {
          await insertOneToHosting({
            ownerAccount: req.user.address,
            subdomain: subdomain as string,
            updatedAt: Date.now(),
            lastCid: ipfsVersionCid,
            pinned: true,
            tippingEnabled: false,
            ...t
          });
        }

        const redisCacheRecord: IRedisCacheRecord = {
          subdomain: subdomain as string,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          config: maculaJsonData as IMaculaConfig as any
        };

        // set the cache
        await redisClient.json.set(websiteRedisKey, '.', redisCacheRecord as unknown as RedisJSON);

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
    } else {
      const { _id, cids, ...rest } = mongoModel;

      if (!isEmpty(find(propEq('cid', ipfsVersionCid), cids))) {
        res.status(400).json({ error: true, message: `Version already added!` });
      } else {
        const newCids = append(
          {
            cid: ipfsVersionCid,
            config: maculaJsonData,
            createdAt: Date.now()
          },
          cids
        );
        const newData: ISubdomainDocument = {
          ...rest,
          updatedAt: Date.now(),
          cids: newCids,
          lastCid: ipfsVersionCid
        };

        await updateOneToHosting(_id, newData);
        res.json({ updated: true });
      }
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
}
