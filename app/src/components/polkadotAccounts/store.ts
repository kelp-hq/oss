import { writable } from 'svelte/store';
import { browser, dev, prerendering } from '$app/environment';

import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

export interface SubstrateAccountsStorage {
	selectedAccount: string;
	injectedAccounts: InjectedAccountWithMeta[];
}

/**
 * actual store
 */
function polkadotAccountsStoreFn() {
	let selectedAccountFromLocalStorage: string = '';

	if (browser) {
		selectedAccountFromLocalStorage = window.localStorage.getItem('macula:selectedAccount') || '';
	}

	const { update, subscribe, set } = writable<SubstrateAccountsStorage>({
		selectedAccount: selectedAccountFromLocalStorage,
		injectedAccounts: []
	});
	return {
		subscribe,
		set,
		update,
		setSelectedAccount: (account: string) => {
			update((currentState) => {
				if (browser) {
					window.localStorage.setItem('macula:selectedAccount', account);
				}
				currentState.selectedAccount = account;
				return currentState;
			});
		}
	};
}

/**
 * Substrate Accounts storage
 */
export const polkadotAccountsStore = polkadotAccountsStoreFn();
