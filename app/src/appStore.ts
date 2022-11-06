/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type ISubstratePayload, SubstrateStrategy } from '@kelp_digital/web3-api-auth-token';
import { isEmpty, isNil } from 'ramda';
import { writable } from 'svelte/store';

import { browser, dev } from '$app/environment';
import { signViaExtension } from '$lib/polkadot/store';

import { type MaculaApi, baseUrl as baseMaculaApiUrl, initMaculaApi } from './maculaApi';

interface IDefaultState {
  maculaApi: MaculaApi;
  tokens: Record<string, string>;
  currentToken: string;
  currentTokenHeader: Record<string, string>;
  refetchData: boolean;
  interceptorId?: number;
}

/**
 * Make the token
 * @param account
 * @returns
 */
export async function makeToken(account: string) {
  console.log('making token for %s', account);

  const now = new Date();
  const exp = now.setMonth(now.getMonth() + 7); // this returns the ms
  const tokenPayload: ISubstratePayload = {
    account,
    network: 'anagolay',
    prefix: 42,
    exp
  };

  const t = new SubstrateStrategy(tokenPayload);
  const sig = await signViaExtension(account, await t.encode());

  const encodedToken = await t.make(sig);

  return encodedToken;
}

function appStoreFn() {
  let tokens: Record<string, string> = {};
  let maculaApiUrl: string = baseMaculaApiUrl;

  if (browser) {
    const t = window.localStorage.getItem('waat');
    tokens = !isNil(t) ? JSON.parse(t) : {};
    if (dev) {
      maculaApiUrl = window.location.origin.replace('7777', '3000');
    }
  }
  const maculaApi = initMaculaApi(maculaApiUrl);

  const defaultState: IDefaultState = {
    maculaApi,
    tokens,
    currentTokenHeader: {},
    currentToken: '',
    refetchData: false
  };

  const { subscribe, set, update } = writable(defaultState);

  return {
    subscribe,
    set,
    update,
    generateToken: async (account: string, refetch = true) => {
      // const { selectedAccount } = get(polkadotAccountsStore);
      const selectedAccount = account;
      let encodedToken: string;
      let tokensFromLocalStorage: Record<string, string> = {};

      if (browser) {
        const t = window.localStorage.getItem('waat');
        tokensFromLocalStorage = !isNil(t) ? JSON.parse(t) : {};
      }

      const selectedTokenFromLocalStorage = tokensFromLocalStorage[selectedAccount];

      if (isNil(selectedTokenFromLocalStorage) || isEmpty(selectedTokenFromLocalStorage)) {
        encodedToken = await makeToken(selectedAccount);
      } else {
        encodedToken = selectedTokenFromLocalStorage;
      }

      const interceptorId = await defaultState.maculaApi.configureTokenInterceptor(encodedToken);

      update((oldState) => {
        const tokens = { ...oldState.tokens, [selectedAccount]: encodedToken };
        window.localStorage.setItem('waat', JSON.stringify(tokens));

        const newState = {
          ...oldState,
          tokens,
          currentToken: encodedToken,
          currentTokenHeader: {
            Authorization: `Bearer ${encodedToken}`
          },
          refetchData: refetch,
          interceptorId
        };
        if (refetch) {
          // this is OLD STATE
          defaultState.maculaApi.removeInterceptor(oldState.interceptorId);
        }

        return newState;
      });
    }
  };
}

export const appStore = appStoreFn();
