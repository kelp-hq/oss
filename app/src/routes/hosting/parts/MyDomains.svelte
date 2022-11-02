<script lang="ts">
	import { appStore } from 'src/appStore';
	import { myDomainsApi } from 'src/maculaApi';
	import DomainCard from './DomainCard.svelte';
</script>

{#await myDomainsApi({ headers: $appStore.tokenHeader })}
	<!-- promise is pending -->
	loading ....
{:then domains}
	<div class="container mx-auto">
		{#each domains.data as domain}
			<DomainCard {domain} />
		{/each}
	</div>
{:catch error}
	<!-- promise was rejected -->
	{error}
{/await}
