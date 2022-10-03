<script lang="ts">
	import { onMount } from 'svelte';
	import { polkadotAccountsStore } from './store';
	import Dropdown from './views/Dropdown.svelte';

	onMount(async () => {
		// import { web3Accounts, web3Enable } from '@polkadot/extension-dapp?client';
		const { web3Accounts, web3Enable } = await import('@polkadot/extension-dapp');

		await web3Enable('macula');
		// set to the storage
		$polkadotAccountsStore.injectedAccounts = await web3Accounts();
	});
</script>

<Dropdown />
