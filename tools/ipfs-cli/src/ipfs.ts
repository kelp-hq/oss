/* eslint-disable @typescript-eslint/no-explicit-any */
import { readFile } from 'fs/promises';
import { AddOptions } from 'ipfs-core-types/root';
import { CID, create, globSource, IPFSHTTPClient, Options } from 'ipfs-http-client';
import itAll from 'it-all';
import { isEmpty, isNil } from 'ramda';

import { sentry } from './start';

export let ipfsClient: IPFSHTTPClient;

let ipfsApiUrl: string = 'http://localhost:5001/api/v0';

const { AN_IPFS_GATEWAY_HOSTNAME, AN_IPFS_PIN, AN_IPFS_API_KEY, AN_IPFS_API_URL, AN_IPFS_AUTH_METHOD } =
  process.env;

let pin: boolean = false;

if (!isNil(AN_IPFS_PIN) && !isEmpty(AN_IPFS_PIN)) {
  pin = !!AN_IPFS_PIN;
}

export const ipfsOptions: AddOptions = {
  cidVersion: 1,
  wrapWithDirectory: true, // this is important when adding with the httpClient. it behaves differently than the cli where cli will wrap it in the name of the dir, this doesn't do that
  // hashAlg: "blake2b-256",
  // progress: (bytes: number, path?: string) => {
  //   log.info(`${path}`);
  // },
  // fileImportConcurrency: 1,
  pin
};

export interface IClientConnectionOptions {
  useLocalIpfs: boolean;
  ipfsOptions: Options;
}

/**
 * IPFS instance pointing to `@anagolay/ipfs-auth-proxy`
 * @returns
 */
export function createIPFSConnection(
  options: IClientConnectionOptions = { useLocalIpfs: false, ipfsOptions: {} }
): IPFSHTTPClient {
  if (ipfsClient) {
    return ipfsClient;
  }

  if (!options.useLocalIpfs) {
    if (!isNil(AN_IPFS_API_URL) && !isEmpty(AN_IPFS_API_URL)) {
      ipfsApiUrl = AN_IPFS_API_URL;
    }
  }

  const headers: Record<string, string> = {};

  if (isNil(AN_IPFS_AUTH_METHOD) || isEmpty(AN_IPFS_AUTH_METHOD) || AN_IPFS_AUTH_METHOD === 'apiKey') {
    if (isNil(AN_IPFS_API_KEY) || isEmpty(AN_IPFS_API_KEY)) {
      throw new Error(`AN_IPFS_API_KEY must be set!!!`);
    }

    headers['x-api-key'] = AN_IPFS_API_KEY;
  } else if (AN_IPFS_AUTH_METHOD === 'bearer') {
    if (isNil(AN_IPFS_API_KEY) || isEmpty(AN_IPFS_API_KEY)) {
      throw new Error(`AN_IPFS_API_KEY must be set properly for current Bearer auth method.`);
    }

    headers.Authentication = `Bearer ${AN_IPFS_API_KEY}`;
  } else {
    throw new Error(`Unsupported auth method, ${AN_IPFS_AUTH_METHOD}`);
  }

  const opts: Options = {
    url: ipfsApiUrl,
    headers,
    ...options.ipfsOptions
  };

  ipfsClient = create(opts);

  return ipfsClient;
}

interface IAddedFile {
  cid: CID | string;
  path: string;
  size: number;
}

/**
 * Response type for the User
 */
export interface IIpfsResponse extends IAddedFile {
  url: string;
  pinned: boolean;
}

export interface IUploadParams {
  /**
   * Options to pass to the IPFS method
   */
  opts: AddOptions;
  /**
   * IPFS instance
   */
  ipfs: IPFSHTTPClient;
}
export interface IUploadParamsSingleFile extends IUploadParams {
  /**
   * IPFS path when storing the data
   */
  ipfsPath: string;
  /**
   * Local file path
   */
  filePath: string;
}

/**
 * Upload the file
 * @param params - {@link IUploadParamsSingleFile}
 * @returns
 */
export async function uploadViaAdd(params: IUploadParamsSingleFile): Promise<IIpfsResponse> {
  const { filePath, ipfs, ipfsPath, opts } = params;
  console.log('uploadViaAdd');
  const ipfsFile = await ipfs.add(
    {
      path: ipfsPath,
      content: await readFile(filePath)
    },
    {
      ...ipfsOptions, // defaults to this to be true, but we don't need it, we want to have direct access to it.
      wrapWithDirectory: false,
      // this makes the leaves to be dag-pg instead of the raw. What is the actual benefit i really don't know
      rawLeaves: false,
      ...opts
    }
  );

  let url = '';

  if (!isNil(AN_IPFS_GATEWAY_HOSTNAME) && !isEmpty(AN_IPFS_GATEWAY_HOSTNAME)) {
    url = `https://${AN_IPFS_GATEWAY_HOSTNAME}/ipfs/${ipfsFile.cid}`;
  } else {
    const partsOfApi = new URL(ipfsApiUrl);
    url = `https://${partsOfApi.hostname}/ipfs/${ipfsFile.cid}`;
  }

  const addedFile = {
    cid: ipfsFile.cid.toString(),
    path: ipfsFile.path,
    size: ipfsFile.size
  };

  const returnObject: IIpfsResponse = {
    ...addedFile,
    pinned: opts.pin as boolean,
    url
  };
  return returnObject;
}

export interface IUploadParamsDirectory extends IUploadParams {
  /**
   * Local fs path of a directory or a file
   */
  dirPath: string;
}

/**
 * Upload to IPFS via ipfs.addAll, passing options will overwrite the default ones
 * @param params -
 */
export async function uploadViaAddAll(params: IUploadParamsDirectory): Promise<IIpfsResponse> {
  const { dirPath, ipfs, opts } = params;

  const mainTx = sentry.getCurrentHub()?.getScope()?.getTransaction();

  const tx = mainTx?.startChild({
    op: 'uploadViaAddAll',
    description: 'Upload directory to ipfs via addAll'
  });

  // const addedFiles: IAddedFile[] = [];

  const addedFiles: IAddedFile[] = await itAll(
    ipfs.addAll(globSource(dirPath, '**/*', { hidden: true }), {
      ...ipfsOptions,
      ...opts
    })
  );

  const lastCid = addedFiles[addedFiles.length - 1];

  if (isEmpty(addedFiles)) {
    throw new Error(`Nothing added`);
  }

  if (!isNil(lastCid) && !isEmpty(lastCid) && lastCid.path !== '') {
    const err = `Last Cid is not the root: ${lastCid.path.trim()}`;
    // sentry.captureException(err)
    throw new Error(err);
  }

  // URL that we will use to show to a user
  let url = '';

  if (!isNil(AN_IPFS_GATEWAY_HOSTNAME) && !isEmpty(AN_IPFS_GATEWAY_HOSTNAME)) {
    url = `https://${AN_IPFS_GATEWAY_HOSTNAME}/ipfs/${lastCid.cid}`;
  } else {
    const partsOfApi = new URL(ipfsApiUrl);
    url = `https://${partsOfApi.hostname}/ipfs/${lastCid.cid}`;
  }

  const returnObject: IIpfsResponse = {
    cid: lastCid.cid.toString(),
    path: lastCid.path.trim(),
    size: lastCid.size,
    pinned: opts.pin as boolean,
    url
  };

  tx?.finish();

  return returnObject;
}
