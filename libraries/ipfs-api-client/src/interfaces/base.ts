export const defaultBaseSearchParams: IBaseSearchParams = {
  streamChannels: true
};

/**
 * The progress function in case of the stream. 
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
  *
*/
export interface IAddProgressFn {
  (totalBytesTransferred: number, path?: string): void;
}

export interface IBaseSearchParams {
  /**
   * This should be added as a default state
   */
  streamChannels?: boolean;
}
