<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import { auth } from '$lib/stores/auth';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import { Plus, MapPin, Edit, Users } from 'lucide-svelte';

  let warehouses: any[] = [];
  let users: any[] = [];
  let loading = true;
  let showCreateModal = false;
  let showEditModal = false;
  let selectedWarehouse: any = null;

  // Form data
  let formData = {
    code: '',
    name: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    },
    capacity: 0,
    manager: ''
  };

  onMount(async () => {
    await Promise.all([loadWarehouses(), loadUsers()]);
  });

  async function loadWarehouses() {
    loading = true;
    try {
      warehouses = await api.getWarehouses();
    } catch (error) {
      console.error('Failed to load warehouses:', error);
    } finally {
      loading = false;
    }
  }

  async function loadUsers() {
    try {
      // Assuming we have a getUsers endpoint
      users = [
        { _id: '1', name: 'John Doe', email: 'john@example.com' },
        { _id: '2', name: 'Jane Smith', email: 'jane@example.com' }
      ];
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  }

  function openCreateModal() {
    formData = {
      code: '',
      name: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        zipCode: ''
      },
      capacity: 0,
      manager: ''
    };
    showCreateModal = true;
  }

  function openEditModal(warehouse: any) {
    selectedWarehouse = warehouse;
    formData = {
      code: warehouse.code || '',
      name: warehouse.name || '',
      address: warehouse.address || {
        street: '',
        city: '',
        state: '',
        country: '',
        zipCode: ''
      },
      capacity: warehouse.capacity || 0,
      manager: warehouse.manager?._id || ''
    };
    showEditModal = true;
  }

  async function handleCreate() {
    try {
      await api.createWarehouse(formData);
      showCreateModal = false;
      loadWarehouses();
    } catch (error) {
      console.error('Failed to create warehouse:', error);
    }
  }

  async function handleUpdate() {
    try {
      // Assuming we have an updateWarehouse endpoint
      // await api.updateWarehouse(selectedWarehouse._id, formData);
      showEditModal = false;
      loadWarehouses();
    } catch (error) {
      console.error('Failed to update warehouse:', error);
    }
  }

  function formatAddress(address: any) {
    if (!address) return '-';
    const parts = [address.street, address.city, address.state, address.country].filter(Boolean);
    return parts.join(', ');
  }
</script>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Warehouses</h1>
    {#if $auth.user?.role === 'admin'}
      <Button on:click={openCreateModal}>
        <Plus class="w-4 h-4 mr-2" />
        Add Warehouse
      </Button>
    {/if}
  </div>

  <!-- Warehouses Grid -->
  <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {#if loading}
      {#each Array(6) as _}
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 animate-pulse">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      {/each}
    {:else if warehouses.length === 0}
      <div class="col-span-full text-center py-12">
        <MapPin class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No warehouses</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new warehouse.</p>
      </div>
    {:else}
      {#each warehouses as warehouse}
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <MapPin class="h-8 w-8 text-primary-600" />
              </div>
              <div class="ml-3">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                  {warehouse.name}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Code: {warehouse.code}
                </p>
              </div>
            </div>
            {#if $auth.user?.role === 'admin' || $auth.user?.role === 'manager'}
              <Button variant="ghost" size="sm" on:click={() => openEditModal(warehouse)}>
                <Edit class="w-4 h-4" />
              </Button>
            {/if}
          </div>
          
          <div class="mt-4 space-y-2">
            <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <MapPin class="w-4 h-4 mr-2" />
              <span class="truncate">{formatAddress(warehouse.address)}</span>
            </div>
            
            {#if warehouse.manager}
              <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Users class="w-4 h-4 mr-2" />
                <span>{warehouse.manager.name}</span>
              </div>
            {/if}
            
            {#if warehouse.capacity}
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Capacity: {warehouse.capacity.toLocaleString()} units
              </div>
            {/if}
          </div>
          
          <div class="mt-4">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {
              warehouse.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }">
              {warehouse.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

<!-- Create Warehouse Modal -->
<Modal bind:open={showCreateModal} title="Create Warehouse" size="lg">
  <form on:submit|preventDefault={handleCreate} class="space-y-4">
    <div class="grid grid-cols-2 gap-4">
      <Input bind:value={formData.code} label="Warehouse Code" required />
      <Input bind:value={formData.name} label="Warehouse Name" required />
    </div>
    
    <div class="space-y-4">
      <h4 class="text-sm font-medium text-gray-900 dark:text-white">Address</h4>
      <Input bind:value={formData.address.street} label="Street" />
      <div class="grid grid-cols-2 gap-4">
        <Input bind:value={formData.address.city} label="City" />
        <Input bind:value={formData.address.state} label="State" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <Input bind:value={formData.address.country} label="Country" />
        <Input bind:value={formData.address.zipCode} label="ZIP Code" />
      </div>
    </div>

    <Input bind:value={formData.capacity} type="number" label="Capacity" />

    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Manager</label>
      <select
        bind:value={formData.manager}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
      >
        <option value="">Select a manager</option>
        {#each users as user}
          <option value={user._id}>{user.name}</option>
        {/each}
      </select>
    </div>

    <div class="flex justify-end space-x-3">
      <Button variant="secondary" on:click={() => showCreateModal = false}>
        Cancel
      </Button>
      <Button type="submit">Create Warehouse</Button>
    </div>
  </form>
</Modal>

<!-- Edit Warehouse Modal -->
<Modal bind:open={showEditModal} title="Edit Warehouse" size="lg">
  <form on:submit|preventDefault={handleUpdate} class="space-y-4">
    <div class="grid grid-cols-2 gap-4">
      <Input bind:value={formData.code} label="Warehouse Code" required />
      <Input bind:value={formData.name} label="Warehouse Name" required />
    </div>
    
    <div class="space-y-4">
      <h4 class="text-sm font-medium text-gray-900 dark:text-white">Address</h4>
      <Input bind:value={formData.address.street} label="Street" />
      <div class="grid grid-cols-2 gap-4">
        <Input bind:value={formData.address.city} label="City" />
        <Input bind:value={formData.address.state} label="State" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <Input bind:value={formData.address.country} label="Country" />
        <Input bind:value={formData.address.zipCode} label="ZIP Code" />
      </div>
    </div>

    <Input bind:value={formData.capacity} type="number" label="Capacity" />

    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Manager</label>
      <select
        bind:value={formData.manager}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
      >
        <option value="">Select a manager</option>
        {#each users as user}
          <option value={user._id}>{user.name}</option>
        {/each}
      </select>
    </div>

    <div class="flex justify-end space-x-3">
      <Button variant="secondary" on:click={() => showEditModal = false}>
        Cancel
      </Button>
      <Button type="submit">Update Warehouse</Button>
    </div>
  </form>
</Modal>
