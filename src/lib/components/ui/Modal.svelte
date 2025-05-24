<script lang="ts">
  export let open = false;
  export let title = '';
  export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      open = false;
    }
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      open = false;
    }
  }
</script>

{#if open}
  <div
    class="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50"
    on:click={handleBackdropClick}
    on:keydown={handleKeydown}
    role="dialog"
    aria-modal="true"
  >
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="w-full {sizes[size]} transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-xl transition-all">
        {#if title}
          <div class="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
          </div>
        {/if}
        <div class="px-6 py-4">
          <slot />
        </div>
      </div>
    </div>
  </div>
{/if}
