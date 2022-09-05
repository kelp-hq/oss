import { getEnv } from './utils/env';
/**
 * IPFS api base url, this cannot contain `/api/v0` because it's proxyed
 */
// export const ipfsApiURL: Multiaddr = multiaddr(getEnv('IPFS_API_URL', '/ip4/127.0.0.1/tcp/5001'));
export const ipfsApiURL: string = getEnv('IPFS_API_URL', 'http://127.0.0.1:5001');

/**
 * IPFS local cache. We store renditions here
 */
export const ipfsCacheApiURL: string = getEnv('IPFS_CACHE_API_URL', 'http://127.0.0.1:5001/api/v0');

/**
 * When user wants to `replicate` the rendition we will process this
 * @remarks - make this more event Driven with the Workers and Job Q
 */
export const ipfsDefaultReplicationNodes: string[] = [];

/**
 * IPFS gateway FQDN
 */
export const ipfsGateway: string = getEnv('IPFS_GATEWAY_URL', 'http://127.0.0.1:8080');

/**
 * On which port the server is listening
 */
export const port: number = getEnv('PORT', 3000);

/**
 * Application version
 */
export const version: string = '0.7.0';

/**
 * Support these formats.
 */
export const sharpSupportedImageFormats: string[] = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'jp2',
  'tiff',
  'avif',
  'heif',
  'raw'
];

/**
 * A fair amount of file-types are detectable within this range
 * @remarks from https://github.com/sindresorhus/file-type/blob/16/core.js#L11
 */
export const minimumBytes: number = 4100;
