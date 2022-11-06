<script>
  import { onMount } from 'svelte';

  onMount(() => {
    console.log('mounting the WAAT context');
  });
</script>

<div title="WAAT context">
  <slot>loading</slot>
</div>
