/* eslint-disable require-atomic-updates */
import crossFetch from 'cross-fetch';
import FormData from 'form-data';
import { clone, equals, forEach, forEachObjIndexed, is, isEmpty, isNil, mergeAll } from 'ramda';

import { IAddOptions } from './interfaces/add';
import { defaultBaseSearchParams } from './interfaces/base';
import { parseToJson } from './utils/ndjson';
import { toKebabCase } from './utils/toKebabCase';
import { fromStream } from './utils/utils';

/**
 * Enhanced native fetch response
 * @public
 */
export interface IEnhancedResponse extends Response {
  // /**
  //  * Parse the stream ndjson to json
  //  */
  ndjson: () => AsyncGenerator<{ Bytes: number; Name: string; Hash?: string }>;
  iterator: () => AsyncIterable<any>;
}

export interface IEntryData {
  content: Buffer | string | ArrayBufferLike;
  path?: string;
  name?: string;
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

  private async _post(
    resource: string | RequestInfo | URL,
    options?: RequestInit
  ): Promise<IEnhancedResponse> {
    const response = (await crossFetch(resource, { ...options, method: 'POST' })) as IEnhancedResponse;

    response.iterator = async function* () {
      yield* fromStream(response.body);
    };

    response.ndjson = async function* () {
      for await (const chunk of parseToJson(response.iterator())) {
        // if (options.transform) {
        //   yield options.transform(chunk);
        // } else {
        yield chunk;
        // }
      }
    };

    return response;
  }

  /**
   * Take the object and create the search params
   * @param options - Possible URL search params. For now it's like this. in the future might add generic
   * @returns Search Params instance
   */
  private _optionsToSearchParams(url: URL, options: IAddOptions): URL {
    const clonedUrl = clone(url);
    forEachObjIndexed((value, key) => {
      if (is(Number, value)) {
        clonedUrl.searchParams.append(toKebabCase(key), value.toString());
      } else {
        /**
         * The process here can be function or boolean
         */
        if (equals('progress', key)) {
          if (is(Function, value)) {
            clonedUrl.searchParams.append(toKebabCase(key), (!!value).toString());
          } else {
            clonedUrl.searchParams.append(toKebabCase(key), (value as boolean).toString());
          }
        } else {
          clonedUrl.searchParams.append(toKebabCase(key), value as string);
        }
      }
    }, options);
    return clonedUrl;
  }

  public async add(): Promise<void> {
    throw new Error('Not implemented');
  }

  public async *addAll(data: IEntryData[], options: IAddOptions): AsyncGenerator<unknown> {
    // early check for not supported flag
    // if (prop('progress', options)) {
    //   throw new Error(
    //     `The property progress is set to TRUE. Currently this lib doesn't support streams and ndjson response. Set it to FALSE or omit to continue`
    //   );
    // }
    const currentOptions = {} as IAddOptions;

    const formData = new FormData();

    forEach((entryData) => {
      const { content, path } = entryData;
      if (!isNil(path) && !isEmpty(path)) {
        currentOptions.wrapWithDirectory = true;
      }
      formData.append('file', content, path);
    }, data);

    console.log('form data', formData);

    // merge all, If a key exists in more than one object, the value from the last object it exists in will be used.
    // https://ramdajs.com/docs/#mergeAll
    const mergedOptions = mergeAll([currentOptions, defaultBaseSearchParams, options]);
    const url = this._optionsToSearchParams(new URL(`${this._apiPath}/add`, this.baseUrl), {
      ...mergedOptions
    });

    const res = await this._post(url, {
      method: 'POST',
      body: formData as any,
      headers: {
        // ...tokenWithHeader
      }
    });
    // console.log(await res.text());

    for await (const file of res.ndjson()) {
      // this means the transfer is over and we have the CID.
      if (!isNil(file.Hash)) {
        yield file;
      } else if (is(Function, options.progress)) {
        options.progress(file.Bytes || 0, file.Name);
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
