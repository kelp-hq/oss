<script lang="ts">
	import { isEmpty } from 'ramda';
	import { isNil } from 'ramda';
	import { appStore } from 'src/appStore';
	import { polkadotAccountsStore } from 'src/components/polkadotAccounts/store';
	import { myDomainsApi, type ISubdomainDocument } from 'src/maculaApi';
	import { onMount } from 'svelte';
	import DomainCard from './DomainCard.svelte';

	let domains: ISubdomainDocument[] = [];

	async function getData() {
		const res = await myDomainsApi();
		domains = res.data;
		console.log('domains', domains);
	}

	onMount(async () => {
		console.log('mount Mydomains');
		// if ($polkadotAccountsStore.selectedAccount) {
		// 	console.log('account changed', $polkadotAccountsStore.selectedAccount);
		await appStore.generateToken($polkadotAccountsStore.selectedAccount, false);
		await getData();
		// }
	});
	$: {
		if ($appStore.refetchData) {
			getData();
		}
	}
</script>

{#if !isEmpty(domains)}
	<!-- content here -->
	<div class="container mx-auto p-4">
		{#each domains as domain}
			<DomainCard {domain} />
		{/each}
	</div>
{:else}
	<div>you have not yet added any subdomains</div>
{/if}
