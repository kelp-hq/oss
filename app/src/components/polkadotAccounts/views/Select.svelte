<script lang="ts">
	import { polkadotAccounts } from '../store';
</script>

<select
	class="form-select form-select-lg mb-3  appearance-none
  block
  px-4
  py-2
  text-xl
  font-normal
  text-gray-700
  bg-white bg-clip-padding bg-no-repeat
  border border-solid border-gray-300
  rounded
  transition
  ease-in-out
  m-0
  focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none select select-bordered select-lg w-full max-w-xs"
>
	<option disabled selected>Account </option>
	{#each $polkadotAccounts.injectedAccounts as account}
		<option value={account.address}>{account.meta.name}</option>
	{/each}
</select>
