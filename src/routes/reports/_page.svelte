<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import Button from '$lib/components/ui/Button.svelte';
  import { Download, TrendingDown, BarChart3, Activity, AlertTriangle } from 'lucide-svelte';
  import { format } from 'date-fns';

  let lowStockReport: any[] = [];
  let stockValueReport: any[] = [];
  let movementSummary: any[] = [];
  let loading = {
    lowStock: true,
    stockValue: true,
    movementSummary: true
  };

  // Filter states
  let selectedWarehouse = '';
  let startDate = format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
  let endDate = format(new Date(), 'yyyy-MM-dd');
  let warehouses: any[] = [];

  onMount(async () => {
    await loadWarehouses();
    await Promise.all([
      loadLowStockReport(),
      loadStockValueReport(),
      loadMovementSummary()
    ]);
  });

  async function loadWarehouses() {
    try {
      warehouses = await api.getWarehouses();
    } catch (error) {
      console.error('Failed to load warehouses:', error);
    }
  }

  async function loadLowStockReport() {
    loading.lowStock = true;
    try {
      lowStockReport = await api.getLowStockReport();
    } catch (error) {
      console.error('Failed to load low stock report:', error);
    } finally {
      loading.lowStock = false;
    }
  }

  async function loadStockValueReport() {
    loading.stockValue = true;
    try {
      stockValueReport = await api.getStockValueReport(selectedWarehouse);
    } catch (error) {
      console.error('Failed to load stock value report:', error);
    } finally {
      loading.stockValue = false;
    }
  }

  async function loadMovementSummary() {
    loading.movementSummary = true;
    try {
      movementSummary = await api.getMovementSummary(startDate, endDate);
    } catch (error) {
      console.error('Failed to load movement summary:', error);
    } finally {
      loading.movementSummary = false;
    }
  }

  function exportCSV(data: any[], filename: string) {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  function getMovementTypeColor(type: string) {
    switch (type) {
      case 'IN': return 'bg-green-100 text-green-800';
      case 'OUT': return 'bg-red-100 text-red-800';
      case 'TRANSFER': return 'bg-blue-100 text-blue-800';
      case 'ADJUSTMENT': return 'bg-yellow-100 text-yellow-800';
      case 'RETURN': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  $: {
    if (selectedWarehouse !== undefined) {
      loadStockValueReport();
    }
  }

  $: {
    if (startDate && endDate) {
      loadMovementSummary();
    }
  }
</script>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
  </div>

  <!-- Quick Stats Cards -->
  <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
    <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
      <div class="p-5">
        <div class="flex items-center">
          <div class="shrink-0">
            <AlertTriangle class="h-6 w-6 text-red-400" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                Low Stock Items
              </dt>
              <dd class="text-lg font-medium text-red-600">
                {loading.lowStock ? '...' : lowStockReport.length}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
      <div class="p-5">
        <div class="flex items-center">
          <div class="shrink-0">
            <BarChart3 class="h-6 w-6 text-blue-400" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                Total Warehouses
              </dt>
              <dd class="text-lg font-medium text-gray-900 dark:text-white">
                {loading.stockValue ? '...' : stockValueReport.length}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
      <div class="p-5">
        <div class="flex items-center">
          <div class="shrink-0">
            <Activity class="h-6 w-6 text-green-400" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                Period Movements
              </dt>
              <dd class="text-lg font-medium text-gray-900 dark:text-white">
                {loading.movementSummary ? '...' : movementSummary.reduce((sum, item) => sum + item.count, 0)}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
      <div class="p-5">
        <div class="flex items-center">
          <div class="shrink-0">
            <TrendingDown class="h-6 w-6 text-yellow-400" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                Units Moved
              </dt>
              <dd class="text-lg font-medium text-gray-900 dark:text-white">
                {loading.movementSummary ? '...' : movementSummary.reduce((sum, item) => sum + item.totalQuantity, 0).toLocaleString()}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Low Stock Report -->
  <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white">Low Stock Alert</h3>
      <Button 
        variant="secondary" 
        size="sm" 
        on:click={() => exportCSV(lowStockReport, 'low-stock-report')}
        disabled={lowStockReport.length === 0}
      >
        <Download class="w-4 h-4 mr-2" />
        Export CSV
      </Button>
    </div>
    
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Product
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Warehouse
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Current Stock
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Reorder Point
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Reorder Quantity
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {#if loading.lowStock}
            <tr>
              <td colspan="5" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                Loading...
              </td>
            </tr>
          {:else if lowStockReport.length === 0}
            <tr>
              <td colspan="5" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                No low stock items found
              </td>
            </tr>
          {:else}
            {#each lowStockReport as item}
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {item.product?.name}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {item.warehouse?.name}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                  {item.quantity}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {item.reorderPoint}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {item.reorderQuantity}
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Stock Value Report -->
  <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
      <div class="flex items-center space-x-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">Stock Value by Warehouse</h3>
        <div>
          <select
            bind:value={selectedWarehouse}
            class="rounded-md border-gray-300 shadow-xs focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="">All Warehouses</option>
            {#each warehouses as warehouse}
              <option value={warehouse._id}>{warehouse.name}</option>
            {/each}
          </select>
        </div>
      </div>
      <Button 
        variant="secondary" 
        size="sm" 
        on:click={() => exportCSV(stockValueReport, 'stock-value-report')}
        disabled={stockValueReport.length === 0}
      >
        <Download class="w-4 h-4 mr-2" />
        Export CSV
      </Button>
    </div>
    
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Warehouse
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Total Items
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Unique Products
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {#if loading.stockValue}
            <tr>
              <td colspan="3" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                Loading...
              </td>
            </tr>
          {:else if stockValueReport.length === 0}
            <tr>
              <td colspan="3" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                No data found
              </td>
            </tr>
          {:else}
            {#each stockValueReport as item}
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {item.warehouseName}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {item.totalItems.toLocaleString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {item.uniqueProducts}
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Movement Summary -->
  <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
      <div class="flex items-center space-x-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">Movement Summary</h3>
        <div class="flex space-x-2">
          <input
            type="date"
            bind:value={startDate}
            class="rounded-md border-gray-300 shadow-xs focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
          />
          <input
            type="date"
            bind:value={endDate}
            class="rounded-md border-gray-300 shadow-xs focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
          />
        </div>
      </div>
      <Button 
        variant="secondary" 
        size="sm" 
        on:click={() => exportCSV(movementSummary, 'movement-summary')}
        disabled={movementSummary.length === 0}
      >
        <Download class="w-4 h-4 mr-2" />
        Export CSV
      </Button>
    </div>
    
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Date
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Type
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Count
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Total Quantity
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {#if loading.movementSummary}
            <tr>
              <td colspan="4" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                Loading...
              </td>
            </tr>
          {:else if movementSummary.length === 0}
            <tr>
              <td colspan="4" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                No movements found for the selected period
              </td>
            </tr>
          {:else}
            {#each movementSummary as item}
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {format(new Date(item._id.date), 'MMM dd, yyyy')}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getMovementTypeColor(item._id.type)}">
                    {item._id.type}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {item.count}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {item.totalQuantity.toLocaleString()}
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>
</div>
