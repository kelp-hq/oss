import axios, { AxiosInstance } from 'axios';
import type { Request, Response } from 'express';
import http from 'http';
import httpProxy, { ServerOptions } from 'http-proxy';
import https from 'https';

import { version } from './config';
import { sentry } from './sentry';
import { log } from './utils/logger';

/**
 * Create the node-http-proxy server for req and res, listen do the last event then modify the headers.
 * Add the macula powered-by and instrument the calls with Sentry
 * @param req -
 * @param res -
 * @param proxyTo - usually http://127.0.0.1:8080/
 * @param proxyServerOptions - default `{}`
 * @returns
 */
export async function createProxy(
  req: Request,
  res: Response,
  proxyTo: string,
  proxyServerOptions: ServerOptions = {}
): Promise<void> {
  const ipfsProxyTransaction = sentry.startTransaction({
    op: `web-proxy`,
    name: `web-proxy`,
    description: 'Web http proxy request',
    tags: {
      component: 'proxy'
    },
    data: {
      url: req.url,
      proxyUrl: proxyTo
    }
  });
  await new Promise((resolve: (value: unknown) => void, reject) => {
    // create proxy server
    const proxy = httpProxy.createProxyServer(proxyServerOptions);

    log.trace(`Proxy the request ${req.url}`);

    proxy.on('proxyRes', (proxyRes) => {
      proxyRes.headers['X-Powered-By'] = `Macula/v${version}`;
      resolve(null);
    });

    proxy.web(req, res, { target: proxyTo }, (error) => {
      sentry.captureException(error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          errors: [error.message]
        })
      );
      reject();
    });
  });
  ipfsProxyTransaction?.setStatus('ok');
  ipfsProxyTransaction?.finish();
}

export const axiosApiProxyInstance: AxiosInstance = axios.create({
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
  proxy: {
    host: '127.0.0.1',
    port: 5001,
    protocol: 'http'
  }
});
