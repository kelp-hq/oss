<script lang="ts">
	import { isEmpty } from 'ramda';
	import { takeLast } from 'ramda';
	import { take } from 'ramda';
	import { isNil } from 'ramda';
	import type { ISubdomainDocument } from 'src/maculaApi';

	export let domain: ISubdomainDocument;
	let tippingEnabled: boolean = false;
	let saving: boolean = false;

	function makeSubdomainLink(subdomain: string) {
		return `https://${subdomain}.macula.link`;
	}

	function makeVersionLink(versionCid: string) {
		return `https://${versionCid}.on.macula.link`;
	}

	/**
	 * Truncate the value showing first X and last Y joined with the `...`
	 * @param value -
	 */
	function truncate(value: string): string | boolean {
		if (isNil(value) || isEmpty(value)) {
			return false;
		}
		// take first 7
		const start = take(7, value);

		// and take last 7
		const end = takeLast(7, value);

		return `${start}...${end}`;
	}

	function toggleTipping() {
		tippingEnabled = !tippingEnabled;
		console.log('enable tipping', tippingEnabled);
		saving = true;
		setTimeout(() => {
			saving = false;
		}, 1000);
	}
</script>

<div class="card bg-base-100">
	<div class="card-body">
		<span class="card-title">
			<a rel="noreferrer" href={makeSubdomainLink(domain.subdomain)} class="link" target="_blank">
				{makeSubdomainLink(domain.subdomain)}
			</a>
			<div class="tooltip" data-tip="Verified">
				<div class="badge badge-success" />
			</div>
		</span>
		<!-- TIPPING PART -->
		<label class="cursor-pointer label">
			<div class="flex flex-row content-start items-center w-full text-start">
				<span class="text flex-1">Tipping</span>
				<div class="tooltip" data-tip="By enabling this, you will be able to recieve tokens.">
					<input
						type="checkbox"
						class="toggle toggle-primary {saving && 'animate-pulse'}"
						indeterminate={saving}
						on:change={toggleTipping}
						disabled={saving}
						bind:checked={tippingEnabled}
					/>
				</div>
			</div>
		</label>
		<!-- TIPPING PART -->
		<div class="divider" />
		<!-- VERSIONS PART -->
		<div class="flex flex-col gap-2">
			<span class="text-lg">Latest versions:</span>
			<div class="overflow-x-auto w-full">
				<table class="table table-zebra w-full">
					<thead>
						<tr>
							<th>cid</th>
							<th>Created</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each domain.cids as { cid, createdAt }}
							<tr>
								<td>
									<div class="flex items-center space-x-3">
										<div class="avatar">
											<div class="mask mask-circle w-12 h-12 bg-success" />
										</div>
										<div>
											<div class="font-bold">
												<a rel="noreferrer" href={makeVersionLink(cid)} target="_blank" class="">
													{truncate(cid)}
												</a>
											</div>
										</div>
									</div>
								</td>
								<td>
									{new Date(createdAt).toLocaleTimeString()} @
									{new Date(createdAt).toDateString()}
								</td>
								<th>
									<button class="btn btn-ghost btn-xs">details</button>
								</th>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
		<!-- VERSIONS PART -->
	</div>
</div>
