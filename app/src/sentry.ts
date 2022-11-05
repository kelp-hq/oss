import * as Sentry from '@sentry/browser';
import { BrowserTracing } from '@sentry/tracing';

import { dev } from '$app/environment';

/**
 * Init the sentry
 * @returns
 */
export function initSentry(): void {
  if (dev) {
    return;
  }
  Sentry.init({
    dsn: 'https://ba964ec849ea4cea8842beca7a2ababf@sentry.anagolay.network/20',
    integrations: [new BrowserTracing()],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0
  });
}
