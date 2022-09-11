<script lang="ts">
	import Spinner from '$lib/base/Spinner.svelte';
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	import { isNil } from 'ramda';

	import { onMount } from 'svelte';
	import { calculateCid } from '../../utils/helpers';

	import { pasteImageStore } from './store';
	import ExifReader from 'exifreader';

	import { isEmpty } from 'ramda';
	import { addFileViaContent } from './utils';

	let loadingBlob: boolean = false;

	let encrypt: boolean = false;

	async function uploadBlob() {
		var uint8View = new Uint8Array($pasteImageStore.imageBuffer);
		const cid = await calculateCid(uint8View);

		const ipfsUpload = await addFileViaContent(uint8View, {});
		console.log('cid', cid);
		console.log('ipfs-c dis', ipfsUpload);
	}

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
						loadingBlob = true;
					};
					reader.onloadend = (event) => {
						console.log('onloadend');
						setTimeout(() => {
							loadingBlob = false;
						}, 500);
					};
					reader.onerror = (event) => {
						console.log('onerror');
					};
					reader.onabort = (event) => {
						console.log('onabort');
						loadingBlob = false;
					};
					reader.onload = async (event) => {
						// console.log(event.target.result); // data url!
						const src = event.target?.result as string;
						$pasteImageStore.src = src;
						const imageBuffer = await (await fetch(src)).arrayBuffer();
						$pasteImageStore.imageBuffer = imageBuffer;

						const tags = ExifReader.load(imageBuffer);
						console.log('tags', tags);
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
	{#if !$pasteImageStore.src}
		<div
			class="bg-base-300 h-20 opacity-90 min-w-full align-middle items-center flex justify-center"
			transition:fade={{ delay: 650, duration: 300, easing: cubicOut }}
		>
			<h1>Try to paste a screenshot here</h1>
		</div>
	{/if}
	<div class="flex flex-row py-2 gap-2">
		<div class="w-2/3 min-h-24 bg-base-100">
			<div class="h-full flex flex-col items-center justify-center">
				{#if loadingBlob}
					<Spinner />
				{/if}

				{#if $pasteImageStore.src && !loadingBlob}
					<img alt="Pasted content" src={$pasteImageStore.src} />
				{/if}
			</div>
		</div>
		<div class="w-1/3 flex flex-col gap-4 items-center">
			<div class="w-full flex flex-col gap-4 items-center form-control">
				<input type="text" placeholder="Title" class="input w-full" />
				<textarea placeholder="Description" class="w-full textarea" />
				<label class="label cursor-pointer w-full">
					<span class="label-text">Encrypt</span>
					<input type="checkbox" class="toggle" bind:checked={encrypt} />
				</label>
			</div>
			<div class="w-full flex justify-between mt-4">
				<button class="btn btn-ghost btn-outline normal-case">Cancel</button>
				<button
					class="btn btn-primary"
					disabled={isEmpty($pasteImageStore.src)}
					on:click={uploadBlob}>Upload</button
				>
			</div>
		</div>
	</div>
</div>
