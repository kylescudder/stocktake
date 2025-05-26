<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import { Search, AlertTriangle, Package, Plus, Minus } from 'lucide-svelte';

  let inventory: any[] = [];
  let products: any[] = [];
  let warehouses: any[] = [];
  let loading = true;
  let selectedWarehouse = '';
  let selectedProduct = '';
  let lowStockOnly = false;
  let showAdjustModal = false;
  let selectedItem: any = null;

  // Adjustment form
  let adjustmentData = {
    actualQuantity: 0,
    reason: ''
  };

  onMount(async () => {
    await Promise.all([loadInventory(), loadProducts(), loadWarehouses()]);
  });

  async function loadInventory() {
    loading = true;
    try {
      const params: Record<string, string> = {};
      if (selectedWarehouse) params.warehouse = selectedWarehouse;
      if (selectedProduct) params.product = selectedProduct;
      if (lowStockOnly) params.lowStock = 'true';
      
      const response = await api.getInventory(params);
      inventory = response.inventory || [];
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      loading = false;
    }
  }

  async function loadProducts() {
    try {
      const response = await api.getProducts({ limit: '1000' });
      products = response.products || [];
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  }

  async function loadWarehouses() {
    try {
      warehouses = await api.getWarehouses();
    } catch (error) {
      console.error('Failed to load warehouses:', error);
    }
  }

  function openAdjustModal(item: any) {
    selectedItem = item;
    adjustmentData = {
      actualQuantity: item.quantity,
      reason: ''
    };
    showAdjustModal = true;
  }

  async function handleAdjustment() {
    try {
      const adjustments = [{
        product: selectedItem.product._id,
        warehouse: selectedItem.warehouse._id,
        actualQuantity: adjustmentData.actualQuantity
      }];
      
      await api.performStockTake(adjustments);
      showAdjustModal = false;
      loadInventory();
    } catch (error) {
      console.error('Failed to adjust inventory:', error);
    }
  }

  function getStockStatus(item: any) {
    if (item.quantity <= 0) return { status: 'out-of-stock', color: 'bg-red-100 text-red-800', text: 'Out of Stock' };
    if (item.quantity <= item.reorderPoint) return { status: 'low-stock', color: 'bg-yellow-100 text-yellow-800', text: 'Low Stock' };
    return { status: 'in-stock', color: 'bg-green-100 text-green-800', text: 'In Stock' };
  }

  $: {
    if (selectedWarehouse || selectedProduct || lowStockOnly) {
      loadInventory();
    }
  }
</script>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Inventory</h1>
  </div>

  <!-- Filters -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Warehouse</label>
      <select
        bind:value={selectedWarehouse}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
      >
        <option value="">All Warehouses</option>
        {#each warehouses as warehouse}
          <option value={warehouse._id}>{warehouse.name}</option>
        {/each}
      </select>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Product</label>
      <select
        bind:value={selectedProduct}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
      >
        <option value="">All Products</option>
        {#each products as product}
          <option value={product._id}>{product.name}</option>
        {/each}
      </select>
    </div>

    <div class="flex items-end">
      <label class="flex items-center">
        <input
          type="checkbox"
          bind:checked={lowStockOnly}
          class="rounded-sm border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Low Stock Only</span>
      </label>
    </div>

    <div class="flex items-end">
      <Button variant="secondary" on:click={loadInventory} class="w-full">
        <Search class="w-4 h-4 mr-2" />
        Refresh
      </Button>
    </div>
  </div>

  <!-- Inventory Table -->
  <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
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
            Quantity
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Reserved
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Reorder Point
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Status
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Location
          </th>
          <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        {#if loading}
          <tr>
            <td colspan="8" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
              Loading...
            </td>
          </tr>
        {:else if inventory.length === 0}
          <tr>
            <td colspan="8" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
              No inventory found
            </td>
          </tr>
        {:else}
          {#each inventory as item}
            {@const stockStatus = getStockStatus(item)}
            <tr>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <Package class="h-8 w-8 text-gray-400" />
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {item.product?.name}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      SKU: {item.product?.sku}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {item.warehouse?.name}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {item.quantity}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  Available: {item.quantity - item.reservedQuantity}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {item.reservedQuantity}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {item.reorderPoint}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {stockStatus.color}">
                  {#if stockStatus.status === 'low-stock'}
                    <AlertTriangle class="w-3 h-3 mr-1" />
                  {/if}
                  {stockStatus.text}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {#if item.location}
                  {[item.location.zone, item.location.aisle, item.location.shelf, item.location.bin].filter(Boolean).join('-') || '-'}
                {:else}
                  -
                {/if}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button variant="ghost" size="sm" on:click={() => openAdjustModal(item)}>
                  Adjust
                </Button>
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
</div>

<!-- Adjustment Modal -->
<Modal bind:open={showAdjustModal} title="Adjust Inventory" size="md">
  {#if selectedItem}
    <form on:submit|preventDefault={handleAdjustment} class="space-y-4">
      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h4 class="font-medium text-gray-900 dark:text-white">{selectedItem.product?.name}</h4>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {selectedItem.warehouse?.name} • Current: {selectedItem.quantity}
        </p>
      </div>

      <Input
        bind:value={adjustmentData.actualQuantity}
        type="number"
        label="Actual Quantity"
        required
      />

      <Input
        bind:value={adjustmentData.reason}
        label="Reason for Adjustment"
        placeholder="e.g., Stock count correction"
        required
      />

      <div class="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
        <p class="text-sm text-blue-800 dark:text-blue-200">
          Adjustment: {adjustmentData.actualQuantity - selectedItem.quantity > 0 ? '+' : ''}{adjustmentData.actualQuantity - selectedItem.quantity}
        </p>
      </div>

      <div class="flex justify-end space-x-3">
        <Button variant="secondary" on:click={() => showAdjustModal = false}>
          Cancel
        </Button>
        <Button type="submit">Apply Adjustment</Button>
      </div>
    </form>
  {/if}
</Modal>
