<script lang="ts">
  import '../app.css';

  import Notifications from '@kelp_digital/svelte-ui-components/notifications/Notifications.svelte';
  import { polkadotAccountsStore } from '@kelp_digital/svelte-ui-components/polkadot/store';
  import { isNil } from 'ramda';
  import { refetchData } from 'src/appStore';
  import { initSentry } from 'src/sentry';
  import { onMount } from 'svelte';

  import { waatStore } from '$lib/waat/store';
  import WithWaat from '$lib/waat/WithWaat.svelte';

  import Navbar from '../components/base/Navbar.svelte';

  initSentry();

  async function run() {
    await waatStore.generateToken($polkadotAccountsStore.selectedAccount.address);

    refetchData.set(true);
  }

  onMount(() => {
    console.log('mount layout');
    console.log('maybe all app loaded');
  });

  $: if (!isNil($polkadotAccountsStore.selectedAccount)) {
    run();
  }
</script>

<WithWaat>
  <Notifications />
  <div class="flex flex-col min-h-screen bg-base-200" data-sveltekit-prefetch>
    <Navbar />
    <div class="md:container md:mx-auto p-4">
      <!-- here be content -->
      <slot />
      <!-- here be content -->
    </div>
  </div>
</WithWaat>
<!-- <div class="hero h-screen"> -->
<!-- <div class="hero-content text-center"> -->
<!-- <div class="bg-base-200 p-40 rounded-3xl opacity-90"> -->
<!-- </div> -->
<!-- </div> -->
<!-- </div> -->
<!-- </div> -->

<!-- <style>
	.image-background {
		background-image: url('https://macula.kelp.digital/ipfs/bafybeib5jwfwqu22pe27t4onzitfqodybk3t2ttfydjfibjqb24nyv3hki');
		background-size: cover;
		background-repeat: no-repeat;
		background-position: center center;
		background-attachment: fixed;
	}
</style> -->
