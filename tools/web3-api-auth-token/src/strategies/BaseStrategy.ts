import { isNil, join, length, split, trim } from 'ramda';

import { decode, encode } from '../utils/base64url';
import { IAuthStrategy } from './strategies';

/**
 * Token structure when decoded and ready for validation
 * @typeParam  P - is the payload type
 * @typeParam  S - is the {@link IAuthStrategy}
 * @public
 */
export interface ITokenStructure<P> {
  /**
   * resolving strategy
   */
  strategy: IAuthStrategy;
  /**
   * What you send
   */
  payload: P;
  /**
   * Signature obtained by encode() function
   */
  sig: string;
}

/**
 * Encoded token, this is what it's sent over the wire
 * This is just a wrapper so we can clearly read that the return is the Token
 */
export type IToken = string;

/**
 * Token with the Authorization header
 */
export interface ITokenHeader {
  authorization: string;
}

/**
 * Parsed token output
 * @typeParam  P - is the payload type
 * @returns the token structure and original, unparsed and not decoded values
 */
export interface IParsedToken<P> {
  parsed: ITokenStructure<P>;
  original: {
    payload: string;
    sig: string;
    strategy: string;
  };
}

/**
 * Base strategy. New classes should extend this class and pass the payload type they with to use as
 * the generic type `P`.
 *
 * You can pass the payload in to the constructor or later set it via setter
 * Example
 * ```ts
 * const t = new ImplementedStrategy({iss:'me', aud:'you'});
 * // or
 * const t =  new ImplementedStrategy();
 * t.payload = {iss:'me', aud:'you'};
 * ```
 */

export abstract class BaseStrategy<P> {
  /**
   * Payload that is signed
   * @internal
   */
  private _payload!: P;

  /**
   * Implemented strategy
   * @internal
   */
  private _strategy!: IAuthStrategy;

  /**
   *
   * @param payload - Token payload
   */
  public constructor(payload?: P) {
    if (!isNil(payload)) {
      this._payload = payload;
    }
  }

  public get payload(): P {
    return this._payload;
  }

  public set payload(value: P) {
    this._payload = value;
  }

  public get strategy(): IAuthStrategy {
    return this._strategy;
  }

  public set strategy(value: IAuthStrategy) {
    this._strategy = value;
  }
  /**
   * Encode the payload to correct output. **Asynchronously**
   * @remarks The encoding is not async, but i left it like this in case we need to change it. No harm done!
   * @returns a string
   * @public
   */
  public async encode(): Promise<IToken> {
    return encode(JSON.stringify(this.payload));
  }

  /**
   * Implementations can override this method to suit their needs when they need to encode the signature.
   * @param rawSig - RAW Signature
   * @typeParam T - What is the type of the RAW signature
   * @typeParam R - The Return type
   * @returns the R type. This return value is serialized then encoded
   */
  public abstract encodeSignature(rawSig: unknown): Promise<unknown>;

  /**
   * Make the token, combine the `encodedStrategy.encodedPayload.encodedPayloadSignature`. All parts are base64Url encoded.
   * @param sig - Payload Signature as generic `T`
   * @typeParam T - This generic is more for code understanding and future implementations. It doesn't have any impact. We suggest setting is regardless.
   * @returns the token as a string in the correct format `x.xx.xxx`
   */
  public async make<T>(sig: T): Promise<string> {
    if (isNil(this.strategy)) {
      throw new Error(`Did you forget to set the strategy?`);
    }
    if (isNil(this.payload)) {
      throw new Error(`Did you forget to set the payload?`);
    }

    const encodedStrategy = encode(this.strategy as unknown as string);
    const encodedPayload = encode(JSON.stringify(this.payload));
    const encodedSignature = encode(JSON.stringify(await this.encodeSignature(sig))); // for strings this produces `"\"my-string\""`

    const parts = [encodedStrategy, encodedPayload, encodedSignature];
    return join('.', parts);
  }

  /**
   * Encode the payload with the encode() then return the common authorization bearer object
   * @param sig - Payload Signature as string
   * @typeParam T - This generic is more for code understanding and future implementations. It doesn't have any impact. We suggest setting is regardless.
   * @returns `{authorization: 'Bearer c3Vi.eyJhZ2UiOjQzLCJuYW1lIjoid29zcyJ9.InNpZyI='}`
   * @public
   */
  public async makeWithHeader<T>(sig: T): Promise<ITokenHeader> {
    return { authorization: `Bearer ${await this.make<T>(sig)}` };
  }

  /**
   *
   * @param token - Incoming token string in a `x.xx.xxx` format
   * @typeParam P - The payload type
   * @returns the Parsed token structure where the `parsed` is of the {@link ITokenStructure} with the `P` generic type
   */
  public static async parseToken<P>(token: IToken): Promise<IParsedToken<P>> {
    const tokenChunks = split('.')(trim(token));
    const chunksLength = length(tokenChunks);

    if (chunksLength !== 3) {
      throw new Error(`Malformed token. Got ${chunksLength} instead of 3.`);
    }

    const [s, p, sig] = tokenChunks;

    const strategy: IAuthStrategy = decode(s) as IAuthStrategy;
    const payload: P = JSON.parse(decode(p));
    const signature = JSON.parse(decode(sig));

    return {
      parsed: {
        payload,
        sig: signature,
        strategy
      },
      original: {
        payload: p,
        sig,
        strategy: s
      }
    };
  }

  /**
   * Validation for this strategy
   * @typeParam  P - Implemented payload interface
   * @param token - Decoded token, {@link IToken} wrapped string
   * @returns The incoming payload if the signature verification passes, otherwise throw error.
   * @public
   */
  public abstract validate(token: IToken): Promise<P>;
}
