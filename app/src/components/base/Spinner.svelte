<style>
.spinner-border {
  vertical-align: -0.125em;
  border: 0.25em solid;
  border-right-color: transparent;
}
.animate-spin {
  animation: spin 1s linear infinite;
}
.inline-block {
  display: inline-block;
}
.visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}
</style>

<script lang="ts">
export let color = 'purple';
</script>

<div class="p-4">
  <div class="flex justify-center items-center">
    <div
      class="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-{color}-500"
      role="status"
    >
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
</div>
