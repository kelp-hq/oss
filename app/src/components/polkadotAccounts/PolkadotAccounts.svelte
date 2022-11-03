<script lang="ts">
	import { browser } from '$app/environment';
	import { isChrome, isFirefox } from './utils';
	import { isEmpty } from 'ramda';
	import { onMount } from 'svelte';
	import { polkadotAccountsStore } from './store';
	import DropdownView from './views/DropdownView.svelte';
	import { fade } from 'svelte/transition';
	import { notifications } from '../notifications/stores';
	import SkeletonLoader from '../base/SkeletonLoader.svelte';

	let classNames: string = '';
	export { classNames as class };

	export let applicationName: string = 'anagolay.js';

	export let showAs: 'dropdown' = 'dropdown';

	function storeLink(): string | undefined {
		if (browser) {
			if (isChrome()) {
				// this is 0.44.1
				return 'https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd';
			} else if (isFirefox()) {
				return 'https://addons.mozilla.org/en-US/firefox/addon/polkadot-js-extension/';
			} else {
				alert('unsupported User agent');
			}
		}
	}

	onMount(async () => {
		// import { web3Accounts, web3Enable } from '@polkadot/extension-dapp?client';
		const { web3Accounts, web3Enable } = await import('@polkadot/extension-dapp');

		await web3Enable(applicationName);
		// set to the storage
		const accounts = await web3Accounts();
		$polkadotAccountsStore.injectedAccounts = accounts;
		console.log('accounts', accounts);
		if (isEmpty(accounts)) {
			notifications.addNew({
				text: `PolkadotJS extension is not loaded. Please enable it or install it.`,
				infoLevel: 'warning',
				autoclose: { close: false },
				showSpinner: true
			});
		}
	});
</script>

<div class={classNames}>
	{#if isEmpty($polkadotAccountsStore.injectedAccounts)}
		<div class="animate-pulse flex-1 bg-base-300 p-4 text-center font-mono">
			Waiting for the accounts ...
		</div>
	{/if}
	{#if !isEmpty($polkadotAccountsStore.injectedAccounts)}
		{#if showAs === 'dropdown'}
			<div transition:fade={{ delay: 250, duration: 300 }}>
				<DropdownView />
			</div>
		{/if}
	{/if}
</div>
