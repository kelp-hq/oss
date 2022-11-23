<script lang="ts">
  import { isEmpty } from 'ramda';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  import { browser } from '$app/environment';

  import { notificationsStore } from '../notifications/store';
  import { polkadotAccountsStore } from './store';
  import { isChrome, isFirefox } from './utils';
  import DropdownView from './views/DropdownView.svelte';

  let classNames = '';
  export { classNames as class };

  export let applicationName = 'anagolay.js';

  export let showAs: 'dropdown' = 'dropdown';

  export let tokenGenerationFunction: (address: string) => Promise<void> | undefined = undefined;

  let accountsLoaded = false;

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
    $polkadotAccountsStore.tokenGenerationFunction = tokenGenerationFunction;
    // import { web3Accounts, web3Enable } from '@polkadot/extension-dapp?client';
    const { web3Accounts, web3Enable } = await import('@polkadot/extension-dapp');

    await web3Enable(applicationName);
    // set to the storage
    const accounts = await web3Accounts();
    $polkadotAccountsStore.injectedAccounts = accounts;

    if (isEmpty(accounts)) {
      notificationsStore.addNew({
        text: `PolkadotJS extension is not loaded. Please enable it or install it.`,
        infoLevel: 'warning',
        autoclose: { close: false },
        showSpinner: true
      });

      console.log(`[PolkadotAccounts]: PolkadotJS extension is not loaded. Please enable it or install it.`);
    } else {
      accountsLoaded = true;
    }
  });
</script>

<div title="Polkadot Accounts" class={classNames}>
  {#if !accountsLoaded}
    <div class="wait-accounts">Waiting for the accounts ...</div>
  {/if}
  {#if accountsLoaded}
    {#if showAs === 'dropdown'}
      <div class="w-full" transition:fade={{ delay: 250, duration: 300 }}>
        <DropdownView />
      </div>
    {/if}
  {/if}
</div>

<!-- this should work test it -->
<style lang="postcss">
  .wait-accounts {
    @apply animate-pulse flex-1 bg-base-300 p-4 text-center font-mono;
  }
</style>
