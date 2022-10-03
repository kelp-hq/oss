import { stat } from 'node:fs/promises';
import { basename, resolve } from 'node:path';

import { elapsed_time } from '@anagolay/utils';
import * as Sentry from '@sentry/node';
import { Command } from 'commander';
import { AddOptions } from 'ipfs-core-types/dist/src/root';
import { IPFSHTTPClient } from 'ipfs-http-client';

import { createIPFSConnection, IIpfsResponse, uploadViaAdd, uploadViaAddAll } from '../ipfs';
import { sentry } from '../start';

/**
 * Add subcommand
 * @returns
 */
export default async function createSubCommand(): Promise<Command> {
  const cmd = new Command('add');
  cmd
    .description(`Upload file or directory.`)
    .argument(
      '<pathOrFile>',
      `Path or file. If the path is not absolute it will be resolved in relative manner from the execution directory. WE DO NOT SUPPORT THE GLOB PATTERNS`
    )
    .option(
      '--localIpfs',
      'Shorthand flag to use local ipfs api. Overrides the AN_IPFS_API_URL env variable',
      false
    )
    .option('--pin', 'pin the content', false)
    .option('--progress', 'Show the progress', false)
    .option('--onlyCid', 'Return only the CID', false)
    .action(addAction);
  return cmd;
}

/**
 * Add command options
 * @public
 */
interface IAddAction extends AddOptions {
  pin: boolean;
  onlyCid: boolean;
  localIpfs: boolean;
}

interface IAddActionConsoleFullResponse extends IIpfsResponse {
  /**
   * Total Execution time in milliseconds
   */
  execTime?: number;
}

/**
 * Upload command. works only with `ipfs.add` and `ipfs.addAll`
 * @param pathOrFile -
 * @param options -
 */
async function addAction(pathOrFile: string, options: IAddAction): Promise<void> {
  try {
    const startPerf = process.hrtime();
    const transaction = sentry.startTransaction({
      op: 'command',
      name: 'Add command',
      data: {
        opts: options,
        pathOrFile
      }
    });

    // need to do this in order to get it later on
    sentry.configureScope((scope) => {
      scope.setSpan(transaction);
    });

    const { pin, onlyCid, progress, localIpfs } = options;
    const currentPath = resolve(pathOrFile);
    const stats = await stat(currentPath);

    let res: IAddActionConsoleFullResponse;

    const opts: AddOptions = {
      ...options,
      pin,
      progress: progress || undefined
    };

    const ipfs: IPFSHTTPClient = createIPFSConnection({ useLocalIpfs: localIpfs, ipfsOptions: {} });

    if (stats.isFile()) {
      res = await uploadViaAdd({ ipfs, ipfsPath: basename(currentPath), filePath: currentPath, opts });
    } else if (stats.isDirectory()) {
      res = await uploadViaAddAll({ dirPath: currentPath, opts, ipfs });
    } else {
      throw new Error(`unsupported path, should never happen, details ${stats}`);
    }

    const execTime = elapsed_time(startPerf, true);

    res.execTime = execTime;

    if (onlyCid) {
      console.log(res.cid);
    } else {
      console.log(JSON.stringify(res));
    }

    transaction.setData('execTime', execTime);
    transaction.finish();
  } catch (error) {
    console.error('error', error);
    Sentry.captureException(error);
    process.exit(1);
  }
}
