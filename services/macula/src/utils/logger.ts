/* eslint-disable @rushstack/typedef-var */
import { createLogger, Logger } from '@anagolay/utils';
import { equals } from 'ramda';

import { getEnv } from './env';

const logLevel = getEnv('MACULA_LOG_LEVEL', 'trace');

/**
 * Enables the pino-pretty for the dev and sets the `trace`
 */
const pinoPrettyTransport = equals('dev', getEnv('KELP_MACULA_ENV', 'dev'))
  ? {
      transport: {
        targets: [
          {
            target: 'pino-pretty',
            options: { destination: 1, colorize: true, sync: true, ignore: 'time,name,hostname' },
            level: logLevel
          }
        ]
      }
    }
  : {};

/**
 * Pino Logger
 * @internal
 */
export const log: Logger = createLogger({
  ...pinoPrettyTransport,
  name: 'maculaServer',
  level: logLevel
});
