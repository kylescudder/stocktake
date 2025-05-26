<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import { Plus, ArrowUpCircle, ArrowDownCircle, ArrowRightLeft, Edit, RefreshCw } from 'lucide-svelte';
  import { format } from 'date-fns';

  interface Product {
    _id: string;
    name: string;
  }

  interface Warehouse {
    _id: string;
    name: string;
  }

  interface StockMovement {
    _id: string;
    type: string;
    product: Product;
    fromWarehouse?: Warehouse;
    toWarehouse?: Warehouse;
    quantity: number;
    reference?: string;
    reason?: string;
    createdAt: string;
    performedBy?: { name: string };
  }

  interface MovementFormData {
    type: string;
    product: string;
    fromWarehouse: string | null;
    toWarehouse: string | null;
    quantity: number;
    reference: string;
    reason: string;
  }

  let movements: StockMovement[] = [];
  let products: Product[] = [];
  let warehouses: Warehouse[] = [];
  let loading = true;
  let submitting = false;
  let showCreateModal = false;
  let error = '';

  // Filters
  let selectedProduct = '';
  let selectedWarehouse = '';
  let selectedType = '';
  let startDate = '';
  let endDate = '';

  // Form data
  let formData: MovementFormData = {
    type: 'IN',
    product: '',
    fromWarehouse: null,
    toWarehouse: null,
    quantity: 0,
    reference: '',
    reason: ''
  };

  const movementTypes = [
    { value: 'IN', label: 'Stock In', icon: ArrowUpCircle, color: 'text-green-600' },
    { value: 'OUT', label: 'Stock Out', icon: ArrowDownCircle, color: 'text-red-600' },
    { value: 'TRANSFER', label: 'Transfer', icon: ArrowRightLeft, color: 'text-blue-600' },
    { value: 'ADJUSTMENT', label: 'Adjustment', icon: Edit, color: 'text-yellow-600' },
    { value: 'RETURN', label: 'Return', icon: RefreshCw, color: 'text-purple-600' }
  ];

  onMount(async () => {
    await Promise.all([loadMovements(), loadProducts(), loadWarehouses()]);
  });

  async function loadMovements() {
    loading = true;
    error = '';
    try {
      const params: Record<string, string> = {};
      if (selectedProduct) params.product = selectedProduct;
      if (selectedWarehouse) params.warehouse = selectedWarehouse;
      if (selectedType) params.type = selectedType;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await api.getStockMovements(params);
      movements = response.movements || [];
    } catch (err) {
      console.error('Failed to load movements:', err);
      error = 'Failed to load movements. Please try again.';
    } finally {
      loading = false;
    }
  }

  async function loadProducts() {
    try {
      const response = await api.getProducts({ limit: '1000' });
      products = response.products || [];
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  }

  async function loadWarehouses() {
    try {
      warehouses = await api.getWarehouses();
    } catch (err) {
      console.error('Failed to load warehouses:', err);
    }
  }

  function openCreateModal() {
    formData = {
      type: 'IN',
      product: '',
      fromWarehouse: null,
      toWarehouse: null,
      quantity: 0,
      reference: '',
      reason: ''
    };
    error = '';
    showCreateModal = true;
  }

  function resetWarehouseFields() {
    formData.fromWarehouse = null;
    formData.toWarehouse = null;
  }

  function validateForm(): string | null {
    if (!formData.product) {
      return 'Please select a product';
    }
    
    if (formData.quantity <= 0) {
      return 'Quantity must be greater than 0';
    }

    // Validate warehouse requirements based on movement type
    switch (formData.type) {
      case 'TRANSFER':
        if (!formData.fromWarehouse || !formData.toWarehouse) {
          return 'Transfer movements require both source and destination warehouses';
        }
        if (formData.fromWarehouse === formData.toWarehouse) {
          return 'Source and destination warehouses must be different';
        }
        break;
      case 'OUT':
        if (!formData.fromWarehouse) {
          return 'Please select a source warehouse for stock out';
        }
        break;
      case 'IN':
      case 'RETURN':
        if (!formData.toWarehouse) {
          return 'Please select a destination warehouse';
        }
        break;
      case 'ADJUSTMENT':
        if (!formData.toWarehouse && !formData.fromWarehouse) {
          return 'Please select a warehouse for adjustment';
        }
        break;
    }

    return null;
  }

  async function handleCreate() {
    error = '';
    
    // Validate form
    const validationError = validateForm();
    if (validationError) {
      error = validationError;
      return;
    }

    submitting = true;
    
    try {
      // Prepare data, ensuring empty strings become null
      const submitData = {
        ...formData,
        fromWarehouse: formData.fromWarehouse || null,
        toWarehouse: formData.toWarehouse || null,
        quantity: Number(formData.quantity)
      };

      await api.createStockMovement(submitData);
      showCreateModal = false;
      await loadMovements();
    } catch (err: any) {
      console.error('Failed to create movement:', err);
      error = err.message || 'Failed to create movement. Please try again.';
    } finally {
      submitting = false;
    }
  }

  function getMovementTypeInfo(type: string) {
    return movementTypes.find(t => t.value === type) || movementTypes[0];
  }

  function getMovementIcon(type: string) {
    const typeInfo = getMovementTypeInfo(type);
    return typeInfo.icon;
  }

  function getMovementColor(type: string) {
    const typeInfo = getMovementTypeInfo(type);
    return typeInfo.color;
  }

  function clearFilters() {
    selectedProduct = '';
    selectedWarehouse = '';
    selectedType = '';
    startDate = '';
    endDate = '';
  }

  // Reactive statements
  $: showFromWarehouse = formData.type === 'OUT' || formData.type === 'TRANSFER' || formData.type === 'ADJUSTMENT';
  $: showToWarehouse = formData.type === 'IN' || formData.type === 'TRANSFER' || formData.type === 'RETURN' || formData.type === 'ADJUSTMENT';
  $: fromWarehouseRequired = formData.type === 'OUT' || formData.type === 'TRANSFER';
  $: toWarehouseRequired = formData.type === 'IN' || formData.type === 'TRANSFER' || formData.type === 'RETURN';
  
  $: {
    if (selectedProduct || selectedWarehouse || selectedType || startDate || endDate) {
      loadMovements();
    }
  }

  // Reset warehouse fields when movement type changes
  $: {
    if (formData.type) {
      if (!showFromWarehouse) formData.fromWarehouse = null;
      if (!showToWarehouse) formData.toWarehouse = null;
    }
  }
</script>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Stock Movements</h1>
    <Button on:click={openCreateModal}>
      <Plus class="w-4 h-4 mr-2" />
      New Movement
    </Button>
  </div>

  <!-- Filters -->
  <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
        <select
          bind:value={selectedType}
          class="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
        >
          <option value="">All Types</option>
          {#each movementTypes as type}
            <option value={type.value}>{type.label}</option>
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
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
        <input
          type="date"
          bind:value={startDate}
          class="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
        <input
          type="date"
          bind:value={endDate}
          class="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
        />
      </div>
    </div>
    
    {#if selectedProduct || selectedWarehouse || selectedType || startDate || endDate}
      <div class="mt-4">
        <Button variant="secondary" size="sm" on:click={clearFilters}>
          Clear Filters
        </Button>
      </div>
    {/if}
  </div>

  {#if error}
    <div class="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-md p-4">
      <p class="text-sm text-red-800 dark:text-red-200">{error}</p>
    </div>
  {/if}

  <!-- Movements List -->
  <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white">Movement History</h3>
    </div>
    
    <div class="divide-y divide-gray-200 dark:divide-gray-700">
      {#if loading}
        <div class="p-6 text-center text-gray-500 dark:text-gray-400">
          Loading movements...
        </div>
      {:else if movements.length === 0}
        <div class="p-6 text-center text-gray-500 dark:text-gray-400">
          No movements found
        </div>
      {:else}
        {#each movements as movement}
          {@const MovementIcon = getMovementIcon(movement.type)}
          <div class="p-6">
            <div class="flex items-start space-x-4">
              <div class="shrink-0">
                <svelte:component 
                  this={MovementIcon} 
                  class="h-6 w-6 {getMovementColor(movement.type)}" 
                />
              </div>
              
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {movement.product?.name}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {getMovementTypeInfo(movement.type).label} • {movement.quantity} units
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm text-gray-900 dark:text-white">
                      {format(new Date(movement.createdAt), 'MMM dd, yyyy')}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(movement.createdAt), 'HH:mm')}
                    </p>
                  </div>
                </div>
                
                <div class="mt-2 space-y-1">
                  {#if movement.fromWarehouse || movement.toWarehouse}
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      {#if movement.fromWarehouse && movement.toWarehouse}
                        From {movement.fromWarehouse.name} to {movement.toWarehouse.name}
                      {:else if movement.fromWarehouse}
                        From {movement.fromWarehouse.name}
                      {:else if movement.toWarehouse}
                        To {movement.toWarehouse.name}
                      {/if}
                    </p>
                  {/if}
                  
                  {#if movement.reference}
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      Reference: {movement.reference}
                    </p>
                  {/if}
                  
                  {#if movement.reason}
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      Reason: {movement.reason}
                    </p>
                  {/if}
                  
                  {#if movement.performedBy}
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      By: {movement.performedBy.name}
                    </p>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>

<!-- Create Movement Modal -->
<Modal bind:open={showCreateModal} title="Create Stock Movement" size="lg">
  <form on:submit|preventDefault={handleCreate} class="space-y-4">
    {#if error}
      <div class="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-md p-3">
        <p class="text-sm text-red-800 dark:text-red-200">{error}</p>
      </div>
    {/if}

    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Movement Type</label>
      <select
        bind:value={formData.type}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
        required
      >
        {#each movementTypes as type}
          <option value={type.value}>{type.label}</option>
        {/each}
      </select>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Product</label>
      <select
        bind:value={formData.product}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
        required
      >
        <option value="">Select a product</option>
        {#each products as product}
          <option value={product._id}>{product.name}</option>
        {/each}
      </select>
    </div>

    {#if showFromWarehouse}
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">From Warehouse</label>
        <select
          bind:value={formData.fromWarehouse}
          class="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
          required={fromWarehouseRequired}
        >
          <option value={null}>Select a warehouse</option>
          {#each warehouses as warehouse}
            <option value={warehouse._id}>{warehouse.name}</option>
          {/each}
        </select>
      </div>
    {/if}

    {#if showToWarehouse}
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">To Warehouse</label>
        <select
          bind:value={formData.toWarehouse}
          class="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
          required={toWarehouseRequired}
        >
          <option value={null}>Select a warehouse</option>
          {#each warehouses as warehouse}
            <option value={warehouse._id}>{warehouse.name}</option>
          {/each}
        </select>
      </div>
    {/if}

    <Input 
      bind:value={formData.quantity} 
      type="number" 
      label="Quantity" 
      required 
      min="1" 
      step="1"
    />
    
    <Input 
      bind:value={formData.reference} 
      label="Reference" 
      placeholder="e.g., PO-12345, SO-67890" 
    />
    
    <Input 
      bind:value={formData.reason} 
      label="Reason" 
      placeholder="e.g., Customer order, Stock replenishment" 
    />

    <div class="flex justify-end space-x-3">
      <Button 
        variant="secondary" 
        on:click={() => showCreateModal = false}
        disabled={submitting}
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={submitting}
        loading={submitting}
      >
        {submitting ? 'Creating...' : 'Create Movement'}
      </Button>
    </div>
  </form>
</Modal>
