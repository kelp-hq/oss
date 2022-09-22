import { hexToU8a, stringToHex } from '@polkadot/util';
import { signatureVerify } from '@polkadot/util-crypto';

import { IAuthStrategy, IBaseStrategy } from '../../express/authMiddleware';
import { encode } from '../../utils/base64url';
import { StrategyValidationError } from '../../utils/errors';

export interface ISubstratePayload {
  /**
   * to which network this account belongs to.
   * @remarks
   * This value will not be modified, it is up to you to add this correctly.
   */
  network: string;
  /**
   * SS58 prefix
   * @remarks
   * Full list here https://github.com/paritytech/ss58-registry/blob/main/ss58-registry.json
   *
   * The validation process will not verify the validity of the prefix
   */
  prefix: number;
  /**
   * Public address in valid SS58 format
   */
  account: string;
  /**
   * TTL or TimeToLive in seconds. This is basically expiration of the token. Fater this time the token is not valid and MUST be rejected.
   *
   * @remarks
   * Use this snippet to add 5 mins to the current date making the token available within 5 minutes
   * ```js
   * const now = new Date();
   * const ttl = now.setMinutes(now.getMinutes() + 5);
   * ```
   */
  ttl: number;
}

export interface ISubstrateDecodedStructure extends IBaseStrategy<ISubstratePayload> {
  strategy: IAuthStrategy.substrate;
  sig: string;
}

export interface ISubstrateEncodedStructure extends IBaseStrategy<string> {
  strategy: IAuthStrategy.substrate;
  sig: string;
}

/**
 * Validate the token and its signature
 * @param token -
 */
export function validate(token: ISubstrateDecodedStructure): ISubstratePayload {
  const { sig, payload } = token;

  const message = createTokenPayloadForSigning(payload);

  if (!signatureVerify(message, hexToU8a(sig), payload.account).isValid) {
    throw new StrategyValidationError('Bad signature.', 401);
  }

  return payload;
}

/**
 * HEX encode the payload for signing. Serialization is done via `JSON.stringify`
 * @param payload - Payload
 * @returns hex string starting with `0x`
 */
export function createTokenPayloadForSigning(payload: ISubstratePayload): string {
  const p = stringToHex(JSON.stringify(payload));
  return p;
}

/**
 * Encode the token structure to base64 which is used as the part of the Authorization header
 * @param d - Real token structure with the sig. This is as you would use it in the TS
 * @returns
 */
export function encodeToken(d: ISubstrateDecodedStructure): string {
  const p = JSON.stringify(d);
  return encode(p);
}
