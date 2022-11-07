<script lang="ts">
  import { isEmpty } from 'ramda';
  import { appStore } from 'src/appStore';
  import type { ISubdomainDocument } from 'src/maculaApi';
  import { onMount } from 'svelte';
  import SvelteSeo from 'svelte-seo/';

  import { polkadotAccountsStore } from '$lib/polkadot/store';
  import { tokenReady, waatStore } from '$lib/waat/store';

  import NoSubdomains from './components/NoSubdomains.svelte';
  import DomainCard from './parts/DomainCard.svelte';

  let domains: ISubdomainDocument[] = [];

  let loadingData = true;

  async function getData() {
    const res = await $appStore.maculaApi.hostingMyDomains();
    domains = res.data;
    loadingData = false;
  }

  onMount(async () => {
    console.log('mount Mydomains');

    if ($tokenReady) {
      // 	console.log('account changed', $polkadotAccountsStore.selectedAccount);
      await waatStore.generateToken($polkadotAccountsStore.selectedAccount.address);
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

<SvelteSeo title="Hosting for everyone!" description="" />

{#if loadingData}
  loading data ...
{:else if !loadingData && isEmpty(domains)}
  <NoSubdomains />
{:else}
  <div class="flex flex-col">
    {#each domains as domain}
      <DomainCard {domain} />
    {/each}
  </div>
{/if}
