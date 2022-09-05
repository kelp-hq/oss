import { Command } from 'commander';
import { CID, IPFSHTTPClient } from 'ipfs-http-client';
import { compose, split, uniq } from 'ramda';

import { createIPFSConnection } from '../ipfs';

export default async function createSubCommand(): Promise<Command> {
  // eslint-disable-next-line @typescript-eslint/typedef
  const cmd = new Command('pin');
  cmd
    .description(`Add or remove pin`)
    .argument('[cids]', `IPFS cid or cids comma separated without space`, (cids: string) => {
      return compose(parseCids, split(','))(cids);
    })
    .option('--rm', 'remove the pin', false)
    .action(getAction);
  return cmd;
}

interface IPinAction {
  rm: boolean;
}
/**
 * Add or remove the pin for a given cid
 * @param cids -
 * @param options -
 */
async function getAction(cids: CID[], options: IPinAction): Promise<void> {
  const { rm } = options;

  const ipfs: IPFSHTTPClient = createIPFSConnection();

  const res: CID[] = [];

  if (rm) {
    // stupid ipfs doesn't get its own interfaces
    for await (const i of ipfs.pin.rmAll(cids as unknown as never)) {
      res.push(i);
      console.log('Unpinned cids', res);
    }
  } else {
    // this means we will add the pin
    for await (const i of ipfs.pin.addAll(cids)) {
      res.push(i);
      console.log('Pinned cids', res);
    }
  }
}

/**
 * Parse the argument string making the list unique and trim the items
 * @param cids -
 * @returns the Unique list of Cid instances
 */
function parseCids(cids: string[]): CID[] {
  return uniq(cids).map((c) => CID.parse(c.trim()));
}
