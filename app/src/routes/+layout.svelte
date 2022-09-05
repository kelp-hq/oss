<script>
	import Navbar from '../components/base/Navbar.svelte';
	import '../app.css';
</script>

<div class="image-background">
	<Navbar />
	<div class="hero h-screen">
		<div class="hero-content text-center">
			<div class="bg-base-200 p-40 rounded-3xl opacity-90">
				<slot />
			</div>
		</div>
	</div>
</div>

<style>
	.image-background {
		background-image: url('https://macula.kelp.digital/ipfs/bafybeib5jwfwqu22pe27t4onzitfqodybk3t2ttfydjfibjqb24nyv3hki');
		background-size: cover;
		background-repeat: no-repeat;
		background-position: center center;
		background-attachment: fixed;
	}
</style>
