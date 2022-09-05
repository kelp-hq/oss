import { NextFunction, Request, Response } from 'express';
import { isNil } from 'ramda';

export interface IAddApi {
  subdomain?: string;
  ipfsCid: string;
}

/**
 * A middleware to validate the body structure
 * @param req -
 * @param res -
 * @param next -
 * @returns
 */
export function validateBodyForAddApi(
  req: Request<never, never, IAddApi>,
  res: Response,
  next: NextFunction
): void {
  const { ipfsCid } = req.body;
  if (isNil(ipfsCid) || isNil(ipfsCid)) {
    return next('ipfsCid must be present in the body!');
  }

  // if (isNil(subdomain) || isNil(subdomain)) {
  //   return next('subdomain must be present in the body!');
  // }

  return next();
}
