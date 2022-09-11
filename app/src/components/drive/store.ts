import { get, writable } from 'svelte/store';

export interface IPasteStoreInterface {
	src: string;
	imageBuffer: ArrayBuffer;
	title?: string;
	description?: string;
	encrypt: boolean;
}

function PasteImageStoreFn() {
	const defaultState: IPasteStoreInterface = {
		src: '',
		imageBuffer: new Uint8Array(),
		title: undefined,
		description: undefined,
		encrypt: false
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
