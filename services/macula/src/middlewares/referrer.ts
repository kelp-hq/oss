import { NextFunction, Request, Response } from 'express';
import { isNil } from 'ramda';

import { forwardedHostAllowed, referrerAllowed } from '../plugins/ipfsApi/utils';
import { log } from '../utils/logger';

/**
 * Allow or disallow referrer.
 *
 * @remarks
 *
 * DO NOT USE THIS FOR NOW
 *
 *  This shouln't be only way to restrict access. maybe CORS can play that role?
 * https://developer.mozilla.org/en-US/docs/Web/Security/Referer_header:_privacy_and_security_concerns
 *
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer
 *
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
 *
 * @param req -
 * @param res -
 * @param next -
 */

export async function referer(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { headers } = req;
  if (
    !isNil(headers['x-forwarded-host'] && forwardedHostAllowed(headers['x-forwarded-host'] as string)) ||
    (!isNil(headers.referer) && referrerAllowed(headers.referer))
  ) {
    log.trace('access OK for %s', headers.referer || headers['x-forwarded-host']);
    next();
  } else {
    next(`Referrer not allowed ${headers.referer}`);
  }
}
