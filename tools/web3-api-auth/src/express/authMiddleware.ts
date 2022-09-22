import { hexToString } from '@polkadot/util';
import { NextFunction, Request, Response } from 'express';
import { isNil, map, split, trim } from 'ramda';

import { IApiKeyStructure, validateApiKey } from '../strategies/apiKey';
import { ISubstrateDecodedStructure, validateSubstrate } from '../strategies/substrate';

/**
 * @public
 */
export enum IAuthStrategy {
  'apiKey' = 'apiKey',
  'substrate' = 'sub'
}
/**
 * @public
 */
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
 * @public
 */
export async function expressWeb3AuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authorization = req.get('authorization');
  if (isNil(authorization)) {
    return next('Authorization header is empty. That cannot be.');
  }
  // ignore the Bearer
  const [, token] = map(trim, split(' ', authorization));

  // our token is always in the 0x hex
  const decodedToken = hexToString(token);
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
