import crossFetch from 'cross-fetch';
import FormData from 'form-data';

import { Add } from './interfaces/add';

/**
 * Enhanced native fetch response
 * @public
 */
export interface IEnhancedResponse extends Response {
  // /**
  //  * Parse the stream ndjson to json
  //  */
  // ndjson?: () => AsyncGenerator<unknown>;
  // iterator?: () => AsyncIterable<unknown>;
}

/**
 * HTTP Client class
 */
class Client {
  private _baseUrl: string | URL = `http://127.0.0.1:5001`;
  /**
   * Default baseurl `http://127.0.0.1:5001`. Without `/` at the end
   */
  public get baseUrl(): string | URL {
    return this._baseUrl;
  }
  public set baseUrl(value: string | URL) {
    this._baseUrl = value;
  }

  private _apiPath: string = 'api/v0';
  /**
   * Default api path `api/v0`. Without `/` at the beginning
   */
  public get apiPath(): string {
    return this._apiPath;
  }
  public set apiPath(value: string) {
    this._apiPath = value;
  }

  constructor(options?: any) {}

  private async _post(resource: URL | RequestInfo, options?: RequestInit): Promise<IEnhancedResponse> {
    const response: IEnhancedResponse = await crossFetch(resource, { ...options, method: 'POST' });

    // response.iterator = async function* () {
    //   yield* fromStream(response.body);
    // };

    // response.ndjson = async function* () {
    //   for await (const chunk of parseToJson(response.iterator())) {
    //     if (options.transform) {
    //       yield options.transform(chunk);
    //     } else {
    //       yield chunk;
    //     }
    //   }
    // };
    return response;
  }

  public async add(): Promise<void> {
    throw new Error('Not implemented');
  }
  public async *addAll(data: Buffer | Uint8Array, options: Add): AsyncGenerator<unknown> {
    // const baseUrl = 'https://3000-kelpdigital-oss-rsg3ao46o68.ws-eu67.gitpod.io';
    const url = `${this.baseUrl}/${this.apiPath}/add?stream-channels=true&cid-version=1&progress=false&pin=false`;

    const formData = new FormData();

    formData.append('file', data, 'screenshot-1.jpg');

    const res = await this._post(new URL(url), {
      method: 'POST',
      body: formData as any,
      headers: {
        // ...tokenWithHeader
      }
    });
    console.log(await res.json());

    //https://www.npmjs.com/package/form-data
    for (const file of await res.json()) {
      console.log('in res file', file);
      if (file.hash !== undefined) {
        yield file;
      }
    }

    return this.addAll;
  }
}

/**
 * Create HTTP Client instance
 * @param options -
 * @returns
 * @public
 */
export async function createHttpClient(options?: unknown): Promise<Client> {
  return new Client(options);
}
