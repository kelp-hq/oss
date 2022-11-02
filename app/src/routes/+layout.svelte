<script lang="ts">
	import Navbar from '../components/base/Navbar.svelte';
	import '../app.css';
	import { onMount } from 'svelte';

	onMount(() => {
		console.log('mount layout');
	});
</script>

<!-- <div> -->
<Navbar />
<div class="min-h-screen bg-base-200">
	<slot />
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
