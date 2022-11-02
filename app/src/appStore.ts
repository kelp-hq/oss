import { browser } from '$app/environment';
import { writable } from 'svelte/store';
function appStoreFn() {
	let token: string = '';

	if (browser) {
		token = window.localStorage.getItem('waat') || '';
	}

	const defaultState = {
		token,
		tokenHeader: {
			Authorization: `Bearer ${token}`
		}
	};

	const { subscribe, set, update } = writable(defaultState);

	return {
		subscribe,
		set,
		update
	};
}

export const appStore = appStoreFn();
