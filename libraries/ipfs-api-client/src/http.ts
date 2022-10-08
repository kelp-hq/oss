import type { Readable as NodeReadableStream } from 'stream';

/**
 * This interface implements ONLY `POST` method, because ipfs endpoints are rpc based. The implementation follows the https://developer.mozilla.org/en-US/docs/Web/API/fetch in both naming and interfaces
 * @public
 */
export interface IHttpInstance {
  /**
   * Post method for the fetch.
   * @param resource - the full url with the path
   * @param options -
   */
  post(resource: string | Request, options: RequestInit): Promise<Response>;
}

interface IProgressStatus {
  total: number;
  loaded: number;
  lengthComputable: boolean;
}

export interface IProgressFn {
  (status: IProgressStatus): void;
}

type Override<T, R> = Omit<T, keyof R> & R;

export type FetchOptions = Override<
  RequestInit,
  {
    /**
     * Extended body with support for node readable stream
     */
    body?: BodyInit | null | NodeReadableStream;
    /**
     * Amount of time until request should timeout in ms.
     */
    timeout?: number;
    /**
     * URL search param.
     */
    searchParams?: URLSearchParams;
    /**
     * Can be passed to track upload progress.
     * Note that if this option in passed underlying request will be performed using `XMLHttpRequest` and response will not be streamed.
     */
    onUploadProgress?: IProgressFn;
    /**
     * Can be passed to track download progress.
     */
    onDownloadProgress?: IProgressFn;
    overrideMimeType?: string;
  }
>;

export interface IHTTPOptions extends FetchOptions {
  json?: any;
  /**
   * The base URL to use in case url is a relative URL
   */
  base?: string;
  /**
   * Throw not ok responses as Errors
   */
  throwHttpErrors?: boolean;
  /**
   * Transform search params
   */
  transformSearchParams?: (params: URLSearchParams) => URLSearchParams;
  /**
   * When iterating the response body, transform each chunk with this function.
   */
  transform?: (chunk: any) => any;
  /**
   * Handle errors
   */
  handleError?: (rsp: Response) => Promise<void>;
}
