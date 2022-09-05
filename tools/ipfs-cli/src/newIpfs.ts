// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { printf } from 'fast-printf';
// import { readFile } from 'fs/promises';
// import { AddOptions, AddResult } from 'ipfs-core-types/root';
// import { CID, create, globSource, IPFSHTTPClient, Options } from 'ipfs-http-client';
// import itAll from 'it-all';
// import { isEmpty, isNil } from 'ramda';
// /**
//  * Cached IPFS client
//  * @internal
//  */
// export let ipfsClient: IPFSHTTPClient;

// /**
//  * @internal
//  */
// export const ipfsOptions: AddOptions = {
//   cidVersion: 1,
//   // wrapWithDirectory: false, // this is important when adding with the httpClient. it behaves differently than the cli where cli will wrap it in the name of the dir, this doesn't do that
//   // hashAlg: "blake2b-256",
//   // progress: (bytes: number, path?: string) => {
//   //   log.info(`${path}`);
//   // },
//   // fileImportConcurrency: 1,
//   pin: false
// };

// /**
//  * @internal
//  */
// export interface IClientConnectionOptions {
//   apiKey?: string;
//   ipfsOptions: Options;
// }

// /**
//  * IPFS instance pointing to `@anagolay/ipfs-auth-proxy`
//  * @public
//  * @returns
//  */
// export function createIPFSConnection(options: IClientConnectionOptions): IPFSHTTPClient {
//   if (ipfsClient) {
//     return ipfsClient;
//   }

//   const { apiKey, ipfsOptions } = options;

//   const headers: Record<string, string> = ipfsOptions.headers;
//   if (!isNil(apiKey) && !isEmpty(apiKey)) {
//     headers['x-api-key'] = apiKey;
//     headers.authentication = `Bearer ${apiKey}`;
//   }

//   const opts: Options = {
//     ...ipfsOptions, // this is intentional. we merge them above
//     headers
//   };

//   ipfsClient = create(opts);

//   return ipfsClient;
// }

// /**
//  * @internal
//  */
// interface IAddedFile {
//   cid: CID | string;
//   path: string;
//   size: number;
// }

// /**
//  * Response type for the User
//  * @internal
//  */
// export interface IIpfsResponse extends IAddedFile {
//   url: string;
//   pinned?: boolean;
// }

// /**
//  * @internal
//  */
// export interface IUploadParams {
//   /**
//    * Options to pass to the IPFS method
//    */
//   opts: AddOptions;
//   /**
//    * IPFS instance
//    */
//   ipfs: IPFSHTTPClient;
// }
// /**
//  * @internal
//  */
// export interface IUploadParamsSingleFile extends IUploadParams {
//   /**
//    * IPFS path when storing the data
//    */
//   ipfsPath: string;
//   /**
//    * Local file path
//    */
//   filePathOrBytes: string | Buffer | Uint8Array;
// }

// /**
//  * Upload a single file with or without the path and get all the CIDs for the full path
//  * @param params -
//  * @example
//  * Return when set the path to
//  * ```js
//   [
//     {
//       path: 'mm/mypath-image.png-200__h-100.jpeg',
//       cid: CID(bafkreibd3egwnizkodakqmyhtmiogv6v5lgedffcdt5xaw65f5z6vk2ike),
//       size: 3346
//     },
//     {
//       path: 'mm',
//       cid: CID(bafybeihbigfbr66o3bk24ilmeuginl4knrynuf3szxr5ozrvnrolsfsyri),
//       size: 3473
//     },
//     {
//       path: '',
//       cid: CID(bafybeibjdl5eueztmd3tlplpmjnh4nebjmbqplegyxshpm727xaota4ibu),
//       size: 3524
//     }
//   ]
// ```
//  *  @public
//  */
// export async function addOneWithPath(params: IUploadParamsSingleFile): Promise<AddResult[]> {
//   const { filePathOrBytes, ipfs, ipfsPath, opts } = params;

//   const content = typeof filePathOrBytes === 'string' ? await readFile(filePathOrBytes) : filePathOrBytes;
//   return await itAll(
//     ipfs.addAll(
//       [
//         {
//           path: ipfsPath,
//           content
//         }
//       ],
//       {
//         ...ipfsOptions,
//         ...opts
//       }
//     )
//   );
// }

// /**
//  * Upload file to IFPS. You must set `filePath` or `fileBytes`
//  * @param params - the {@link IUploadParamsSingleFile}
//  * @param formatLink - Using the string replacement how you want to see the link on a gateway, default is `'http://localhost:8080/ipfs/%s'` where `%s` will be replaced with teh CID
//  * @public
//  */
// export async function uploadViaAdd(
//   params: IUploadParamsSingleFile,
//   formatLink: string = 'http://localhost:8080/ipfs/%s'
// ): Promise<IIpfsResponse> {
//   const { filePathOrBytes, ipfs, ipfsPath, opts } = params;

//   const content = typeof filePathOrBytes === 'string' ? await readFile(filePathOrBytes) : filePathOrBytes;

//   const ipfsFile: AddResult = await ipfs.add(
//     {
//       path: ipfsPath,
//       content
//     },
//     {
//       ...ipfsOptions,
//       ...opts
//     }
//   );

//   console.log('ipfsFile', ipfsFile, {
//     ...ipfsOptions,
//     ...opts
//   });

//   const prettyGatewayUrl = printf(formatLink, ipfsFile.cid);

//   const addedFile = {
//     cid: ipfsFile.cid.toString(),
//     path: ipfsFile.path,
//     size: ipfsFile.size
//   };

//   const returnObject: IIpfsResponse = {
//     ...addedFile,
//     pinned: opts.pin,
//     url: prettyGatewayUrl
//   };
//   return returnObject;
// }

// /**
//  * @internal
//  */
// export interface IUploadParamsDirectory extends IUploadParams {
//   /**
//    * Local fs path of a directory or a file
//    */
//   dirPath: string;
//   /**
//    * IPFS path when storing the data
//    */
//   ipfsPath: string;
// }

// /**
//  * Upload to IPFS via ipfs.addAll, passing options will overwrite the default ones
//  * @param params -
//  * @param formatLink - Using the string replacement how you want to see the link on a gateway, default is `'http://localhost:8080/ipfs/%s'` where `%s` will be replaced with teh CID
//  * @public
//  */
// export async function uploadViaAddAll(
//   params: IUploadParamsDirectory,
//   formatLink: string = 'http://localhost:8080/ipfs/%s'
// ): Promise<IIpfsResponse> {
//   const { dirPath, ipfs, opts } = params;

//   const addedFiles: IAddedFile[] = await itAll(
//     ipfs.addAll(globSource(dirPath, '**/*', { hidden: true }), {
//       ...ipfsOptions,
//       ...opts
//     })
//   );

//   const lastCid = addedFiles[addedFiles.length - 1];

//   if (isEmpty(addedFiles)) {
//     throw new Error(`Nothing added`);
//   }

//   if (!isNil(lastCid) && !isEmpty(lastCid) && lastCid.path !== '') {
//     const err = `Last Cid is not the root: ${lastCid.path.trim()}`;
//     // sentry.captureException(err)
//     throw new Error(err);
//   }

//   const prettyGatewayUrl = printf(formatLink, lastCid.cid);

//   const returnObject: IIpfsResponse = {
//     cid: lastCid.cid.toString(),
//     path: lastCid.path.trim(),
//     size: lastCid.size,
//     pinned: opts.pin,
//     url: prettyGatewayUrl
//   };

//   return returnObject;
// }
