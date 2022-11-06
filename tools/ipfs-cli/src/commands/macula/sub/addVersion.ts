import { existsSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

import { Command } from 'commander';
import { AddOptions } from 'ipfs-core-types/dist/src/root';
import { IPFSHTTPClient } from 'ipfs-http-client';
import kleur from 'kleur';
import { find, propEq } from 'ramda';

import { createIPFSConnection, uploadViaAddAll } from '../../../ipfs';
import { addVersionApi } from '../../../maculaApi';
import { IAddAction } from '../../add';
import { cliEnvs } from '../../envs';
import { IMaculaConfig } from '../interfaces';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AN_IPFS_API_URL: string = (find(propEq('name', 'AN_IPFS_API_URL'), cliEnvs) as any).defaultValue;

export async function addVersion(): Promise<Command> {
  const cmd = new Command('addVersion');

  cmd
    .description(`Upload a macula directory and add new version.`)
    .argument(
      '<pathOrFile>',
      `Path or file. If the path is not absolute it will be resolved in relative manner from the execution directory. WE DO NOT SUPPORT THE GLOB PATTERNS`
    )
    .option('--pin', 'pin the content', false)
    .option('--progress', 'Show the progress', false)
    .option('--maculaBaseUrl <type>', 'Return only the CID', AN_IPFS_API_URL)
    .action(action);

  return cmd;
}

interface IOptions extends IAddAction {
  maculaBaseUrl: string;
}

async function action(pathOrFile: string, options: IOptions): Promise<void> {
  const { pin, progress } = options;
  const currentPath = resolve(pathOrFile);
  const stats = await stat(currentPath);

  if (!stats.isDirectory()) {
    throw new Error('Files are not supported');
  }

  const maculaJsonPath = resolve(currentPath, 'macula.json');

  if (existsSync(maculaJsonPath)) {
    const maculaJsonStats = await stat(maculaJsonPath);

    if (!maculaJsonStats.isFile()) {
      throw new Error(`macula.json is not a file`);
    }
  } else {
    throw new Error(
      `macula.json doesn't exist. This file must be provided to add a subdomain and a version.`
    );
  }

  // read macula.json
  const { subdomain }: IMaculaConfig = JSON.parse((await readFile(maculaJsonPath)).toString());

  const opts: AddOptions = {
    pin,
    progress: progress || undefined
  };

  const ipfs: IPFSHTTPClient = createIPFSConnection();
  const { cid, pinned, size } = await uploadViaAddAll({ dirPath: currentPath, opts, ipfs });

  await addVersionApi({ ipfsVersionCid: cid.toString(), subdomain: subdomain as string });

  const versionUrl = `https://${cid}.on.macula.link`;
  const subdomainUrl = `https://${subdomain}.macula.link`;

  console.log(`Pinned %s`, kleur.blue(`${pinned}`));
  console.log(`Size %s bytes`, kleur.blue(size));
  console.log(`Version is available on %s`, kleur.blue(versionUrl));
  console.log(`Subdomain is available on %s`, kleur.green(subdomainUrl));
}
