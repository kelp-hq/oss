import { expressWeb3AuthMiddleware } from '@kelp_digital/web3-api-auth-token';
import type { AxiosError } from 'axios';
import { Request, Response, Router } from 'express';
import type Server from 'http-proxy';
import httpProxy from 'http-proxy';
import { replace } from 'ramda';

import { ipfsApiURL, version } from '../../config';
import { apiKeyMiddleware } from '../../middlewares/apiKey';

/**
 * API router
 */
export const ipfsApiRouter: Router = Router({
  caseSensitive: true
});

// for some reason this is used in the whole app

ipfsApiRouter
  .route('/ipfs_api/v0/*')
  .all(expressWeb3AuthMiddleware)
  .all(apiKeyMiddleware)
  .post(async (req: Request, res: Response) => {
    req.url = replace('ipfs_api', 'api', req.url);
    console.log('Proxying API %s', ipfsApiURL + req.url);

    try {
      // if this doesn't work use other proxy

      const proxy: Server = httpProxy.createProxyServer({});
      // proxy.on('proxyReq', (proxyReq) => {
      // console.log(proxyReq.getHeaders()['content-type']);
      // });
      proxy.on('proxyRes', (proxyRes) => {
        proxyRes.headers['X-Powered-By'] = `macula/${version}`;
        proxyRes.headers.Server = `macula/${version}`;
        proxyRes.headers['x-ipfs-version'] = proxyRes.headers.server;
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

      /// maybe this will help https://github.com/axios/axios/issues/3971#issuecomment-1159556428
      // const { headers, data, status } = await axiosApiProxyInstance({
      //   method: 'post',
      //   url: req.url,
      //   // responseType: 'stream',
      //   proxy: {
      //     host: '127.0.0.1',
      //     port: 5001,
      //     protocol: 'http'
      //   }
      // });

      // data.on('data', (data: any) => {
      //   console.log('stream data', data);
      // });

      // data.on('end', () => {
      //   console.log('stream done');
      // });
      // data.pipe(res);
      // res
      //   .status(status)
      //   .header({
      //     ...headers,
      //     'x-powered-by': 'macula/0.7.0',
      //     server: `Macula/v${version}`,
      //     'x-ipfs-version': headers.server
      //   })
      //   .send(data);
    } catch (error) {
      if (error.isAxiosError) {
        const e = error as AxiosError;
        console.log(e);

        const message = [e.message, e.response?.data];
        const status = e.response?.status as number;

        res.status(status).json({ messages: message });
      } else {
        console.error(error);

        res.status(500).send({ message: error.message });
      }
    }
  });
