import { u8aToHex } from '@polkadot/util';
import { cryptoWaitReady, decodeAddress, signatureVerify } from '@polkadot/util-crypto';
import { isEmpty, isNil } from 'ramda';

import { BaseStrategy } from '../BaseStrategy';
import { StrategyValidationError } from '../errors';
import { IAuthStrategy } from '../strategies';

/**
 * A HEX encoded string prefixed with `0x`
 * @public
 */
export declare type HexString = `0x${string}`;

/**
 * @public
 */
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
   * exp or TimeToLive in milliseconds. This is basically expiration of the token. After this time the token is not valid and MUST be rejected.
   *
   * @remarks
   * Use this snippet to add 7 mins to the current date making the token available within 7 minutes
   * ```js
   * const now = new Date();
   * const exp = now.setMinutes(now.getMinutes() + 7); // this returns the ms
   * ```
   */
  exp?: number;
}

/**

 * You can pass the payload in to the constructor or later set it via setter
 * Example
 * ```ts
 * const now = new Date();
 * const exp = now.setMinutes(now.getMinutes() + 5);
 * const tokenPayload = {
 *    account: 'just-normal-substrate-based-address',
 *    network: 'anagolay',
 *    prefix: 42,
 *    exp // optional, but if present then the token will not be accepted if now() is larger than this field
	*	};
 * const t = new SubstrateStrategy(tokenPayload);
 * // or 
 * const t =  new SubstrateStrategy();
 * t.payload = tokenPayload;
 * ```
 * @public
 */
export class SubstrateStrategy extends BaseStrategy<ISubstratePayload> {
  public constructor(payload?: ISubstratePayload) {
    super(payload);
    this.strategy = IAuthStrategy.substrate;
  }

  public async encodeSignature(rawSig: HexString): Promise<HexString> {
    return rawSig;
  }

  public async validate(token: string): Promise<ISubstratePayload> {
    const {
      parsed: { payload: decodedPayload, sig },
      original: { payload }
    } = await SubstrateStrategy.parseToken<ISubstratePayload>(token);

    // let's check is token expired
    const { exp } = decodedPayload;

    if (!isNil(exp) && !isEmpty(exp)) {
      const nowDate = new Date();
      const now = nowDate.getTime() / 1000;
      if (now >= exp) {
        throw new StrategyValidationError('Token Expired.', 401);
      }
    }

    const publicKey = decodeAddress(decodedPayload.account);
    const hexPublicKey = u8aToHex(publicKey);

    await cryptoWaitReady();
    const verifyResult = signatureVerify(payload, sig, hexPublicKey);

    if (!verifyResult.isValid) {
      throw new StrategyValidationError('Bad signature.', 401);
    }

    return decodedPayload;
  }
}
