import add from './add';
import { createHttp } from './http';
import { Add } from './interfaces/add';

/**
 * Default api url `'http://127.0.0.1:5001/api/v0'`
 * @public
 */
export const defaultApiUrl: string = 'http://127.0.0.1:5001/api/v0';

/**
 * @public
 */
export interface IHttpClient {
  url: string;
}
/**
 * @public
 */
export interface IClientHttpIpfs {
  add: (options: Add) => {};
}

/**
 * Create Fetch instance for IPFS
 * @param options -
 * @returns
 * @public
 */
export async function create(options: IHttpClient): Promise<IClientHttpIpfs> {
  const client = createHttp(options);
  return {
    add: (options) => add(client, options)
  };
}
