<script lang="ts">
  import { page } from '$app/stores';
  import { onMount, onDestroy } from 'svelte';
  import { apiCall } from '$lib/api';
  import { appState } from '$lib/appState.svelte';
  import ChartPanel from '$lib/components/ChartPanel.svelte';

  let dashboardId = $derived($page.params.id);
  let dashboard: any = $state(null);
  let panelData: Record<string, any> = $state({});
  let loading = $state(true);
  let pollInterval: any;

  $effect(() => {
    if (dashboardId) {
      loadDashboard();
    }
  });

  onDestroy(() => {
    if (pollInterval) clearInterval(pollInterval);
  });

  async function loadDashboard() {
    loading = true;
    try {
      dashboard = await apiCall(`/api/dashboards/${dashboardId}`);
      await fetchDashboardData();
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  async function fetchDashboardData() {
    try {
      const results = await apiCall(`/api/dashboards/${dashboardId}/data`);
      panelData = results;
    } catch (e) {
      console.error("Failed to load panel data", e);
    }
  }
</script>

<div class="dash-layout">
  {#if loading && !dashboard}
    <div class="loading-state">
      <div class="spinner"></div>
    </div>
  {:else if dashboard}
    <div class="dash-header glass-panel">
      <div class="dash-header-left">
        <div class="dash-icon-hero">📈</div>
        <div class="dash-title-stack">
          <h1>{dashboard.name}</h1>
          {#if dashboard.description}
            <p>{dashboard.description}</p>
          {/if}
        </div>
      </div>
      <div class="dash-header-actions">
        <a href="/dashboards" class="btn-secondary">Back to Dashboards</a>
        {#if appState.activeWorkspace?.role === 'admin' || appState.activeWorkspace?.role === 'owner'}
          <a
            href="/dashboards/{dashboard._id || dashboard.id}/edit"
            class="btn-primary-glow"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:8px">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Dashboard
          </a>
        {/if}
      </div>
    </div>

    <div class="dash-content-full" style="padding: 32px 48px;">
      {#if dashboard.panels.length === 0}
        <div class="empty-state glass-panel">
          <div class="empty-icon">🎨</div>
          <h3>This dashboard is empty</h3>
          <p>Click "Edit Dashboard" to add your first chart panel.</p>
        </div>
      {:else}
        <div class="dash-grid-view">
          {#each dashboard.panels as panel}
            {@const w = panel.position?.w || 4}
            {@const h = panel.position?.h || 4}
            <div
              class="dash-panel-card"
              style="grid-column: span {w}; grid-row: span {h};"
            >
               <ChartPanel {panel} data={panelData[panel.saved_query_id]} />
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  /* Base Layout */
  .dash-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: var(--bg);
    overflow-y: auto;
  }

  /* Glassmorphism Header */
  .dash-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32px 48px;
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .glass-panel {
    background: rgba(var(--surface-rgb), 0.7);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .dash-header-left {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .dash-icon-hero {
    font-size: 32px;
    background: linear-gradient(135deg, var(--brand), #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 16px;
    background-color: rgba(var(--brand-rgb), 0.1);
    box-shadow: 0 4px 12px rgba(var(--brand-rgb), 0.2);
  }

  .dash-title-stack h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.5px;
    color: var(--ink);
  }

  .dash-title-stack p {
    margin: 4px 0 0;
    font-size: 15px;
    color: var(--muted);
  }

  .dash-header-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  /* Modern Buttons */
  .btn-primary-glow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 600;
    color: white;
    background: linear-gradient(135deg, var(--brand), #6366f1);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(var(--brand-rgb), 0.4);
    transition: all 0.2s ease;
    text-decoration: none;
  }

  .btn-primary-glow:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(var(--brand-rgb), 0.5);
  }

  .btn-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 600;
    color: var(--ink);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
  }

  .btn-secondary:hover {
    background: var(--border);
  }

  /* Grid & Cards */
  .dash-grid-view {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 20px;
    width: 100%;
    grid-auto-rows: minmax(80px, auto);
  }

  .dash-panel-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    transition: box-shadow 0.2s ease, border-color 0.2s ease;
  }

  .dash-panel-card:hover {
    box-shadow: 0 8px 24px rgba(0,0,0,0.06);
    border-color: rgba(var(--brand-rgb), 0.3);
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: 80px 40px;
    border-radius: 24px;
    border: 2px dashed var(--border);
    max-width: 500px;
    margin: 40px auto;
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: 24px;
    opacity: 0.8;
  }

  .empty-state h3 {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 12px;
    color: var(--ink);
  }

  .empty-state p {
    font-size: 15px;
    color: var(--muted);
    margin-bottom: 0;
  }

  .loading-state {
    display: flex;
    justify-content: center;
    padding: 64px;
  }
</style>
