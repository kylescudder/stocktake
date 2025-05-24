<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import { Package, Warehouse, AlertTriangle, TrendingUp } from 'lucide-svelte';

  let stats = {
    totalProducts: 0,
    totalWarehouses: 0,
    lowStockItems: 0,
    totalMovements: 0
  };
  let loading = true;
  let lowStockItems: any[] = [];
  let recentMovements: any[] = [];

  onMount(async () => {
    try {
      const [products, warehouses, lowStock, movements] = await Promise.all([
        api.getProducts({ limit: '1' }),
        api.getWarehouses(),
        api.getLowStockReport(),
        api.getStockMovements({ limit: '5' })
      ]);

      stats = {
        totalProducts: products.total || 0,
        totalWarehouses: warehouses.length || 0,
        lowStockItems: lowStock.length || 0,
        totalMovements: movements.total || 0
      };

      lowStockItems = lowStock.slice(0, 5);
      recentMovements = movements.movements || [];
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      loading = false;
    }
  });
</script>

<div class="space-y-6">
  <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

  <!-- Stats Grid -->
  <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
    <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
      <div class="p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <Package class="h-6 w-6 text-gray-400" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                Total Products
              </dt>
              <dd class="text-lg font-medium text-gray-900 dark:text-white">
                {loading ? '...' : stats.totalProducts}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
      <div class="p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <Warehouse class="h-6 w-6 text-gray-400" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                Warehouses
              </dt>
              <dd class="text-lg font-medium text-gray-900 dark:text-white">
                {loading ? '...' : stats.totalWarehouses}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
      <div class="p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <AlertTriangle class="h-6 w-6 text-red-400" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                Low Stock Alerts
              </dt>
              <dd class="text-lg font-medium text-red-600">
                {loading ? '...' : stats.lowStockItems}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
      <div class="p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <TrendingUp class="h-6 w-6 text-green-400" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                Total Movements
              </dt>
              <dd class="text-lg font-medium text-gray-900 dark:text-white">
                {loading ? '...' : stats.totalMovements}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Content Grid -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Low Stock Items -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          Low Stock Alerts
        </h3>
        <div class="mt-5">
          {#if loading}
            <p class="text-gray-500 dark:text-gray-400">Loading...</p>
          {:else if lowStockItems.length === 0}
            <p class="text-gray-500 dark:text-gray-400">No low stock items</p>
          {:else}
            <div class="space-y-3">
              {#each lowStockItems as item}
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {item.product?.name}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {item.warehouse?.name}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-medium text-red-600">
                      {item.quantity} / {item.reorderPoint}
                    </p>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Recent Movements -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          Recent Movements
        </h3>
        <div class="mt-5">
          {#if loading}
            <p class="text-gray-500 dark:text-gray-400">Loading...</p>
          {:else if recentMovements.length === 0}
            <p class="text-gray-500 dark:text-gray-400">No recent movements</p>
          {:else}
            <div class="space-y-3">
              {#each recentMovements as movement}
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {movement.product?.name}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {movement.type} • {movement.quantity} units
                    </p>
                  </div>
                  <div class="text-right">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {
                      movement.type === 'IN' ? 'bg-green-100 text-green-800' :
                      movement.type === 'OUT' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }">
                      {movement.type}
                    </span>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
