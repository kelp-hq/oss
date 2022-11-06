<script lang="ts">
  /**
   * any class name
   */
  let classNames = '';

  export { classNames as class };

  export let style = '';

  /**
   * @remark
   * This is the ligature of the material icon that you load via link tag
   */
  export let iconName: string;

  /**
   * HTML title
   */
  export let title = '';
</script>

<span {title} {style} class="material-icons {classNames}">{iconName}</span>
