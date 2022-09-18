import { get, writable } from 'svelte/store';
export interface IPasteStoreInterface {
	src: string;
	imageBuffer: ArrayBuffer;
	title: string;
	description: string;
	encrypt: boolean;
	height: number;
	width: number;
}

function PasteImageStoreFn() {
	const defaultState: IPasteStoreInterface = {
		src: '',
		imageBuffer: new Uint8Array(),
		title: '',
		description: '',
		encrypt: false,
		width: 0,
		height: 0
	};
	const { update, subscribe, set } = writable<IPasteStoreInterface>(defaultState);
	return {
		subscribe,
		set,
		update,
		reset: () => set(defaultState)
	};
}

/**
 * Main store for this route
 */
export const pasteImageStore = PasteImageStoreFn();
