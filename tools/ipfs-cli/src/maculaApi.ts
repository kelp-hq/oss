import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';
import { isEmpty, isNil } from 'ramda';

const { AN_IPFS_API_KEY, AN_IPFS_AUTH_METHOD, AN_IPFS_API_URL } = process.env;

/**
 *
 */
const baseUrl: string =
  AN_IPFS_API_URL?.replace('ipfs_api/v0', '') || 'https://3000-kelpdigital-oss-ho9j4wluaxj.ws-eu73.gitpod.io';

let cachedApiInstance: AxiosInstance;

const headers: Record<string, string> = {};

if (AN_IPFS_AUTH_METHOD === 'bearer') {
  if (isNil(AN_IPFS_API_KEY) || isEmpty(AN_IPFS_API_KEY)) {
    throw new Error(`AN_IPFS_API_KEY must be set properly for current Bearer auth method.`);
  }

  headers.Authorization = `Bearer ${AN_IPFS_API_KEY}`;
}

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

export function removeInterceptor(removeId: number | undefined) {
  if (!isNil(removeId)) {
    connectToApi().then((api) => {
      api.interceptors.request.eject(removeId);
    });
  }
}

export async function configureTokenInterceptor(token: string): Promise<number> {
  const api = await connectToApi();
  console.log('interceptor', token);
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

export async function myDomainsApi(opts?: AxiosRequestConfig): Promise<AxiosResponse<ISubdomainDocument[]>> {
  const api = await connectToApi({ ...opts, headers });

  console.log('myDomainsApi', api.interceptors.request);
  try {
    const res = await api.get('/hosting/api/myDomains');
    return res;
  } catch (error) {
    const betterError = error as unknown as AxiosError<{ error: string }>;
    console.log(betterError, betterError.response?.data.error);
    throw new Error(betterError.response?.data.error);
  }
}

export async function addVersionApi(
  data: { ipfsVersionCid: string; subdomain: string },
  opts?: AxiosRequestConfig
): Promise<AxiosResponse<ISubdomainDocument[]>> {
  const api = await connectToApi({ ...opts, headers });

  try {
    const res = await api.post('/hosting/api/addVersion', data);
    return res;
  } catch (error) {
    const betterError = error as unknown as AxiosError<{ error: string }>;
    console.log(betterError, betterError.response?.data.error);
    throw new Error(betterError.response?.data.error);
  }
}
