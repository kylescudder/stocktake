<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { api } from '$lib/api';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';

  let email = '';
  let password = '';
  let name = '';
  let role = 'staff';
  let loading = false;
  let error = '';

  async function handleRegister() {
    if (!email || !password || !name) {
      error = 'Please fill in all fields';
      return;
    }

    loading = true;
    error = '';

    try {
      const response = await api.register(email, password, name, role);
      auth.login(response.token, response.user);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Registration failed';
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
        Create your account
      </h2>
    </div>
    
    <form class="mt-8 space-y-6" on:submit|preventDefault={handleRegister}>
      {#if error}
        <div class="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      {/if}

      <div class="space-y-4">
        <Input
          bind:value={name}
          label="Full name"
          placeholder="Enter your full name"
          required
        />
        
        <Input
          bind:value={email}
          type="email"
          label="Email address"
          placeholder="Enter your email"
          required
        />
        
        <Input
          bind:value={password}
          type="password"
          label="Password"
          placeholder="Enter your password"
          required
        />

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Role
          </label>
          <select
            bind:value={role}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
          >
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <Button
        type="submit"
        {loading}
        disabled={loading}
        class="w-full justify-center"
      >
        Sign up
      </Button>

      <div class="text-center">
        <a href="/login" class="text-primary-600 hover:text-primary-500">
          Already have an account? Sign in
        </a>
      </div>
    </form>
  </div>
</div>
