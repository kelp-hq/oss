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

  let notificationsCss: string;

  $: notificationsCss = `alert-${infoLevel}`;
</script>

{#if infoLevel === 'info'}
  <div class="alert alert-info shadow-lg fixed w-fit bottom-7 right-7 {classNames}" transition:fade>
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
  <div class="alert alert-warning shadow-lg fixed w-fit bottom-7 right-7 {classNames}" transition:fade>
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
  <div
    class="alert {notificationsCss} alert-success shadow-lg fixed w-fit bottom-7 right-7 {classNames}"
    transition:fade
  >
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
  <div
    class="alert {notificationsCss} alert-error shadow-lg fixed w-fit bottom-7 right-7 {classNames}"
    transition:fade
  >
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
