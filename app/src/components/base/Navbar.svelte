<script>
	// import AccountSelect from '../polkadotAccounts1/AccountSelect.svelte';
	import PolkadotAccounts from '../polkadotAccounts/PolkadotAccounts.svelte';
	import ThemeChange from './ThemeChange.svelte';
</script>

<div class="navbar shadow">
	<div class="navbar-start">
		<!-- svelte-ignore a11y-missing-attribute -->
		<a class="btn btn-ghost normal-case text-xl" href="/">Macula</a>
		<ul class="menu menu-horizontal p-0">
			<li><a href="/hosting">Hosting</a></li>
			<li><a href="/resizing">Resizing</a></li>
			<li><a href="/drive">Drive</a></li>
		</ul>
	</div>
	<div class="navbar-center" />
	<div class="navbar-end gap-2">
		<ThemeChange />
		<!-- <AccountSelect /> -->
		<PolkadotAccounts />
	</div>
</div>
