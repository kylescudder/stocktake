<script lang="ts">
  import { theme } from '$lib/stores/theme';
  import { Sun, Moon, Bell } from 'lucide-svelte';

  function toggleTheme() {
    theme.toggle();
  }
</script>

<header class="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
  <div class="flex h-full items-center justify-between px-6">
    <div class="flex-1">
      <!-- Breadcrumbs or page title can go here -->
    </div>
    
    <div class="flex items-center space-x-4">
      <button
        on:click={toggleTheme}
        class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md"
      >
        {#if $theme === 'dark'}
          <Sun class="w-5 h-5" />
        {:else}
          <Moon class="w-5 h-5" />
        {/if}
      </button>
      
      <button class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md">
        <Bell class="w-5 h-5" />
      </button>
    </div>
  </div>
</header>
