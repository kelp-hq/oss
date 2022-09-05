import { includes } from 'ramda';

import { getEnv } from '../../utils/env';

/**
 * Function that returns true or false depending is the referrer allowed to access the resource
 * @remarks - REFACTOR
 * @param referrer - A referrer extracted from the `request.headers.referer`
 */
export function referrerAllowed(referrer: string): boolean {
  const allowed = getEnv('ALLOWED_REFERRERS', '[]');

  console.log(`got referrer ${referrer}`);

  const refURl = new URL(referrer);
  return includes('localhost', refURl.hostname) || includes(refURl.hostname, allowed);
}

/**
 * Function that returns true or false depending is the x-forwarded-host allowed to access the resource
 * @remarks - REFACTOR
 * @param xFwdHost - A x-forwarded-host extracted from the `request.headers.x-forwarded-host`
 */
export function forwardedHostAllowed(xFwdHost: string): boolean {
  const allowed = getEnv('ALLOWED_REFERRERS', '[]');

  console.log(`got referrer as x-forwarded-host ${xFwdHost}`);

  const allParts = xFwdHost.split('.');
  const [, ...parts] = allParts;

  return includes('localhost', xFwdHost) || includes(parts.join('.'), allowed);
}
