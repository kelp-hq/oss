<script>
	// import PolkadotAccounts from '@kelp_digital/svelte-ui-components/polkadot/Accounts.svelte';
	import PolkadotAccounts from '$lib/polkadot/Accounts.svelte';
	import { appStore } from 'src/appStore';
	import Link from './Link.svelte';
	import ThemeChange from './ThemeChange.svelte';
</script>

<div class="navbar shadow">
	<div class="navbar-start">
		<!-- svelte-ignore a11y-missing-attribute -->
		<Link class="btn btn-ghost normal-case text-xl " href="/">Macula</Link>
		<ul class="menu menu-horizontal p-0 gap-2">
			<li><Link href="/hosting">Hosting</Link></li>
			<li><Link href="/resizing">Resizing</Link></li>
			<li><Link href="/drive">Drive</Link></li>
		</ul>
	</div>
	<div class="navbar-center" />
	<div class="navbar-end gap-2 items-end justify-end">
		<ul class="menu menu-horizontal p-0">
			<li><Link href="/docs">Docs</Link></li>
		</ul>
		<ThemeChange />
		<PolkadotAccounts tokenGenerationFunction={appStore.generateToken} />
	</div>
</div>
