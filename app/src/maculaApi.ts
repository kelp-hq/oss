/* eslint-disable @typescript-eslint/typedef */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';
import { isNil } from 'ramda';

export const baseUrl: string = 'https://api.macula.link';

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
  private _interceptorId: number;

  public get interceptorId(): number {
    return this._interceptorId;
  }
  public set interceptorId(value: number) {
    this._interceptorId = value;
  }
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

  public removeInterceptor() {
    if (!isNil(this.interceptorId)) {
      this.api.interceptors.request.eject(this.interceptorId);
    }
  }

  public async configureTokenInterceptor(token: string): Promise<void> {
    console.log('configuring token for ', token);
    this.interceptorId = this.api.interceptors.request.use(
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
  }

  /**
   * POST the payload and add the version to the macula service
   * @param payload -
   * @returns
   */
  public async hostingApiAddVersion(payload: { ipfsVersionCid: string; subdomain: string }) {
    try {
      const res = await this.api.post('/addVersion', payload);
      return res;
    } catch (error) {
      this.handleError(error);
    }
  }
  public async hostingMyDomains(): Promise<AxiosResponse<ISubdomainDocument[]>> {
    console.log(this.api.defaults);
    try {
      const res = await this.api.get('/myDomains');
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
  console.debug('creating MaculaApi for %s', url);
  return new MaculaApi(url);
}
