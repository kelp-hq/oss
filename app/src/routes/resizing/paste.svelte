<script lang="ts">
	import { isNil } from 'ramda';

	import { onMount } from 'svelte';
	let src: string;

	onMount(() => {
		// https://w3c.github.io/clipboard-apis/#clipboard-event-api
		document.addEventListener('paste', (event) => {
			if (isNil(event.clipboardData)) {
				return;
			}

			const { items } = event.clipboardData;
			console.log(JSON.stringify(items)); // might give you mime types
			for (const index in items) {
				const item = items[index];

				if (item.kind === 'file') {
					const blob = item.getAsFile();
					const reader = new FileReader();

					reader.onloadstart = (event) => {
						console.log('onloadstart');
					};
					reader.onloadend = (event) => {
						console.log('onloadend');
					};
					reader.onerror = (event) => {
						console.log('onerror');
					};
					reader.onabort = (event) => {
						console.log('onabort');
					};
					reader.onload = (event) => {
						// console.log(event.target.result); // data url!
						src = event.target?.result as string;
					};
					//https://developer.mozilla.org/en-US/docs/Web/API/FileReader/progress_event
					reader.onprogress = (event) => {
						if (event.lengthComputable) {
							console.log('progress loaded %s from total %s', event.loaded, event.total);
						}
					};

					reader.readAsDataURL(blob as File);
				} else {
					console.log(
						'Got paste event with DataTransferItem kind %s and type %s',
						item.kind,
						item.type
					);
				}
			}
		});
	});
</script>

<div>
	<div class="bg-base-200 h-20 opacity-90 min-w-full align-middle items-center flex justify-center">
		<h1>Try to paste a screenshot here</h1>
	</div>
	{#if src}
		<img alt="Pasted text" class="p-10" {src} />
	{/if}
</div>
