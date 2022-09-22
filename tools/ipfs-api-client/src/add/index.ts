import { IHttpInstance } from '../http';
import { Add } from '../interfaces/add';

export default async function add(clientInstance: IHttpInstance, opts: Add): Promise<string> {
  console.log('add', opts);
  await clientInstance.post(clientInstance.url, {});
  return '';
}
