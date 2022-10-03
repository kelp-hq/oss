import { isTrue } from '@anagolay/utils';
import { NextFunction, Request, Response } from 'express';
import { includes, isEmpty, isNil } from 'ramda';

import { forwardedHostAllowed, referrerAllowed } from '../plugins/ipfsApi/utils';
import { getEnv } from '../utils/env';

export function apiKeyMiddleware(request: Request, reply: Response, done: NextFunction): void {
  const ENABLE_API_KEY_SUPPORT = getEnv('ENABLE_API_KEY_SUPPORT', false);
  const { headers, url } = request;
  console.log('api enabled %s', ENABLE_API_KEY_SUPPORT, headers);
  if (
    !isNil(headers['x-forwarded-host'] && forwardedHostAllowed(headers['x-forwarded-host'] as string)) ||
    (!isNil(headers.referer) && referrerAllowed(headers.referer))
  ) {
    console.debug('access OK for %s', headers.referer || headers['x-forwarded-host']);
  } else {
    if (
      !isNil(ENABLE_API_KEY_SUPPORT) &&
      !isEmpty(ENABLE_API_KEY_SUPPORT) &&
      isTrue(ENABLE_API_KEY_SUPPORT)
    ) {
      const allowedApiKeys = getEnv('ALLOWED_API_KEYS', '[]');

      const skipVerification: string[] = ['/healthcheck'];

      if (!includes(url)(skipVerification)) {
        const apiKeyFromHeader = headers['x-api-key'];

        if (isNil(apiKeyFromHeader) || isEmpty(apiKeyFromHeader)) {
          throw new Error('Did you forget the API key? Set the `x-api-key` header with the correct value.');
        }

        if (!includes(apiKeyFromHeader, allowedApiKeys)) {
          reply.status(401).send(`Your API KEY is not allowed!`);
        }
      }
    } else {
      console.warn('API SUPPORT IS DISABLED, BE CAREFUL NOT TO EXPOSE THIS TO THE PUBLIC!');
    }
  }
  done();
}
