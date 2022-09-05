import { Command } from 'commander';

export default async function createSubCommand(): Promise<Command> {
  // eslint-disable-next-line @typescript-eslint/typedef
  const cmd = new Command('get');
  cmd
    .description(`Upload file or directory.`)
    .argument('<ipfsPath>', `Download IPFS objects`)

    .action(getAction);
  return cmd;
}

/**
 * Upload command. works only with `ipfs.add` and `ipfs.addAll`
 * @param pathOrFile -
 */
async function getAction(pathOrFile: string): Promise<void> {
  // console.log('isTTY', process.stdout.isTTY);
  console.log(pathOrFile);

  throw new Error('Not implemented yet');
}
