/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Sentry from '@sentry/browser';
import type { HandleClientError } from '@sveltejs/kit';

/** @type {import('@sveltejs/kit').HandleFetch} */
export async function handleFetch({ request, fetch }) {
  console.log('handleFetch', { request, fetch });
  // if (request.url.startsWith('https://api.yourapp.com/')) {
  //   // clone the original request, but change the URL
  //   request = new Request(request.url.replace('https://api.yourapp.com/', 'http://localhost:9999/'), request);
  // }

  return fetch(request);
}

export const handleError: HandleClientError = ({ error, event }: any) => {
  // example integration with https://sentry.io/
  Sentry.captureException(error, { event } as any);
  console.error(error);
  return {
    message: 'Whoops!',
    code: error.code ?? 'UNKNOWN'
  };
};
