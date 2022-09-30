/* eslint-disable require-atomic-updates */
import { NextFunction, Request, Response } from 'express';
import { isNil, map, split, trim } from 'ramda';

import { BaseStrategy } from '../strategies/BaseStrategy';
import { SubstrateStrategy } from '../strategies/substrate';

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

  const {
    parsed: { strategy }
  } = await BaseStrategy.parseToken(token);

  switch (strategy) {
    case 'sub':
      const t = new SubstrateStrategy();
      const user = await t.validate(token);
      req.user = user;
      break;
    default:
      console.log(`The strategy is not implemented {${strategy}}, continue with next middleware ...`);
  }

  next();
}
