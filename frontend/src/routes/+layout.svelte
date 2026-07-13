<script lang="ts">
  import './layout.css';
  import { appState } from '$lib/appState.svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { locale } from '$lib/i18n/i18n-svelte';
  import Navbar from '$lib/components/ui/Navbar.svelte';

  let { children } = $props();

  const RTL = ['ar', 'he', 'fa', 'ur'];

  $effect(() => {
    document.documentElement.lang = $locale;
    if (RTL.includes($locale)) {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  });
</script>

<svelte:head>
  <title>BoloDB</title>
</svelte:head>

{#if appState.isLoaded && $page.url.pathname !== '/login' && $page.url.pathname !== '/signup' && $page.url.pathname !== '/onboard'}
  <Navbar />
{/if}

<div class="main-content" class:has-navbar={appState.isLoaded && $page.url.pathname !== '/login' && $page.url.pathname !== '/signup' && $page.url.pathname !== '/onboard'}>
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
