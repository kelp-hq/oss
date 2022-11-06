<script lang="ts">
  import '../app.css';

  import { initSentry } from 'src/sentry';
  import { onMount } from 'svelte';

  import Notifications from '$lib/notifications/Notifications.svelte';

  import Navbar from '../components/base/Navbar.svelte';

  initSentry();

  onMount(() => {
    console.log('mount layout');
  });
</script>

<Notifications />
<div class="flex flex-col min-h-screen bg-base-200" data-sveltekit-prefetch>
  <Navbar />
  <div class="md:container md:mx-auto p-4">
    <!-- here be content -->
    <slot />
    <!-- here be content -->
  </div>
</div>
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
