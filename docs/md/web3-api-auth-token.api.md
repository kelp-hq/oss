## API Report File for "@kelp_digital/web3-api-auth-token"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { NextFunction } from 'express';
import { Request } from 'express';
import { Response } from 'express';

// @public
export abstract class BaseStrategy<P> {
    constructor(payload?: P);
    encode(): Promise<IToken>;
    abstract encodeSignature(rawSig: unknown): Promise<unknown>;
    make<T>(sig: T): Promise<string>;
    makeWithHeader<T>(sig: T): Promise<ITokenHeader>;
    // (undocumented)
    static parseToken<P>(token: IToken): Promise<IParsedToken<P>>;
    // (undocumented)
    get payload(): P;
    set payload(value: P);
    // (undocumented)
    get strategy(): IAuthStrategy;
    set strategy(value: IAuthStrategy);
    abstract validate(token: IToken): Promise<P>;
}

// @public
export function decode(d: string, safe?: boolean): string;

// @public
export function encode(d: string, safe?: boolean): string;

// @public
export function expressV4AuthMiddleware(req: Request, res: Response, next: NextFunction): Promise<void>;

// @public
export type HexString = `0x${string}`;

// @public
export enum IAuthStrategy {
    'substrate' = "sub"
}

// @public
export interface IParsedToken<P> {
    // (undocumented)
    original: {
        payload: string;
        sig: string;
        strategy: string;
    };
    // (undocumented)
    parsed: ITokenStructure<P>;
}

// @public (undocumented)
export interface ISubstratePayload {
    account: string;
    exp?: number;
    network: string;
    prefix: number;
}

// @public
export type IToken = string;

// @public
export interface ITokenHeader {
    // (undocumented)
    Authorization: string;
}

// @public
export interface ITokenStructure<P> {
    payload: P;
    sig: string;
    strategy: IAuthStrategy;
}

// @public (undocumented)
export class StrategyValidationError extends Error {
    constructor(message: string, status: number);
    status: number;
}

// @public
export class SubstrateStrategy extends BaseStrategy<ISubstratePayload> {
    constructor(payload?: ISubstratePayload);
    // (undocumented)
    encodeSignature(rawSig: HexString): Promise<HexString>;
    // (undocumented)
    validate(token: string): Promise<ISubstratePayload>;
}

```
