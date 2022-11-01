import { NextFunction, Request, Response } from 'express';
import { isEmpty, isNil } from 'ramda';
import { generateSlug } from 'random-word-slugs';

export interface IAddVersionApi {
  subdomain: string;
  ipfsVersionCid: string;
}

/**
 * A middleware to validate the body structure
 * @param req -
 * @param res -
 * @param next -
 * @returns
 */
export function validateBodyForAddApi(
  req: Request<never, never, IAddVersionApi>,
  res: Response,
  next: NextFunction
): void {
  const { ipfsVersionCid: ipfsCid } = req.body;
  if (isNil(ipfsCid) || isNil(ipfsCid)) {
    return next('ipfsCid must be present in the body!');
  }

  // if (isNil(subdomain) || isNil(subdomain)) {
  //   return next('subdomain must be present in the body!');
  // }

  return next();
}
/**
 * A middleware to validate the body structure
 * @param req -
 * @param res -
 * @param next -
 * @returns
 */
export function validateBodyForAddVersion(
  req: Request<never, never, IAddVersionApi>,
  res: Response,
  next: NextFunction
): void {
  const { ipfsVersionCid, subdomain } = req.body;
  if (isNil(ipfsVersionCid) || isNil(ipfsVersionCid)) {
    return next('ipfsVersionCid must be present in the body!');
  }

  if (isNil(subdomain) || isEmpty(subdomain)) {
    console.log('subdomain is not present in the body, generating slug');
    req.body.subdomain = generateSlug();
  }

  return next();
}
