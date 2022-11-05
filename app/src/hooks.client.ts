/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Sentry from '@sentry/browser';
import type { HandleClientError } from '@sveltejs/kit';

export const handleError: HandleClientError = ({ error, event }: any) => {
  // example integration with https://sentry.io/
  Sentry.captureException(error, { event } as any);

  return {
    message: 'Whoops!',
    code: error.code ?? 'UNKNOWN'
  };
};
