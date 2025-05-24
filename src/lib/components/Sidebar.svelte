<script lang="ts">
  import { page } from '$app/stores';
  import { auth } from '$lib/stores/auth';
  import { 
    Home, 
    Package, 
    Warehouse, 
    BarChart3, 
    TrendingUp, 
    FileText,
    Settings,
    LogOut
  } from 'lucide-svelte';

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Warehouses', href: '/warehouses', icon: Warehouse },
    { name: 'Inventory', href: '/inventory', icon: BarChart3 },
    { name: 'Stock Movements', href: '/movements', icon: TrendingUp },
    { name: 'Reports', href: '/reports', icon: FileText },
  ];

  function logout() {
    auth.logout();
  }
</script>

<div class="flex h-full w-64 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
  <div class="flex h-16 items-center px-6 border-b border-gray-200 dark:border-gray-700">
    <h1 class="text-xl font-bold text-gray-900 dark:text-white">StockTake</h1>
  </div>
  
  <nav class="flex-1 space-y-1 px-3 py-4">
    {#each navigation as item}
      <a
        href={item.href}
        class="group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors {
          $page.url.pathname.startsWith(item.href)
            ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }"
      >
        <svelte:component this={item.icon} class="w-5 h-5 mr-3" />
        {item.name}
      </a>
    {/each}
  </nav>

  <div class="border-t border-gray-200 dark:border-gray-700 p-4">
    <div class="flex items-center justify-between">
      <div class="text-sm text-gray-900 dark:text-white">
        {$auth.user?.name}
      </div>
      <button
        on:click={logout}
        class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <LogOut class="w-4 h-4" />
      </button>
    </div>
  </div>
</div>
