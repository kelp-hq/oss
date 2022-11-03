<script lang="ts">
	import { page } from '$app/stores';

	export let href: string;

	let classNames: string = '';
	export { classNames as class };
</script>

<a
	{href}
	id={$page.url.pathname.startsWith(href + '/') ? 'active-menu' : ''}
	class={`flex ${$page.url.pathname == href ? 'active' : ''} ${
		$page.url.pathname.startsWith(href + '/') ? 'active' : ''
	} ${classNames}`}
>
	<slot />
</a>
