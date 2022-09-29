import { u8aToHex } from '@polkadot/util';
import { cryptoWaitReady, decodeAddress, signatureVerify } from '@polkadot/util-crypto';

import { StrategyValidationError } from '../../utils/errors';
import { BaseStrategy, ITokenStructure } from '../BaseStrategy';
import { IAuthStrategy } from '../strategies';

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
   * exp or TimeToLive in seconds. This is basically expiration of the token. After this time the token is not valid and MUST be rejected.
   *
   * @remarks
   * Use this snippet to add 5 mins to the current date making the token available within 5 minutes
   * ```js
   * const now = new Date();
   * const exp = now.setMinutes(now.getMinutes() + 5);
   * ```
   */
  exp: number;
}

/**
 *
 * @public
 */
export type ISubstrateTokenStructure = ITokenStructure<ISubstratePayload>;

/**

 * You can pass the payload in to the constructor or later set it via setter
 * Example
 * ```ts
 * const tokenPayload = {
 *    account: 'just-normal-substrate-based-address',
 *    network: 'anagolay',
 *    prefix: 42,
 *    exp: 6000
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

  public async validate(token: string): Promise<ISubstratePayload> {
    const {
      parsed: { payload: decodedPayload, sig },
      original: { payload }
    } = await SubstrateStrategy.parseToken<ISubstratePayload>(token);

    await cryptoWaitReady();

    const publicKey = decodeAddress(decodedPayload.account);
    const hexPublicKey = u8aToHex(publicKey);

    const verifyResult = signatureVerify(payload, sig, hexPublicKey);

    if (!verifyResult.isValid) {
      throw new StrategyValidationError('Bad signature.', 401);
    }

    return decodedPayload;
  }
}
