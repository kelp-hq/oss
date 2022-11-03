import { Command } from 'commander';

import { addVersion } from './sub/addVersion';

///node --no-experimental-fetch lib/start.js macula addVersion lib  | jq

/**
 * Add subcommand
 * @returns
 */
export default async function createMainCommand(): Promise<Command> {
  const cmd = new Command('macula');
  cmd.description(`Macula related commands`).addCommand(await addVersion());

  return cmd;
}
