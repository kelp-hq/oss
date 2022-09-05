import axios, { AxiosInstance } from 'axios';
import { Request, Response, Router } from 'express';
import http from 'http';
import https from 'https';

import { ipfsApiURL } from '../../config';
import { auth } from '../../web3-auth-handler/authMiddleware';

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

export const axiosApiProxyInstance: AxiosInstance = axios.create({
	httpAgent: new http.Agent({ keepAlive: true }),
	httpsAgent: new https.Agent({ keepAlive: true }),
	proxy: {
		host: '127.0.0.1',
		port: 5001,
		protocol: 'http'
	}
});

// for some reason this is used in the whole app

ipfsApiRouter.all('/ipfs_api/*', auth, async (req: Request, res: Response) => {
	console.log('Proxying API %s', ipfsApiURL + req.url);
	// if this doesn't work use other proxy

	const { headers, data, status } = await axiosApiProxyInstance({
		method: req.method,
		url: req.url
	});

	res
		.status(status)
		.header({
			...headers,
			'x-powered-by': 'macula/0.7.0',
			server: 'macula/0.7.0',
			'x-ipfs-version': headers.server
		})
		.send(data);

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
