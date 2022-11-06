<script lang="ts">
  import { isEmpty } from 'ramda';
  import { appStore } from 'src/appStore';
  import { type ISubdomainDocument, myDomainsApi } from 'src/maculaApi';
  import { onMount } from 'svelte';

  import { polkadotAccountsStore } from '$lib/polkadot/store';

  import NoDomains from '../components/NoSubdomains.svelte';
  import DomainCard from './DomainCard.svelte';

  let domains: ISubdomainDocument[] = [];

  let loadingData = true;

  async function getData() {
    const res = await myDomainsApi();
    domains = res.data;
    loadingData = false;
  }

  onMount(async () => {
    console.log('mount Mydomains');
    if ($polkadotAccountsStore.selectedAccount) {
      // 	console.log('account changed', $polkadotAccountsStore.selectedAccount);
      await appStore.generateToken($polkadotAccountsStore.selectedAccount.address, false);
      await getData();
    } else {
      loadingData = false;
    }
  });
  $: {
    if ($appStore.refetchData) {
      getData();
    }
  }
</script>

{#if loadingData}
  loading data ...
{:else if !loadingData && isEmpty(domains)}
  <NoDomains />
{:else}
  <div class="flex flex-col">
    {#each domains as domain}
      <DomainCard {domain} />
    {/each}
  </div>
{/if}
