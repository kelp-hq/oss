/* eslint-disable @typescript-eslint/typedef */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';
import { isNil } from 'ramda';

export const baseUrl: string = 'https://macula.link';

/**
 *
 */
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

export class MaculaApi {
  private _api: AxiosInstance;
  connectedUrl: string;

  public get api(): AxiosInstance {
    return this._api;
  }
  public set api(value: AxiosInstance) {
    this._api = value;
  }

  constructor(baseUrl: string, opts?: AxiosRequestConfig) {
    this._api = axios.create({
      baseURL: baseUrl,
      timeout: 5000,
      ...opts
    });
    this.connectedUrl = baseUrl;
  }

  /**
   * handleError
   * @typeParam - AxiosError
   */
  public handleError<T>(error: T): Error {
    console.log('handleError', error);
    throw new Error(error as any);
  }

  public removeInterceptor(removeId: number | undefined) {
    if (!isNil(removeId)) {
      this.api.interceptors.request.eject(removeId);
    }
  }

  public async configureTokenInterceptor(token: string): Promise<number> {
    const interceptorID = this.api.interceptors.request.use(
      (config) => {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`
        };
        return config;
      },
      (error) => {
        // Do something with request error
        this.handleError(error);
        return Promise.reject(error);
      }
    );
    return interceptorID;
  }

  /**
   * POST the payload and add the version to the macula service
   * @param payload -
   * @returns
   */
  public async hostingApiAddVersion(payload: { ipfsVersionCid: string; subdomain: string }) {
    try {
      const res = await this.api.post('/hosting/api/addVersion', payload);
      return res;
    } catch (error) {
      this.handleError(error);
    }
  }
  public async hostingMyDomains(): Promise<AxiosResponse<ISubdomainDocument[]>> {
    try {
      const res = await this.api.get('/hosting/api/myDomains');
      return res;
    } catch (error) {
      // this.handleError(error);
      const betterError = error as unknown as AxiosError<{ error: string }>;
      console.log(betterError, betterError.response?.data.error);
      throw new Error(betterError.response?.data.error);
    }
  }
}

export function initMaculaApi(url: string = baseUrl) {
  return new MaculaApi(url);
}
