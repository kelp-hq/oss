import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';
import { get } from 'svelte/store';
import { appStore } from './appStore';
const baseUrl = 'https://3000-kelpdigital-oss-ho9j4wluaxj.ws-eu73.gitpod.io';

let cachedApiInstance: AxiosInstance;

export interface ICIDRecordForDomain {
	cid: string;
	createdAt: number;
	config: Record<string, any>;
}

export interface ISubdomainDocument {
	ownerAccount: string;
	/**
	 * Subdomain
	 */
	subdomain: string;
	/**
	 * We are going to add to this list
	 */
	cids: ICIDRecordForDomain[];
	createdAt: number;
	updatedAt: number;
	pinned: true;
	lastCid: string;
	tippingEnabled: boolean;
}

export async function connectToApi(opts?: AxiosRequestConfig): Promise<AxiosInstance> {
	if (cachedApiInstance) {
		return cachedApiInstance;
	} else {
		cachedApiInstance = axios.create({
			baseURL: baseUrl,
			timeout: 5000,
			...opts
		});

		return cachedApiInstance;
	}
}

export function removeInterceptor(removeId: number) {
	connectToApi().then((api) => {
		api.interceptors.request.eject(removeId);
	});
}

export async function configureTokenInterceptor(token: string): Promise<number> {
	const api = await connectToApi();

	const interceptorID = api.interceptors.request.use(
		(config) => {
			config.headers = {
				...config.headers,
				Authorization: `Bearer ${token}`
			};

			return config;
		},
		function (error) {
			// Do something with request error
			return Promise.reject(error);
		}
	);
	return interceptorID;
}

export async function myDomainsApi(
	opts?: AxiosRequestConfig
): Promise<AxiosResponse<ISubdomainDocument[]>> {
	const api = await connectToApi(opts);

	try {
		const res = await api.get('/hosting/api/myDomains');
		return res;
	} catch (error) {
		const betterError = error as unknown as AxiosError<{ error: string }>;
		console.log(betterError, betterError.response?.data.error);
		throw new Error(betterError.response?.data.error);
	}
}
