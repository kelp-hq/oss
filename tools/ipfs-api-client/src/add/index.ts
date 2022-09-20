import { AxiosError } from 'axios';
import { isNil } from 'ramda';

import { IGenericIpfsOptions } from '../client';

export interface IAddOptions extends IGenericIpfsOptions {
  content: Uint8Array;
  // qs?: Add;
  qs?: any;
}

/**
 * Add file to the IFS (immutable file system)
 * @param options - {@link IAddOptions}
 */
export async function add(options: IAddOptions): Promise<void> {
  console.log('options', options);
  const { ipfs, content, qs } = options;

  const searchParams = new URLSearchParams();
  if (!isNil(qs)) {
    Object.keys(qs).map((k) => {
      console.log('k', k);

      // searchParams.searchParams.set(k, qs[k] as any);
    });
  }
  searchParams.set('stream-channels', 'true');
  searchParams.set('progress', 'true');
  console.log('ser', searchParams.toString());
  try {
    const response = await ipfs.postForm(`add?${searchParams.toString()}`, content, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      responseType: 'stream'
    });

    const stream = response.data;

    stream.on('data', (data: any) => {
      console.log('stream on ', data);
    });

    stream.on('end', () => {
      console.log('stream done');
    });
  } catch (error) {
    const e = error as AxiosError;
    const message = e.message;
    const status = e.response?.status as number;
    console.error('Request failed with status %s', status, message);
  }
}
