- [web3-api-auth-token-token (WAAT)](#web3-api-auth-token-token-waat)
  - [Why should I use WAAT?](#why-should-i-use-waat)
  - [What is the Web3 API Auth Token structure?](#what-is-the-web3-api-auth-token-structure)
    - [Strategy](#strategy)
    - [Payload](#payload)
    - [Signature](#signature)
    - [Putting all together](#putting-all-together)
- [How to create new Strategy?](#how-to-create-new-strategy)
  - [Implemented strategies:](#implemented-strategies)
  - [Implemented middleware for:](#implemented-middleware-for)

# web3-api-auth-token-token (WAAT)

Web3 API Auth Token (**WAAT**) defines a compact and self-contained way for securely transmitting information between the parties as a base64Url encoded JSON object. the information can be verified and trusted because it is digitally signed and the signature provided as a part of the token. WAAT is completely agnostic about the way the Strategies validate the payload. Because of this design approach, the WAAT is also agnostic about the RAW type of the signature and encourages the best practices for each Strategy.

Most of the users will use WAAT in an unencrypted way, meaning, the payload is just encoded and available to everyone who knows how to decode it. For now, we will focus on _signed_ tokens. Signed tokens are very useful because the receiving party can verify the integrity of the token payload which contains the public address that was used to create the signature.

The signature is created using the Private key which is available in respective DApps, extensions or wallets. Then the signature is verified on the receiving side by using the provided Public key ( address ) to check the integrity of the signature.

## Why should I use WAAT?

Here are some scenarios where WAATs are useful:

- **Authorization**: this is the most common scenario for using the WAAT. DApps can load the users' account from the wallet browser extension, use the keys to create the signature and then make the request to the API allowing users to access resources, services and routes that are permitted with that token.
- **Information Exchange**: Web3 API Auth Tokens are an excellent way to transmit information where the integrity needs to be checked and validated. Because WAATs can be signed, any party receiving them can verify the integrity and authenticity.

## What is the Web3 API Auth Token structure?

In its compact form, the one that is sent in the Authorization header, WAAT consists of 3 parts separated by a dot `.`:

- encoded strategy (`xxxxxx`)
- encoded payload (`yyyyyyy`)
- encoded signature (`zzzzzz`)

When combined the WAAT looks like this.

`xxxxxx.yyyyyyy.zzzzzz`

### Strategy

This is the first part. Consider this as a routing rule that will know how to call a specific Strategy. A list of potential values is part of the `IAuthStrategy enum` located [here](./src/strategies/strategies.ts). The value is encoded using the [base64Url](./src/utils/base64url.ts). Check the implementation [here](./src/strategies/BaseStrategy.ts).

### Payload

This is the second part. This is Strategy specific. Every implemented strategy has complete control what is the structure and what are the required and optional keys. Some strategies can decide to have the payload as an array some can have it structured like [SubstrateStrategy](./src/strategies/substrate/index.ts). To produce the correct value the native object is serialized using the `JSON.stringify` it's encoded using the [base64Url](./src/utils/base64url.ts). Check the implementation [here](./src/strategies/BaseStrategy.ts).

### Signature

This is the third and the last part. This is Strategy specific. Every implemented strategy has complete control over how to generate the signature and what is the decoded representation. For example, the SubstrateStrategy will require that the decoded signature is a hex string starting with `0x`. Each Strategy must implement the [`encodeSignature`](./src/strategies/BaseStrategy.ts) method which will be called before serialization that is done using `JSON.stringify` and then as usual encode it using [base64Url](./src/utils/base64url.ts). Check the implementation [here](./src/strategies/BaseStrategy.ts).

### Putting all together

The output is the base64Url encoded strings separated by a dot that can be safely passed over the network, and since the encoding is URL-safe, the WAAT can be sent via the links, GET API calls, or as a part of the callback request ( authorization server ).

Here is what the final WAAT looks like:

```
c3Vi.eyJhZ2UiOjQzLCJuYW1lIjoid29zcyJ9.InNpZyI=
```

# How to create new Strategy?

---

Yup, the WAATs are similar to JWTs but built for web3 to be lightweight and modular.

---

## Implemented strategies:

| Done | Name                              | Strategy                                    |
| ---- | --------------------------------- | ------------------------------------------- |
| ✅   | [substrate](https://substrate.io) | [code is here](./src/strategies/substrate/) |
| -    | near                              | -                                           |
| -    | solana                            | -                                           |
| -    | ethereum                          | -                                           |
| -    | avalanche                         | -                                           |
| -    | elrond                            | -                                           |
| -    | aptos                             | -                                           |

## Implemented middleware for:

- [x] express [middleware](./src/express/authMiddleware.ts)

Planned features:

- [ ] encrypted WAAT
