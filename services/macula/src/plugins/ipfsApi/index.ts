import type { AxiosInstance } from 'axios';
import axios from 'axios';
import { Request, Response, Router } from 'express';
import http from 'http';
import Server from 'http-proxy';
import httpProxy from 'http-proxy';
import https from 'https';
import { replace } from 'ramda';

import { ipfsApiURL, version } from '../../config';

/**
 * API router
 */
export const ipfsApiRouter: Router = Router({
  caseSensitive: true
});

export const axiosGatewayProxyInstance: AxiosInstance = axios.create({
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
  proxy: {
    host: '127.0.0.1',
    port: 8080,
    protocol: 'http'
  }
});

const proxy: Server = httpProxy.createProxyServer({});

export const axiosApiProxyInstance: AxiosInstance = axios.create({
  // httpAgent: new http.Agent({ keepAlive: true }),
  // httpsAgent: new https.Agent({ keepAlive: true }),
  proxy: {
    host: '127.0.0.1',
    port: 5001,
    protocol: 'http:'
  }
});

// for some reason this is used in the whole app

ipfsApiRouter
  .route('/ipfs_api/v0/*')
  // .all(auth)
  .post(async (req: Request, res: Response) => {
    req.url = replace('ipfs_api', 'api', req.url);
    console.log('Proxying API %s', ipfsApiURL + req.url);
    // if this doesn't work use other proxy
    // try {
    proxy.on('proxyReq', (proxyReq) => {
      // console.log(proxyReq);
    });
    proxy.on('proxyRes', (proxyRes) => {
      proxyRes.headers['X-Powered-By'] = `Macula/v${version}`;
    });

    proxy.web(req, res, { target: ipfsApiURL }, (error) => {
      console.log(req.body);

      console.error(error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          Error: error.message
        })
      );
    });

    // const { headers, data, status } = await axiosApiProxyInstance({
    //   method: 'post',
    //   url: ipfsApiURL + ipfsApiPath,
    //   onUploadProgress: (progressEvent: unknown) => {
    //     console.log('progressEvent', progressEvent);
    //   },
    //   onDownloadProgress: (progressEvent: unknown) => {
    //     console.log('onDownloadProgress', progressEvent);
    //   },
    //   proxy: {
    //     host: '127.0.0.1',
    //     port: 5001,
    //     protocol: 'http'
    //   }
    // });

    // res
    //   .status(status)
    //   .header({
    //     ...headers,
    //     'x-powered-by': 'macula/0.7.0',
    //     server: 'macula/0.7.0',
    //     'x-ipfs-version': headers.server
    //   })
    //   .send(data);
    // } catch (error) {
    //   if (error.isAxiosError) {
    //     const e = error as AxiosError;
    //     const message = e.message;
    //     const status = e.response?.status as number;

    //     res.status(status).json({ message });
    //   } else {
    //     console.error(error);

    //     res.status(500).send({ message: error.message });
    //   }
    // }

    // const proxy = httpProxy.createProxyServer();
    // proxy.web(req, res, { target: ipfsApiURL }, (error) => {
    //   console.log(req.body);

    //   console.error(error);
    //   res.writeHead(500, { 'Content-Type': 'application/json' });
    //   res.end(
    //     JSON.stringify({
    //       Error: error.message
    //     })
    //   );
    // });
  });
