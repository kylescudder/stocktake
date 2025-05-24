<script lang="ts">
  export let value = '';
  export let type = 'text';
  export let placeholder = '';
  export let label = '';
  export let error = '';
  export let required = false;
  export let disabled = false;
</script>

<div class="space-y-1">
  {#if label}
    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      {#if required}<span class="text-red-500">*</span>{/if}
    </label>
  {/if}
  <input
    bind:value
    {type}
    {placeholder}
    {required}
    {disabled}
    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm {error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}"
    on:input
    on:change
    on:blur
    {...$$restProps}
  />
  {#if error}
    <p class="text-sm text-red-600 dark:text-red-400">{error}</p>
  {/if}
</div>
