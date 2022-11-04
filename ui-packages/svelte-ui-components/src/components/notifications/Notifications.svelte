<script>
	import { onMount } from 'svelte';
	import Notification from './Notification.svelte';
	import { notificationsStore } from './store';

	onMount(() => {
		console.log('mounting Notifications');
	});
</script>

<div class="stack" style="display: block;">
	{#each $notificationsStore as a}
		<Notification infoLevel={a.infoLevel} data={a} />
	{/each}
</div>
