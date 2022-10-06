import { IHttpInstance } from '../http';
import { Add } from '../interfaces/add';

/**
 *
 * @param clientInstance -
 * @param opts -
 * @returns
 * @public
 */
export default async function add(clientInstance: IHttpInstance, opts: Add): Promise<string> {
  console.log('add', opts);
  await clientInstance.post(clientInstance.url, {});
  return '';
}
