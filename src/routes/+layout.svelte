<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { auth } from '$lib/stores/auth';
  import { theme } from '$lib/stores/theme';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import Header from '$lib/components/Header.svelte';

  onMount(() => {
    auth.init();
    theme.init();
  });

  $: isAuthPage = $page.url.pathname === '/login' || $page.url.pathname === '/register';
  
  // Handle navigation only on the client side
  $: if (browser) {
    if (!$auth.isAuthenticated && !isAuthPage) {
      goto('/login');
    } else if ($auth.isAuthenticated && isAuthPage) {
      goto('/dashboard');
    }
  }
</script>

{#if $auth.isAuthenticated && !isAuthPage}
  <div class="flex h-screen bg-gray-50 dark:bg-gray-900">
    <Sidebar />
    <div class="flex-1 flex flex-col">
      <Header />
      <main class="flex-1 overflow-auto p-6">
        <slot />
      </main>
    </div>
  </div>
{:else}
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <slot />
  </div>
{/if}
