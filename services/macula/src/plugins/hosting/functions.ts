import { captureException, startTransaction } from '@sentry/node';
import { AxiosError, AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { append, find, includes, isEmpty, isNil, propEq } from 'ramda';

import { ipfsApiURL, ipfsGateway } from '../../config';
import { axiosApiProxyInstance } from '../../proxyServer';
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
 * Return the domains for the user. The user is added via the token
 * @param req -
 * @param res -
 */
export async function myDomains(req: Request, res: Response): Promise<void> {
  const subdomains = await findMySubdomains(req.user.address);
  res.json({ subdomains });
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

    // we do not have the record
    if (isNil(mongoModel) || isEmpty(mongoModel)) {
      const fullPath = `${ipfsGateway}/ipfs/${ipfsVersionCid}/macula.json`;

      log.trace('checking for macula.json %s', fullPath);
      const { data: maculaJsonData }: AxiosResponse<IMaculaConfig> = await axiosHostingInstance.get(fullPath);
      log.trace('found it');

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

        await axiosApiProxyInstance({
          method: 'POST',
          url: pinUrl
        });

        const t: Pick<ISubdomainDocument, 'cids' | 'createdAt'> = {
          cids: [
            {
              cid: ipfsVersionCid,
              contentSize: 0, // we need to find a way to have this number, for stat purposes
              createdAt: Date.now()
            }
          ],
          createdAt: Date.now()
        };
        // let's check do we have already the subdomain. it seems this is the new CID version
        const mongoModelBySubdomain = await findOneSubdomain(subdomain);
        if (!isNil(mongoModelBySubdomain) && !isEmpty(mongoModelBySubdomain)) {
          t.cids = append(
            {
              cid: ipfsVersionCid,
              contentSize: 0,
              createdAt: Date.now()
            },
            mongoModelBySubdomain.cids
          );

          await updateOneToHosting(mongoModelBySubdomain._id, {
            ownerAccount: req.user.address,
            subdomain: subdomain as string,
            updatedAt: Date.now(),
            config: maculaJsonData,
            lastCid: ipfsVersionCid,
            pinned: true,
            ...t
          });
        } else {
          await insertOneToHosting({
            ownerAccount: req.user.address,
            subdomain: subdomain as string,
            updatedAt: Date.now(),
            config: maculaJsonData,
            lastCid: ipfsVersionCid,
            pinned: true,
            ...t
          });
        }
        // set the cache
        await redisClient.json.set(websiteRedisKey, '.', {
          subdomain: subdomain as string,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          config: maculaJsonData as IMaculaConfig as any
        });

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
            contentSize: 0,
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
