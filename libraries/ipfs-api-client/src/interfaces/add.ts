/**
 * Options for ADD endpoint
 * @public
 */

import { IAddProgressFn, IBaseSearchParams } from './base';

export interface IAddReturnFile {
  Bytes: number;
  Name: string;
  Hash?: string;
  Size?: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface IAddOptions extends IBaseSearchParams {
  /**
   * Chunking algorithm, size-[bytes], rabin-[min]-[avg]-[max] or buzhash.
   * Default: size-262144. Required: no.
   */
  chunker?: string;

  /**
   * CID version. Defaults to 0 unless an option that depends on CIDv1 is
   * passed.
   */
  cidVersion?: number;

  /**
   * Check the filestore for pre-existing blocks. (experimental). Required: no.
   */
  fscache?: boolean;

  /**
   * Hash function to use. Implies CIDv1 if not sha2-256. (experimental).
   * Default: sha2-256. Required: no.
   */
  hash?: string;

  /**
   * Inline small blocks into CIDs. (experimental). Required: no.
   */
  inline?: boolean;

  /**
   * Maximum block size to inline. (experimental). Default: 32. Required: no.
   */
  inlineLimit?: number;

  /**
   * Add the file using filestore. Implies raw-leaves. (experimental). Required:
   * no.
   */
  nocopy?: boolean;

  /**
   * Only chunk and hash - do not write to disk. Required: no.
   */
  onlyHash?: boolean;

  /**
   * Pin this object when adding. Default: true. Required: no.
   */
  pin?: boolean;

  /**
   * Stream progress data. This can be both boolean and a function. In case of a function check {@link IAddProgressFn}
   * 
   * Example:
   * ```ts
    let totalTransferred = 0 
    function progress (bytes, path)  {
      console.log('Transferred %s for %s', bytes, path);
      // it's already cumulative, this is the way to get the TOTAL
      totalTransferred = bytes;
    }
  * ```
   */
  progress?: boolean | IAddProgressFn;

  /**
   * Write minimal output. Required: no.
   */
  quiet?: boolean;

  /**
   * Write only final hash. Required: no.
   */
  quieter?: boolean;

  /**
   * Use raw blocks for leaf nodes. Required: no.
   */
  rawLeaves?: boolean;

  /**
   * Write no output. Required: no.
   */
  silent?: boolean;

  /**
   * Use trickle-dag format for dag generation. Required: no.
   */
  trickle?: boolean;

  /**
   * Wrap files with a directory object. Required: no.
   */
  wrapWithDirectory?: boolean;
}
