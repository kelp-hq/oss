import Keyring from '@polkadot/keyring';
import { stringToU8a } from '@polkadot/util';
import { cryptoWaitReady, signatureVerify } from '@polkadot/util-crypto';

import { createTokenPayloadForSigning, ISubstratePayload } from '.';

describe('Substrate', () => {
  beforeEach(async (): Promise<void> => {
    await cryptoWaitReady();
  });
  describe('auth', () => {
    let keyring: Keyring;

    beforeEach((): void => {
      keyring = new Keyring({ ss58Format: 42, type: 'sr25519' });
      const seedOne = stringToU8a('12345678901234567890123456789012');
      keyring.addFromSeed(seedOne, {});
    });

    it('create correct token', () => {
      const now = new Date();
      const ttl = now.setMinutes(now.getMinutes() + 5);
      // create Alice based on the development seed
      const alice = keyring.addFromUri('//Alice');

      // create the message, actual signature and verify

      const d: ISubstratePayload = {
        network: 'anagolay',
        prefix: 42,
        account: alice.address,
        ttl
      };
      const p = createTokenPayloadForSigning(d);

      const signature = alice.sign(p);
      // const isValid = alice.verify(p, signature, alice.publicKey);

      // console.log(`via alice : ${u8aToHex(signature)} is ${isValid ? 'valid' : 'invalid'}`);

      const isReallyValid = signatureVerify(p, signature, alice.address);
      // console.log(`via signatureVerify : ${u8aToHex(signature)} is ${isReallyValid ? 'valid' : 'invalid'}`);
      expect(isReallyValid.isValid).toBe(true);

      //// now you sign the p with the extension and pass add the sig to the sig field
      // const t: ISubstrateDecodedStructure = {
      //   sig: u8aToHex(signature),
      //   payload: d,
      //   strategy: IAuthStrategy.substrate
      // };
      // const token = encodeToken(t);
      // console.log('token', token);
    });
  });
});
