import { writable } from 'svelte/store';
import { browser } from '$app/environment';

import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { stringToHex } from '@polkadot/util';
import type { HexString } from '@polkadot/util/types';

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

/**
 * Sign the payload using the PolkadotJS extension
 * @param account -
 * @param payload -
 * @returns `0x` hex encoded string
 */
export async function signViaExtension(account: string, payload: string): Promise<HexString> {
	const { web3FromAddress } = await import('@polkadot/extension-dapp');

	const injector = await web3FromAddress(account);
	// this injector object has a signer and a signRaw method
	// to be able to sign raw bytes
	const signRaw = injector?.signer?.signRaw;
	if (!!signRaw) {
		console.log(`Signing the payload`);
		// after making sure that signRaw is defined
		// we can use it to sign our message
		const { signature } = await signRaw({
			address: account,
			data: payload,
			type: 'bytes'
		});

		return signature;
	} else {
		throw new Error('cannot sign, signRaw does not exist');
	}
}
