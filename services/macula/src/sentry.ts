import * as Sentry from '@sentry/node';
import { Integrations } from '@sentry/tracing';
import { type Express } from 'express';

import { getEnv } from './utils/env';

/**
 * Sentry instance
 * @internal
 */
// eslint-disable-next-line @rushstack/typedef-var
export const sentry = Sentry;

export function initSentry(app: Express): void {
  /// init the Sentry
  Sentry.init({
    // debug: true,
    dsn: getEnv(
      'KELP_MACULA_SENTRY_DSN',
      'https://3e18e665af384fd8880250820652ea21@sentry.anagolay.network/17'
    ),
    enabled: true,
    // enabled: getEnv('KELP_MACULA_SENTRY_ENABLE', !!getEnv('KELP_MACULA_SENTRY_DSN', '')),
    environment: getEnv('KELP_MACULA_ENV', 'dev'),
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Integrations.Express({ app })
    ],
    tracesSampleRate: 1.0
  });
}
