import fetch from 'cross-fetch';

import { IHttpClient } from './client';

export interface IHttpInstance {
  url: string;
  post(resource: string | Request, options: RequestInit): Promise<Response>;
}

export function createHttp(options: IHttpClient): IHttpInstance {
  return {
    url: options.url,
    post: (resource, options) => fetch(resource, { ...options, method: 'POST' })
  };
}
