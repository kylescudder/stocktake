<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { api } from '$lib/api';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';

  let email = '';
  let password = '';
  let loading = false;
  let error = '';

  async function handleLogin() {
    if (!email || !password) {
      error = 'Please fill in all fields';
      return;
    }

    loading = true;
    error = '';

    try {
      const response = await api.login(email, password);
      auth.login(response.token, response.user);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Login failed';
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
        Sign in to StockTake
      </h2>
    </div>
    
    <form class="mt-8 space-y-6" on:submit|preventDefault={handleLogin}>
      {#if error}
        <div class="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded-sm">
          {error}
        </div>
      {/if}

      <div class="space-y-4">
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
      </div>

      <Button
        type="submit"
        {loading}
        disabled={loading}
        class="w-full justify-center"
      >
        Sign in
      </Button>

      <div class="text-center">
        <a href="/register" class="text-primary-600 hover:text-primary-500">
          Don't have an account? Sign up
        </a>
      </div>
    </form>
  </div>
</div>
