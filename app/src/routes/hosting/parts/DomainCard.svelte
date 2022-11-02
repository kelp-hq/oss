<script lang="ts">
	import type { ISubdomainDocument } from 'src/maculaApi';

	export let domain: ISubdomainDocument;
</script>

<div class="">
	<div class="card bg-primary">
		<div class="card-body">
			<span class="card-title">My Domain</span>
			<pre>{JSON.stringify(domain, null, 2)}</pre>
		</div>
	</div>
</div>
