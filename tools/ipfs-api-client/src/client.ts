import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
// import fetch from 'cross-fetch';
/**
 * Default api url `'http://127.0.0.1:5001/api/v0'`
 */
export const defaultApiUrl: string = 'http://127.0.0.1:5001/api/v0';

/**
 * Generic ipfs options that are used everywhere
 */
export interface IGenericIpfsOptions {
  ipfs: AxiosInstance;
}

export let axiosInstance: AxiosInstance;

/**
 * Fully qualified url where to have the api. Default  `http://127.0.0.1:5001/api/v0`
 */
interface IClientOptions {
  axiosOpts: AxiosRequestConfig;
}
/**
 * Create Axios instance
 * @param options -
 * @returns
 */
export async function createHttpClient(
  options: IClientOptions = {
    axiosOpts: {
      baseURL: defaultApiUrl
    }
  }
): Promise<AxiosInstance> {
  const { axiosOpts } = options;

  const instance = axios.create({
    ...axiosOpts
  });

  if (!axiosInstance) {
    axiosInstance = instance;
  }
  return instance;
}
