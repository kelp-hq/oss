<script lang="ts">
	import Spinner from '$lib/base/Spinner.svelte';
	import fetch from 'cross-fetch';
	import { isNil } from 'ramda';

	import { onMount } from 'svelte';

	import ExifReader from 'exifreader';
	import { pasteImageStore } from './store';

	import { dump as pixDump, insert as pixInsert, TagValues, type IExifElement } from 'exif-library';

	import { polkadotAccountsStore, signViaExtension } from '$lib/polkadotAccounts/store';
	import { isEmpty } from 'ramda';
	import { stringToHex } from '@polkadot/util';
	import type { ISubstratePayload } from '@kelp_digital/web3-api-auth-token';

	let loadingBlob: boolean = false;

	// let encrypt: boolean = false;
	/**
	 * WE keep our image here
	 */
	let canvasElement: HTMLCanvasElement;

	/**
	 * Canvas context
	 */
	let ctx: CanvasRenderingContext2D;

	async function uploadImage() {
		await convertImage();

		const { SubstrateStrategy } = await import('@kelp_digital/web3-api-auth-token');

		const tokenPayload: ISubstratePayload = {
			account: $polkadotAccountsStore.selectedAccount,
			network: 'anagolay',
			prefix: 42,
			exp: 6000
		};

		const t = new SubstrateStrategy(tokenPayload);
		const sig = await signViaExtension($polkadotAccountsStore.selectedAccount, await t.encode());
		const tokenWithHeader = await t.makeWithHeader(sig);

		const baseUrl = 'https://3000-kelpdigital-oss-rsg3ao46o68.ws-eu67.gitpod.io';
		const url = `${baseUrl}/ipfs_api/v0/add?stream-channels=true&cid-version=1&progress=false&pin=false`;

		const formData = new FormData();

		formData.append('file', new Blob([$pasteImageStore.imageBuffer]), 'screenshot-1.jpg');

		const res = await fetch(url, {
			method: 'POST',
			body: formData,
			headers: {
				...tokenWithHeader
			}
		});
		const addedCid = await res.json();
		alert(addedCid.Hash);
	}
	/**
	 * this is not deterministic, maybe the metadata is messing it up
	 * it is currently used just to have the metadata
	 */
	async function convertImage() {
		if (isEmpty($polkadotAccountsStore.selectedAccount)) {
			throw new Error('select the account');
		}

		// let utf8Decoder = new TextDecoder(); // default 'utf-8' or 'utf8'
		// let utf8Encoder = new TextEncoder(); // default 'utf-8' or 'utf8'

		const imageBuffer = await (await fetch($pasteImageStore.src)).arrayBuffer();
		$pasteImageStore.imageBuffer = imageBuffer;

		const base64Canvas = canvasElement.toDataURL('image/jpeg');

		const zeroth: IExifElement = {
			// [TagValues.ImageIFD.XPAuthor]: [
			// 	...utf8Encoder.encode(`urn:substrate:${$polkadotAccountsStore.selectedAccount}`)
			// ],
			[TagValues.ImageIFD.Copyright]: `urn:substrate:${$polkadotAccountsStore.selectedAccount}`,
			[TagValues.ImageIFD.Software]: 'Macula Screenshot'
			// [TagValues.ImageIFD.XPComment]: [...utf8Encoder.encode('')]
		};
		zeroth[TagValues.ImageIFD.ImageDescription] = $pasteImageStore.description;

		//// this doesn't work
		// check it here https://ipfs.anagolay.network/ipfs/QmdnJPZ9ExEvPPPX1WENnQ9hC9Ts5JZLrswBd5ndxY2G6h?filename=issue%20with%20the%20exif-readerfor%20macula.png
		// if (!isEmpty($pasteImageStore.title)) {
		// zeroth[TagValues.ImageIFD.XPSubject] = [...utf8Encoder.encode('$pasteImageStore.title')];
		// zeroth[TagValues.ImageIFD.XPSubject] = [...utf8Encoder.encode('titleee ✅⚒️🌶️🏗️😆😆')];
		// }

		const exif: IExifElement = {
			[TagValues.ExifIFD.DateTimeOriginal]: new Date().toUTCString()
		};

		const exifObj = { '0th': zeroth, Exif: exif };

		const exifStr = pixDump(exifObj);
		const inserted = pixInsert(exifStr, base64Canvas);

		console.log('exif size %s bytes', exifStr.length);

		const imageBufferInserted = await (await fetch(inserted)).arrayBuffer();

		// this is the jpeg bytes
		$pasteImageStore.imageBuffer = imageBufferInserted;

		console.log('image size %s bytes', imageBufferInserted.byteLength);

		const tagsInserted = ExifReader.load(imageBufferInserted);
		console.log('last tags', tagsInserted);

		// console.log(
		// 	'ExifREader [tags]',
		// 	tagsInserted,
		// 	utf8Decoder.decode(new Uint8Array(tagsInserted.XPTitle.value as any)),
		// 	tagsInserted.ImageDescription?.value[0],
		// 	// utf8Decoder.decode(new Uint8Array(tagsInserted.XPComment.value as any)),
		// 	tagsInserted.Copyright?.value[0]
		// );
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
			<div class="w-2/3  min-h-fit">
				<div class="h-full rounded-md">
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
						on:click={convertImage}>Show metadata</button
					>
					<button
						class="btn btn-primary"
						disabled={isEmpty($pasteImageStore.src)}
						on:click={uploadImage}>Upload</button
					>
				</div>
				<div class="w-full flex flex-col gap-4 items-center form-control">
					<textarea
						placeholder="add a description"
						class="w-full h-72 textarea text-xl focus:outline-0"
						bind:value={$pasteImageStore.description}
					/>
					<!-- <label class="label cursor-pointer w-full">
						<span class="label-text">Encrypt</span>
						<input type="checkbox" class="toggle" bind:checked={encrypt} />
					</label> -->
				</div>
			</div>
		</div>
	</div>
</div>
