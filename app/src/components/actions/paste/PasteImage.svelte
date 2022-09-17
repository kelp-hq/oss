<script lang="ts">
	import Spinner from '$lib/base/Spinner.svelte';
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	import { isNil } from 'ramda';

	import { onMount } from 'svelte';
	import { calculateCid } from '../../../utils/helpers';

	import { pasteImageStore } from './store';
	import ExifReader from 'exifreader';

	import Pix from 'piexifjs';

	import { isEmpty } from 'ramda';
	import { polkadotAccounts } from '$lib/polkadotAccounts/store';

	let loadingBlob: boolean = false;

	let encrypt: boolean = false;
	/**
	 * WE keep our image here
	 */
	let canvasElement: HTMLCanvasElement;

	let ctx: CanvasRenderingContext2D;

	interface SizedEvent {
		width: number;
		height: number;
	}

	async function uploadBlob() {
		var uint8View = new Uint8Array($pasteImageStore.imageBuffer);
		const cid = await calculateCid(uint8View);

		console.log('cid', cid);
	}

	async function showMetadata() {
		let utf8Decoder = new TextDecoder(); // default 'utf-8' or 'utf8'
		let utf8Encoder = new TextEncoder(); // default 'utf-8' or 'utf8'

		const imageBuffer = await (await fetch($pasteImageStore.src)).arrayBuffer();
		$pasteImageStore.imageBuffer = imageBuffer;

		const tags = ExifReader.load(imageBuffer);
		console.log('ExifREader [tags]', tags);

		// var imageData = ctx.getImageData(0, 0, $pasteImageStore.width, $pasteImageStore.height);
		// var buffer = imageData.data.buffer; // ArrayBuffer

		// console.log('buffer', buffer);
		// const base64Canvas = canvasElement.toDataURL("image/jpeg").split(';base64,')[1];
		const base64Canvas = canvasElement.toDataURL('image/jpeg');
		var zeroth = {};

		var exif = {};
		// exif[Pix.ImageIFD.XPTitle] = new Array(new TextEncoder().encode('adsadas'));
		zeroth[Pix.ImageIFD.XPTitle] = [...utf8Encoder.encode($pasteImageStore.title)];
		zeroth[Pix.ImageIFD.ImageDescription] = $pasteImageStore.description;
		zeroth[Pix.ImageIFD.XPComment] = [...utf8Encoder.encode('comment')];
		zeroth[Pix.ImageIFD.Copyright] = `urn:substrate:${$polkadotAccounts.selectedAccount}`;
		zeroth[Pix.ImageIFD.Software] = 'Macula Screenshot';
		exif[Pix.ExifIFD.DateTimeOriginal] = new Date().toUTCString();

		var exifObj = { '0th': zeroth, Exif: exif };

		var exifStr = Pix.dump(exifObj);
		var inserted = Pix.insert(exifStr, base64Canvas);

		// const pp = Pix.load(inserted);
		// console.log('pp', pp, inserted);

		const imageBufferInserted = await (await fetch(inserted)).arrayBuffer();
		const tagsInserted = ExifReader.load(imageBufferInserted);
		console.log(
			'ExifREader [tags]',
			tagsInserted,
			utf8Decoder.decode(new Uint8Array(tagsInserted.XPTitle.value as any)),
			tagsInserted.ImageDescription?.value[0],
			utf8Decoder.decode(new Uint8Array(tagsInserted.XPComment.value as any)),
			tagsInserted.Copyright?.value[0]
		);
	}
	function isSizedEvent(e: any): e is SizedEvent {
		return e && e.width !== undefined && e.height !== undefined;
	}

	onMount(() => {
		// canvas is mounted here
		ctx = canvasElement.getContext('2d') as CanvasRenderingContext2D;

		// https://w3c.github.io/clipboard-apis/#clipboard-event-api
		document.addEventListener('paste', (event) => {
			if (isNil(event.clipboardData)) {
				return;
			}

			const { items } = event.clipboardData;
			console.log(JSON.stringify(items)); // might give you mime types
			for (const index in items) {
				const item = items[index];

				var img = new Image();

				// Once the image loads, render the img on the canvas
				img.onload = function (this: any) {
					// Update dimensions of the canvas with the dimensions of the image
					canvasElement.width = this.width;
					canvasElement.height = this.height;

					$pasteImageStore.width = this.width;
					$pasteImageStore.height = this.height;

					// Draw the image
					ctx.drawImage(img, 0, 0);

					// canvasElement.toDataURL(imageFormat || 'image/png'));
					canvasElement.toDataURL('image/jpeg');
				};

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
						// add the src to the image so we can render the canvas
						img.src = src;
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

<div class="p-10 container mx-auto">
	<div class="flex flex-col">
		<input
			type="text"
			placeholder="Give your screenshot a title ..."
			class="px-0 input input-ghost focus:outline-0 bg-transparent w-full h-12 text-2xl italic font-bold mb-6"
			bind:value={$pasteImageStore.title}
		/>
		{#if loadingBlob}
			<Spinner />
		{/if}
		<div class="flex flex-row gap-6">
			<div class="w-2/3 min-h-24">
				<div class="h-full flex flex-col items-center justify-center rounded-md">
					<!-- IMAGE IS HERE  -->
					<!-- {#if $pasteImageStore.src && !loadingBlob}
						<img class="rounded-md" alt="Pasted content" src={$pasteImageStore.src} />
					{/if} -->
					<canvas bind:this={canvasElement} class="bg-base-300 w-full" />
				</div>
			</div>
			<!-- SIDE BAR -->
			<div class="w-1/3 flex flex-col gap-4 items-center">
				<div class="w-full flex justify-between">
					<button class="btn btn-outline normal-case btn-accent">Cancel</button>
					<button
						class="btn btn-ghost btn-outline normal-case btn-secondary"
						on:click={showMetadata}>Show metadata</button
					>
					<button
						class="btn btn-primary"
						disabled={isEmpty($pasteImageStore.src)}
						on:click={uploadBlob}>Upload</button
					>
				</div>
				<div class="w-full flex flex-col gap-4 items-center form-control">
					<textarea
						placeholder="add a description"
						class="w-full h-72 textarea text-xl focus:outline-0"
						bind:value={$pasteImageStore.description}
					/>
					<label class="label cursor-pointer w-full">
						<span class="label-text">Encrypt</span>
						<input type="checkbox" class="toggle" bind:checked={encrypt} />
					</label>
				</div>
			</div>
		</div>
	</div>
</div>
