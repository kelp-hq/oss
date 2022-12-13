/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { isEmpty, isNil } from 'ramda';
import { type Writable, get, writable } from 'svelte/store';

import { browser, dev } from '$app/environment';
import { waatStore } from '$lib/waat/store';

import { type MaculaApi, baseUrl as baseMaculaApiUrl, initMaculaApi } from './maculaApi';

interface IDefaultState {
  maculaApi: MaculaApi;
}

export const refetchData: Writable<boolean> = writable(false);

function appStoreFn() {
  let maculaApiUrl: string = baseMaculaApiUrl;

  if (browser && dev) {
    const ls = window.localStorage.getItem('macula_api');
    if (!isNil(ls) && !isEmpty(ls)) {
      maculaApiUrl = ls;
    } else {
      maculaApiUrl = window.location.origin.replace('7777', '3000');
    }
  }

  const maculaApi = initMaculaApi(maculaApiUrl);

  const defaultState: IDefaultState = {
    maculaApi
  };

  const { subscribe, set, update } = writable(defaultState);

  return {
    subscribe,
    set,
    update,
    initState: async () => {
      const $waatStore = get(waatStore);
      await defaultState.maculaApi.configureTokenInterceptor($waatStore.currentToken);
      // if (refetch) {
      // this is OLD STATE
      // defaultState.maculaApi.removeInterceptor();
      // }
    }
  };
}

export const appStore = appStoreFn();
