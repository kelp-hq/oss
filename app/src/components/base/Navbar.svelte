<script>
	import AccountSelect from '../polkadotAccounts/AccountSelect.svelte';
</script>

<div class="navbar bg-base-100">
	<div class="navbar-start">
		<!-- svelte-ignore a11y-missing-attribute -->
		<a class="btn btn-ghost normal-case text-xl" href="/">Macula</a>
		<ul class="menu menu-horizontal p-0">
			<li><a href="/hosting">Hosting</a></li>
			<li><a href="/resizing">Resizing</a></li>
		</ul>
	</div>
	<div class="navbar-center">
		<!-- something here  -->
	</div>
	<div class="navbar-end">
		<AccountSelect />
	</div>
</div>
