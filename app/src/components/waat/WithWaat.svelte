<script lang="ts">
  import { polkadotAccountsStore } from '@kelp_digital/svelte-ui-components/polkadot/store';
  import { isNil } from 'ramda';
  import { onMount } from 'svelte';

  let modalOpened: boolean = false;

  onMount(() => {
    console.log('mounting the WAAT context');
    if (!isNil($polkadotAccountsStore.selectedAccount)) {
      console.log('trigger the auth calc', modalOpened, $polkadotAccountsStore.selectedAccount);
    }
  });

  $: {
    if (!isNil($polkadotAccountsStore.selectedAccount)) {
      console.log('trigger the auth calc', modalOpened, $polkadotAccountsStore.selectedAccount);
    }
  }
</script>

<div>
  <!-- The button to open modal -->
  <!-- <label for="createTokenModal" class="btn">open modal</label> -->

  <!-- Put this part before </body> tag -->
  <input type="checkbox" id="createTokenModal" bind:checked={modalOpened} class="modal-toggle" />
  <div class="modal modal-bottom sm:modal-middle">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Congratulations random Internet user!</h3>
      <p class="py-4">
        You've been selected for a chance to get one year of subscription to use Wikipedia for free!
      </p>
      <div class="modal-action">
        <button
          for="createTokenModal"
          class="btn"
          on:click={() => {
            modalOpened = !modalOpened;
          }}
        >
          Yay!
        </button>
      </div>
    </div>
  </div>
  <slot>loading</slot>
</div>
