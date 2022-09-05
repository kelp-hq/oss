import { get, writable } from 'svelte/store';

export interface SubstrateAccountsStorage {
	selectedAccount: string;
	injectedAccounts: InjectedAccountWithMeta[];
}
/**
 * actual store
 */
function polkadotAccountsFn() {
	const { update, subscribe, set } = writable<SubstrateAccountsStorage>({
		selectedAccount: '',
		injectedAccounts: []
	});
	return {
		subscribe,
		set,
		update
	};
}

/**
 * Substrate Accounts storage
 */
export const polkadotAccounts = polkadotAccountsFn();
