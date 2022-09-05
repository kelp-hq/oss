#!/usr/bin/env -S node --experimental-modules --experimental-specifier-resolution=node --trace-warnings --no-experimental-fetch

/**
 * Anagolay JS
 * Copyright (C) 2022  Anagolay  Network
 * For Full license read LICENSE file
 * IPFS cli built for the Anagolay use and maybe for the rest of the world
 *
 * @packageDocumentation
 */
import '@sentry/tracing';

import * as Sentry from '@sentry/node';
import { Command } from 'commander';

import addCmd from './commands/add';
import envsCmd from './commands/envs';
import getCmd from './commands/get';
import pinCmd from './commands/pin';

Sentry.init({
  dsn: 'https://d3854544f99349348a7f863a7a6f6260@o1175852.ingest.sentry.io/6545201',
  // environment: getEnv('ENV'),
  tracesSampleRate: 1.0
  // debug: true
});

/**
 * Sentry instance
 * @public
 */
// eslint-disable-next-line @rushstack/typedef-var
export const sentry = Sentry;

/**
 * Main entrypoint for the CLI
 */
async function main(): Promise<void> {
  const cmd = new Command();

  cmd.version('0.7.0').description('Welcome to IPFS cli with security');

  cmd.addCommand(await addCmd());
  cmd.addCommand(await getCmd());
  cmd.addCommand(await envsCmd());
  cmd.addCommand(await pinCmd());

  await cmd.parseAsync(process.argv);
}

main().catch((error) => {
  console.log('main error', error);
  console.error(error);
  Sentry.captureException(error);
});
