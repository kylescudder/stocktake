<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import { theme } from '$lib/stores/theme';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import { User, Lock, Bell, Database, Download, Upload, Trash2 } from 'lucide-svelte';

  let activeTab = 'profile';
  let showChangePasswordModal = false;
  let showImportModal = false;

  // Profile settings
  let profileData = {
    name: '',
    email: '',
    role: ''
  };

  // Password change
  let passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // Notification settings
  let notificationSettings = {
    lowStockAlerts: true,
    movementNotifications: false,
    weeklyReports: true,
    emailNotifications: true
  };

  // Import/Export
  let importFile: FileList | null = null;

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Lock },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'data', name: 'Data Management', icon: Database }
  ];

  onMount(() => {
    if ($auth.user) {
      profileData = {
        name: $auth.user.name || '',
        email: $auth.user.email || '',
        role: $auth.user.role || ''
      };
    }
  });

  async function updateProfile() {
    try {
      // API call to update profile
      console.log('Updating profile:', profileData);
      // Show success message
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  }

  async function changePassword() {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      // API call to change password
      console.log('Changing password');
      showChangePasswordModal = false;
      passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
      // Show success message
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  }

  async function updateNotifications() {
    try {
      // API call to update notification settings
      console.log('Updating notifications:', notificationSettings);
      // Show success message
    } catch (error) {
      console.error('Failed to update notifications:', error);
    }
  }

  async function exportData() {
    try {
      // Export all data as CSV/JSON
      const data = {
        products: [],
        warehouses: [],
        inventory: [],
        movements: []
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stocktake-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  }

  async function importData() {
    if (!importFile || importFile.length === 0) return;

    try {
      const file = importFile[0];
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Process import data
      console.log('Importing data:', data);
      showImportModal = false;
      importFile = null;
      // Show success message
    } catch (error) {
      console.error('Failed to import data:', error);
    }
  }

  function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      // API call to clear all data
      console.log('Clearing all data');
    }
  }
</script>

<div class="space-y-6">
  <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

  <!-- Tabs -->
  <div class="border-b border-gray-200 dark:border-gray-700">
    <nav class="-mb-px flex space-x-8">
      {#each tabs as tab}
        <button
          on:click={() => activeTab = tab.id}
          class="py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap {
            activeTab === tab.id
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
          }"
        >
          <div class="flex items-center space-x-2">
            <svelte:component this={tab.icon} class="w-4 h-4" />
            <span>{tab.name}</span>
          </div>
        </button>
      {/each}
    </nav>
  </div>

  <!-- Tab Content -->
  {#if activeTab === 'profile'}
    <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Profile Information</h3>
      
      <form on:submit|preventDefault={updateProfile} class="space-y-4">
        <Input bind:value={profileData.name} label="Full Name" required />
        <Input bind:value={profileData.email} type="email" label="Email Address" required />
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
          <input
            value={profileData.role}
            disabled
            class="mt-1 block w-full rounded-md border-gray-300 shadow-xs bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
          />
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Contact an administrator to change your role.</p>
        </div>

        <div class="pt-4">
          <Button type="submit">Update Profile</Button>
        </div>
      </form>
    </div>

  {:else if activeTab === 'security'}
    <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Security Settings</h3>
      
      <div class="space-y-4">
        <div class="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h4 class="text-sm font-medium text-gray-900 dark:text-white">Password</h4>
            <p class="text-sm text-gray-500 dark:text-gray-400">Change your account password</p>
          </div>
          <Button variant="secondary" on:click={() => showChangePasswordModal = true}>
            Change Password
          </Button>
        </div>

        <div class="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h4 class="text-sm font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h4>
            <p class="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security to your account</p>
          </div>
          <Button variant="secondary" disabled>
            Coming Soon
          </Button>
        </div>

        <div class="flex items-center justify-between py-4">
          <div>
            <h4 class="text-sm font-medium text-gray-900 dark:text-white">Session Management</h4>
            <p class="text-sm text-gray-500 dark:text-gray-400">Manage your active sessions</p>
          </div>
          <Button variant="secondary" disabled>
            View Sessions
          </Button>
        </div>
      </div>
    </div>

  {:else if activeTab === 'notifications'}
    <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Notification Preferences</h3>
      
      <form on:submit|preventDefault={updateNotifications} class="space-y-6">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-medium text-gray-900 dark:text-white">Low Stock Alerts</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">Get notified when products are running low</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                bind:checked={notificationSettings.lowStockAlerts}
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-hidden peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-medium text-gray-900 dark:text-white">Movement Notifications</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">Get notified about stock movements</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                bind:checked={notificationSettings.movementNotifications}
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-hidden peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-medium text-gray-900 dark:text-white">Weekly Reports</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">Receive weekly inventory summary reports</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                bind:checked={notificationSettings.weeklyReports}
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-hidden peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                bind:checked={notificationSettings.emailNotifications}
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-hidden peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>

        <div class="pt-4">
          <Button type="submit">Save Preferences</Button>
        </div>
      </form>
    </div>

  {:else if activeTab === 'data'}
    <div class="space-y-6">
      <!-- Export Data -->
      <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Export Data</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Download a backup of your inventory data including products, warehouses, stock levels, and movement history.
        </p>
        
        <Button on:click={exportData}>
          <Download class="w-4 h-4 mr-2" />
          Export All Data
        </Button>
      </div>

      <!-- Import Data -->
      <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Import Data</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Import inventory data from a backup file. This will merge with existing data.
        </p>
        
        <div class="space-y-4">
          <div>
            <input
              type="file"
              accept=".json,.csv"
              bind:files={importFile}
              class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
          </div>
          
          <Button 
            on:click={() => showImportModal = true}
            disabled={!importFile || importFile.length === 0}
          >
            <Upload class="w-4 h-4 mr-2" />
            Import Data
          </Button>
        </div>
      </div>

      <!-- Danger Zone -->
      {#if $auth.user?.role === 'admin'}
        <div class="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 class="text-lg font-medium text-red-800 dark:text-red-200 mb-4">Danger Zone</h3>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-sm font-medium text-red-800 dark:text-red-200">Clear All Data</h4>
                <p class="text-sm text-red-600 dark:text-red-300">
                  Permanently delete all inventory data. This action cannot be undone.
                </p>
              </div>
              <Button variant="danger" on:click={clearAllData}>
                <Trash2 class="w-4 h-4 mr-2" />
                Clear All Data
              </Button>
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<!-- Change Password Modal -->
<Modal bind:open={showChangePasswordModal} title="Change Password" size="md">
  <form on:submit|preventDefault={changePassword} class="space-y-4">
    <Input
      bind:value={passwordData.currentPassword}
      type="password"
      label="Current Password"
      required
    />
    
    <Input
      bind:value={passwordData.newPassword}
      type="password"
      label="New Password"
      required
      minlength="8"
    />
    
    <Input
      bind:value={passwordData.confirmPassword}
      type="password"
      label="Confirm New Password"
      required
      minlength="8"
    />

    <div class="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
      <p class="text-sm text-blue-800 dark:text-blue-200">
        Your password must be at least 8 characters long and contain a mix of letters, numbers, and special characters.
      </p>
    </div>

    <div class="flex justify-end space-x-3">
      <Button variant="secondary" on:click={() => showChangePasswordModal = false}>
        Cancel
      </Button>
      <Button type="submit">Change Password</Button>
    </div>
  </form>
</Modal>

<!-- Import Confirmation Modal -->
<Modal bind:open={showImportModal} title="Confirm Data Import" size="md">
  <div class="space-y-4">
    <div class="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
      <div class="flex">
        <div class="shrink-0">
          <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Warning
          </h3>
          <div class="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
            <p>This will import data and merge it with your existing inventory. Make sure you have a backup before proceeding.</p>
          </div>
        </div>
      </div>
    </div>

    {#if importFile && importFile.length > 0}
      <div>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          File: <span class="font-medium">{importFile[0].name}</span>
        </p>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Size: <span class="font-medium">{(importFile[0].size / 1024).toFixed(2)} KB</span>
        </p>
      </div>
    {/if}

    <div class="flex justify-end space-x-3">
      <Button variant="secondary" on:click={() => showImportModal = false}>
        Cancel
      </Button>
      <Button on:click={importData}>
        Import Data
      </Button>
    </div>
  </div>
</Modal>
