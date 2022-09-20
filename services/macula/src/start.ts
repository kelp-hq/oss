// Copyright (c) Kelp Digital OU. All rights reserved. For more info on license see `LICENSE` file.

/**
 * Macula is the on-the-fly image processing service on top of IPFS
 *
 * @packageDocumentation
 */

/* eslint-disable @rushstack/typedef-var */

import axios from 'axios';
import compression from 'compression';
import cors from 'cors';
import express, { json, NextFunction, Request, Response } from 'express';
import { type Express } from 'express';
import helmet from 'helmet';
import { includes } from 'ramda';

import { ipfsGateway, port } from './config';
import { setupMongoDB } from './mongodbClient';
import { hostingRouter } from './plugins/hosting';
import { ipfsApiRouter } from './plugins/ipfsApi';
import { maculaRouter } from './plugins/macula';
import { createProxy } from './proxyServer';
import { createRedisInstance } from './redisClient';
import { initSentry, sentry } from './sentry';
import { getEnv } from './utils/env';
import { logRouterRoutes } from './utils/expressHelpers';
import { log } from './utils/logger';
import { StrategyValidationError } from './web3-auth-handler/errors';

const enabledRoutes = JSON.parse(
  getEnv('MACULA_ENABLED_ROUTES', '["hosting","image_processing","ipfs_api"]')
);

/**
 * Express app
 */
export const app: Express = express();

initSentry(app);

// create redis instance
createRedisInstance()
  .then(() => log.debug('Redis connected'))
  .catch(sentry.captureException);

// create mongoDb instance
setupMongoDB()
  .then(() => log.debug('MongoDB connected'))
  .catch(sentry.captureException);

// must be first middleware
app.use(sentry.Handlers.requestHandler());
app.use(sentry.Handlers.tracingHandler());

/**
 * big amount of cool securities
 */
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

/**
 * Cors, set up here restrictions
 */
app.use(
  cors({
    origin: '*'
  })
);

/**
 * So we can use the json in the requests
 */
app.use(json());

/**
 * use this for now then see https://github.com/Alorel/shrink-ray or write your own Botli compression plugin
 */
app.use(compression());

app.use(express.urlencoded({ extended: true }));

/**
 * Catch All route, useful for debugging
 */
app.get('*', (req: Request, res: Response, next: NextFunction) => {
  log.debug('[Route] is %s', req.url);
  next();
});

/**
 * Home route
 */
app.get('/', (req: Request, res: Response) => {
  res.send('IPFS gateway proxy with on-the-fly image resizing');
});

/**
 * Health-check route
 */
app.get('/healthcheck', (req: Request, res: Response) => {
  res.send('OK');
});

/**
 * IPFS empty directory CID, used for the check the IPFS
 */
app.get('/ipfs/QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn', async (req: Request, res: Response) => {
  await createProxy(req, res, ipfsGateway);
});

/**
 * Favicon route
 * @remarks This shouldn't be instrumented either
 */
app.get('/favicon.ico', async (req: Request, res: Response) => {
  const anagolayFavicon = await axios.get(
    `${ipfsGateway}/ipfs/QmZwm3XmwUkAb6PhAwyFPBeWLnC7f8o5hnbR3erzqVUZSd`,
    {
      responseType: 'arraybuffer',
      headers: {}
    }
  );
  res
    .setHeader('Content-type', 'image/ico')
    .setHeader('x-kelp-orig-cid', 'QmZwm3XmwUkAb6PhAwyFPBeWLnC7f8o5hnbR3erzqVUZSd')
    .send(anagolayFavicon.data);
});

if (includes('image_processing', enabledRoutes)) {
  log.trace('Enabling image_processing with these endpoints:');
  logRouterRoutes(maculaRouter);
  app.use(maculaRouter);
}

if (includes('hosting', enabledRoutes)) {
  log.trace('Enabling hosting with these endpoints:');
  logRouterRoutes(hostingRouter);
  app.use(hostingRouter);
}

if (includes('ipfs_api', enabledRoutes)) {
  log.trace('Enabling ipfs_api with these endpoints');
  logRouterRoutes(ipfsApiRouter);
  app.use(ipfsApiRouter);
}

// The error handler must be before any other error middleware and after all controllers
app.use(sentry.Handlers.errorHandler());

// error handler
// eslint-disable-next-line @typescript-eslint/naming-convention
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.log('in the error middleware', err);
  if (err instanceof StrategyValidationError) {
    res.status(err.status).json({ error: err.message });
  } else {
    res.status(500).json({
      error: err.message || err
    });
  }
});

log.debug(`Listening on port ${port}`);
app.listen(port);
