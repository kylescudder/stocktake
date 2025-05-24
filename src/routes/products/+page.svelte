<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import { Plus, Search, Edit, Package } from 'lucide-svelte';

  let products: any[] = [];
  let loading = true;
  let searchTerm = '';
  let showCreateModal = false;
  let showEditModal = false;
  let selectedProduct: any = null;

  // Form data
  let formData = {
    sku: '',
    name: '',
    description: '',
    brand: '',
    unit: 'piece',
    weight: 0,
    dimensions: { length: 0, width: 0, height: 0 }
  };

  onMount(loadProducts);

  async function loadProducts() {
    loading = true;
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      
      const response = await api.getProducts(params);
      products = response.products || [];
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      loading = false;
    }
  }

  function openCreateModal() {
    formData = {
      sku: '',
      name: '',
      description: '',
      brand: '',
      unit: 'piece',
      weight: 0,
      dimensions: { length: 0, width: 0, height: 0 }
    };
    showCreateModal = true;
  }

  function openEditModal(product: any) {
    selectedProduct = product;
    formData = {
      sku: product.sku || '',
      name: product.name || '',
      description: product.description || '',
      brand: product.brand || '',
      unit: product.unit || 'piece',
      weight: product.weight || 0,
      dimensions: product.dimensions || { length: 0, width: 0, height: 0 }
    };
    showEditModal = true;
  }

  async function handleCreate() {
    try {
      await api.createProduct(formData);
      showCreateModal = false;
      loadProducts();
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  }

  async function handleUpdate() {
    try {
      await api.updateProduct(selectedProduct._id, formData);
      showEditModal = false;
      loadProducts();
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  }

  function handleSearch() {
    loadProducts();
  }
</script>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
    <Button on:click={openCreateModal}>
      <Plus class="w-4 h-4 mr-2" />
      Add Product
    </Button>
  </div>

  <!-- Search -->
  <div class="flex space-x-4">
    <div class="flex-1">
      <Input
        bind:value={searchTerm}
        placeholder="Search products..."
        on:input={handleSearch}
      />
    </div>
    <Button variant="secondary" on:click={handleSearch}>
      <Search class="w-4 h-4" />
    </Button>
  </div>

  <!-- Products Table -->
  <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead class="bg-gray-50 dark:bg-gray-700">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Product
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            SKU
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Brand
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Unit
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Status
          </th>
          <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        {#if loading}
          <tr>
            <td colspan="6" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
              Loading...
            </td>
          </tr>
        {:else if products.length === 0}
          <tr>
            <td colspan="6" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
              No products found
            </td>
          </tr>
        {:else}
          {#each products as product}
            <tr>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <Package class="h-8 w-8 text-gray-400" />
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {product.name}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {product.description || ''}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {product.sku}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {product.brand || '-'}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {product.unit}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {
                  product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }">
                  {product.active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button variant="ghost" size="sm" on:click={() => openEditModal(product)}>
                  <Edit class="w-4 h-4" />
                </Button>
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
</div>

<!-- Create Product Modal -->
<Modal bind:open={showCreateModal} title="Create Product" size="lg">
  <form on:submit|preventDefault={handleCreate} class="space-y-4">
    <div class="grid grid-cols-2 gap-4">
      <Input bind:value={formData.sku} label="SKU" required />
      <Input bind:value={formData.name} label="Name" required />
    </div>
    
    <Input bind:value={formData.description} label="Description" />
    
    <div class="grid grid-cols-2 gap-4">
      <Input bind:value={formData.brand} label="Brand" />
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Unit</label>
        <select
          bind:value={formData.unit}
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
        >
          <option value="piece">Piece</option>
          <option value="kg">Kilogram</option>
          <option value="liter">Liter</option>
          <option value="meter">Meter</option>
        </select>
      </div>
    </div>

    <Input bind:value={formData.weight} type="number" label="Weight (kg)" step="0.01" />

    <div class="grid grid-cols-3 gap-4">
      <Input bind:value={formData.dimensions.length} type="number" label="Length (cm)" step="0.1" />
      <Input bind:value={formData.dimensions.width} type="number" label="Width (cm)" step="0.1" />
      <Input bind:value={formData.dimensions.height} type="number" label="Height (cm)" step="0.1" />
    </div>

    <div class="flex justify-end space-x-3">
      <Button variant="secondary" on:click={() => showCreateModal = false}>
        Cancel
      </Button>
      <Button type="submit">Create Product</Button>
    </div>
  </form>
</Modal>

<!-- Edit Product Modal -->
<Modal bind:open={showEditModal} title="Edit Product" size="lg">
  <form on:submit|preventDefault={handleUpdate} class="space-y-4">
    <div class="grid grid-cols-2 gap-4">
      <Input bind:value={formData.sku} label="SKU" required />
      <Input bind:value={formData.name} label="Name" required />
    </div>
    
    <Input bind:value={formData.description} label="Description" />
    
    <div class="grid grid-cols-2 gap-4">
      <Input bind:value={formData.brand} label="Brand" />
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Unit</label>
        <select
          bind:value={formData.unit}
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
        >
          <option value="piece">Piece</option>
          <option value="kg">Kilogram</option>
          <option value="liter">Liter</option>
          <option value="meter">Meter</option>
        </select>
      </div>
    </div>

    <Input bind:value={formData.weight} type="number" label="Weight (kg)" step="0.01" />

    <div class="grid grid-cols-3 gap-4">
      <Input bind:value={formData.dimensions.length} type="number" label="Length (cm)" step="0.1" />
      <Input bind:value={formData.dimensions.width} type="number" label="Width (cm)" step="0.1" />
      <Input bind:value={formData.dimensions.height} type="number" label="Height (cm)" step="0.1" />
    </div>

    <div class="flex justify-end space-x-3">
      <Button variant="secondary" on:click={() => showEditModal = false}>
        Cancel
      </Button>
      <Button type="submit">Update Product</Button>
    </div>
  </form>
</Modal>
