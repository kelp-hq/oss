<script lang="ts">
	import { isEmpty, takeLast, take } from 'ramda';
	import Identicon from 'identicon.js';
	import { isNil } from 'ramda';
	import type { IdenticonOptions } from 'identicon.js';
	import { equals } from 'ramda';
	import { polkadotAccountsStore } from '../store';

	const identiconOptions: IdenticonOptions = {
		foreground: [0, 0, 0, 255], // rgba black
		background: [255, 255, 255, 255], // rgba white
		margin: 0.1, // 20% margin
		size: 500, // 420px square
		format: 'png' // use PNG instead of SVG
	};

	// default identicon
	let identiconImage: any = new Identicon(
		'default-text-for-our-identicon',
		identiconOptions
	).toString();

	function truncateAddress(address: string): string | boolean {
		if (isNil(address) || isEmpty(address)) {
			return false;
		}
		// take first 7
		const start = take(7, address);

		// and take last 7
		const end = takeLast(7, address);

		return `${start}...${end}`;
	}
	$: {
		if (!isEmpty($polkadotAccountsStore.selectedAccount)) {
			identiconImage = new Identicon(
				$polkadotAccountsStore.selectedAccount,
				identiconOptions
			).toString();
		}
	}
</script>

<div class="dropdown dropdown-end">
	<div class="w-full flex items-center gap-2">
		<div>
			{truncateAddress($polkadotAccountsStore.selectedAccount) || 'Select account'}
		</div>
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label tabindex="0" class="btn btn-ghost btn-circle avatar p-1">
			<img class="rounded-full" alt="Identicon" src="data:image/png;base64,{identiconImage}" />
		</label>
	</div>

	{#if !isEmpty($polkadotAccountsStore.injectedAccounts)}
		<ul tabindex="0" class="mt-3 p-2 shadow-lg drop-shadow-lg menu menu-compact dropdown-content">
			{#each $polkadotAccountsStore.injectedAccounts as account}
				<li>
					<span
						class="m-2 flex flex-col justify-start items-start {equals(
							account.address,
							$polkadotAccountsStore.selectedAccount
						) && 'active'}"
						on:click={() => {
							polkadotAccountsStore.setSelectedAccount(account.address);
						}}
					>
						<span class="text-lg">{account.meta.name}</span>
						<span class="text-xs">{account.address}</span>
					</span>
				</li>
			{/each}
		</ul>
	{/if}
</div>
