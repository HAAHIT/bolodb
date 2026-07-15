<script lang="ts">
  import './layout.css';
  import '$lib/styles/auth.css';
  import { appState } from '$lib/appState.svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import Navbar from '$lib/components/ui/Navbar.svelte';

  let { children } = $props();
</script>

<svelte:head>
  <title>BoloDB — Ask your data. Trust the answer.</title>
</svelte:head>

<!-- Hide navbar on marketing/auth/onboard pages; show on chat/dashboard/connect/profile. -->
{#if appState.isLoaded && !['/', '/login', '/signup', '/onboard', '/forgot-password', '/reset-password'].includes($page.url.pathname)}
  <Navbar />
{/if}

<div class="main-content" class:has-navbar={appState.isLoaded && !['/', '/login', '/signup', '/onboard', '/forgot-password', '/reset-password'].includes($page.url.pathname)}>
  {@render children()}
</div>

<style>
  .main-content {
    height: 100%;
    width: 100%;
  }
  .has-navbar {
    padding-top: 60px;
    height: 100%;
  }
</style>
