import { Command } from 'commander';

export default async function createSubCommand(): Promise<Command> {
  // eslint-disable-next-line @typescript-eslint/typedef
  const cmd = new Command('envs');
  cmd.description(`Show used envs and their defaults`).action(getAction);
  return cmd;
}

/**
 * Show table of the used envs
 */
async function getAction(): Promise<void> {
  const envs = [
    { name: 'AN_IPFS_GATEWAY_HOSTNAME', defaultValue: 'localhost' },
    { name: 'AN_IPFS_API_URL', defaultValue: 'http://localhost:5001/api/v0' },
    { name: 'AN_IPFS_PIN', defaultValue: 'false' },
    { name: 'AN_IPFS_API_KEY', defaultValue: null },
    { name: 'AN_IPFS_AUTH_METHOD', defaultValue: 'apiKey' }
  ];

  console.table(envs);
}
