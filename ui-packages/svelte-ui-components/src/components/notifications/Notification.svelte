<script lang="ts">
  import { fade } from 'svelte/transition';
  import Icon from 'svelte-awesome/components/Icon.svelte';
  import CloseIcon from 'svelte-awesome/icons/close';

  import CircleSpinner from './CircleSpinner.svelte';
  import type { INotification } from './store';

  let classNames = '';
  export { classNames as class };

  export let infoLevel: 'info' | 'success' | 'warning' | 'error' = 'info';

  export let data: INotification;

  $: disableButton = data.showSpinner;
</script>

{#if infoLevel === 'info'}
  <div class="info base-notification-styles {classNames}" transition:fade>
    <div>
      {#if data.showSpinner}
        <CircleSpinner />
      {/if}
      <span>{data.text}</span>
    </div>
    {#if !data.showSpinner}
      <button on:click={data.closeFn}>
        <Icon data={CloseIcon} />
      </button>
    {/if}
  </div>
{:else if infoLevel === 'warning'}
  <div class="warning base-notification-styles {classNames}" transition:fade>
    <div>
      {#if data.showSpinner}
        <CircleSpinner />
      {/if}
      <span>{data.text}</span>
    </div>
    {#if !data.showSpinner}
      <button on:click={data.closeFn}>
        <Icon data={CloseIcon} />
      </button>
    {/if}
  </div>
{:else if infoLevel === 'success'}
  <div class="success base-notification-styles {classNames}" transition:fade>
    <div>
      {#if data.showSpinner}
        <CircleSpinner />
      {/if}
      <span>{data.text}</span>
    </div>
    {#if !data.showSpinner}
      <button on:click={data.closeFn}>
        <Icon data={CloseIcon} />
      </button>
    {/if}
  </div>
{:else if infoLevel === 'error'}
  <div class="error base-notification-styles {classNames}" transition:fade>
    <div>
      {#if data.showSpinner}
        <CircleSpinner />
      {/if}
      <span>{data.text}</span>
    </div>
    {#if !data.showSpinner}
      <button on:click={data.closeFn}>
        <Icon data={CloseIcon} />
      </button>
    {/if}
  </div>
{/if}

<!-- this should work test it -->
<style lang="postcss">
  .info {
    @apply alert alert-info;
  }
  .success {
    @apply alert alert-success;
  }
  .warning {
    @apply alert alert-warning;
  }

  .error {
    @apply alert alert-error;
  }

  .base-notification-styles {
    @apply shadow-lg fixed w-fit bottom-7 right-7;
  }
</style>
