import { NextFunction, Request, Response } from 'express';
import { isNil, map, split, trim } from 'ramda';

import { decode } from '../utils/base64url';
import { IApiKeyStructure, validate as validateApiKey } from './strategies/apiKey';
import { ISubstrateDecodedStructure, validate as validateSubstrate } from './strategies/substrate';

export enum IAuthStrategy {
  'apiKey' = 'apiKey',
  'substrate' = 'sub'
}
export interface IBaseStrategy<T> {
  /**
   * resolving strategy
   */
  strategy: IAuthStrategy;
  /**
   * What you send
   */
  payload: T;
  /**
   * Signature. How you obtain this depends on the strategy
   */
  sig?: string;
}

/**
 * Authentication Middleware.
 * @param req - Express Request
 * @param res - Express Response
 * @param next - Express Next function
 */
export async function auth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authorization = req.get('authorization');
  if (isNil(authorization)) {
    return next('Authorization header is empty. That cannot be.');
  }

  const [, token] = map(trim, split(' ', authorization));
  const decodedToken = decode(token);
  const parsedToken = JSON.parse(decodedToken);

  switch (parsedToken.strategy) {
    default:
    case 'apiKey':
      req.user = validateApiKey(parsedToken as IApiKeyStructure);
      break;
    case 'sub':
      req.user = validateSubstrate(parsedToken as ISubstrateDecodedStructure);
      break;
  }

  next();
}
