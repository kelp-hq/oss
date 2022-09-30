/* eslint-disable @typescript-eslint/explicit-function-return-type */
import Keyring from '@polkadot/keyring';
import { KeyringPair } from '@polkadot/keyring/types';
import { u8aToHex } from '@polkadot/util';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { ISubstratePayload, SubstrateStrategy } from '.';

describe('Substrate', () => {
  beforeEach(async (): Promise<void> => {
    await cryptoWaitReady();
  });
  describe('auth', () => {
    let keyring: Keyring;
    let alice: KeyringPair;

    const tokenPayload: ISubstratePayload = {
      network: 'anagolay',
      prefix: 42,
      account: '5FA9nQDVg267DEd8m1ZypXLBnvN7SFxYwV7ndqSYGiN9TTpu' // alice account
    };
    const tokenString = `c3Vi.eyJuZXR3b3JrIjoiYW5hZ29sYXkiLCJwcmVmaXgiOjQyLCJhY2NvdW50IjoiNUZBOW5RRFZnMjY3REVkOG0xWnlwWExCbnZON1NGeFl3VjduZHFTWUdpTjlUVHB1In0=.MHhmOTk5MmI2NTA0YTFiMGIxNjliZjQ1NmU4MDI2NzhjNmQ3Y2I3NGRlMDQ4MDI0OWI1OTRhNTk1YWRmYjkzNjlkOWUxMGU2NzIxYjkxZWUyZjZjYmE4MjljNWY5NDU2ODY1ZWI1YjY1NTJjODk2MTBkMDViMmY0NmVjZWNkYTcwNw==`;

    beforeEach((): void => {
      keyring = new Keyring({ ss58Format: 42, type: 'ed25519' });
      // // alice
      // const seedOne = stringToU8a('12345678901234567890123456789012');
      // keyring.addFromSeed(seedOne, {});
      alice = keyring.addFromUri('//Alice');
    });

    it('should test token creation with constructor', async () => {
      const t = new SubstrateStrategy(tokenPayload);

      const payloadToSign = await t.encode();
      const signature = alice.sign(payloadToSign);

      // the make() expects string, we will not make any assumptions on stringification
      const token = await t.make(u8aToHex(signature));

      expect(token).toEqual(tokenString);
    });

    it('should test token creation without constructor', async () => {
      // create Alice based on the development seed

      const t = new SubstrateStrategy();
      t.payload = tokenPayload;

      const signature = alice.sign(await t.encode());
      expect(await t.make(u8aToHex(signature))).toEqual(tokenString);
    });

    it('should pass the validate token signature', async () => {
      const t = new SubstrateStrategy();
      const isValid = await t.validate(tokenString);
      expect(isValid).toEqual(tokenPayload);
    });

    it('should fail the validate token signature', async () => {
      const tokenPayload: ISubstratePayload = {
        network: 'anagolay',
        prefix: 42,
        account: '5EJA1oSrTx7xYMBerrUHLNktA3P89YHJBeTrevotTQab6gEY' // woss test account
      };

      // const t = new SubstrateStrategy(tokenPayload); // OR like this
      const t = new SubstrateStrategy();
      t.payload = tokenPayload;

      const sig = alice.sign(await t.encode()); // bus signing with Alice, this MUST fail

      const token = await t.make(u8aToHex(sig));
      try {
        await t.validate(token);
      } catch (error) {
        expect(error.message).toContain('Bad signature.');
        expect(error.status).toEqual(401);
      }
    });
    it('should succeed when token is not expired', async () => {
      const now = new Date();
      const exp = now.setMinutes(now.getMinutes() + 7);

      const tokenPayload: ISubstratePayload = {
        network: 'anagolay',
        prefix: 42,
        account: '5FA9nQDVg267DEd8m1ZypXLBnvN7SFxYwV7ndqSYGiN9TTpu', // alice account
        exp // optional, if not present forever
      };

      // const t = new SubstrateStrategy(tokenPayload); // OR like this
      const t = new SubstrateStrategy();
      t.payload = tokenPayload;

      const sig = alice.sign(await t.encode()); // bus signing with Alice, this MUST fail

      const token = await t.make(u8aToHex(sig));
      const isValid = await t.validate(token);
      expect(isValid).toEqual(tokenPayload);
    });
    it('should fail when token expired', async () => {
      const tokenPayload: ISubstratePayload = {
        network: 'anagolay',
        prefix: 42,
        account: '5EJA1oSrTx7xYMBerrUHLNktA3P89YHJBeTrevotTQab6gEY', // woss test account
        exp: 3600 // optional, if not present forever
      };

      // const t = new SubstrateStrategy(tokenPayload); // OR like this
      const t = new SubstrateStrategy();
      t.payload = tokenPayload;

      const sig = alice.sign(await t.encode()); // bus signing with Alice, this MUST fail

      const token = await t.make(u8aToHex(sig));
      try {
        await t.validate(token);
      } catch (error) {
        expect(error.message).toContain('Token Expired.');
        expect(error.status).toEqual(401);
      }
    });
  });
});
