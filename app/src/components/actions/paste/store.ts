/* eslint-disable @typescript-eslint/no-explicit-any */
import { writable } from 'svelte/store';
export interface IPasteStoreInterface {
  src: string;
  imageBuffer: ArrayBuffer;
  title: string;
  description: string;
  encrypt: boolean;
  height: number;
  width: number;
}

function pasteImageStoreFn(): any {
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
export const pasteImageStore: any = pasteImageStoreFn();
