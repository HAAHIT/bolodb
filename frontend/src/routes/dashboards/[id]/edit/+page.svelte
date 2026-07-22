<script lang="ts">
  import { page } from '$app/stores';
  import { onMount, onDestroy } from 'svelte';
  import { apiCall } from '$lib/api';
  import { goto } from '$app/navigation';
  import DashboardEditor from '$lib/components/DashboardEditor.svelte';

  let dashboardId = $derived($page.params.id);
  let dashboard: any = $state(null);
  let panelData: Record<string, any> = $state({});
  let savedQueries: any[] = $state([]);
  let loading = $state(true);

  $effect(() => {
    if (dashboardId) {
      loadDashboard();
    }
  });

  async function loadDashboard() {
    loading = true;
    try {
      const [dashRes, sqsRes] = await Promise.all([
        apiCall(`/api/dashboards/${dashboardId}`),
        apiCall('/api/saved-queries')
      ]);
      dashboard = dashRes;
      savedQueries = sqsRes.saved_queries || [];
      await fetchDashboardData();
    } catch (e) {
      console.error(e);
      alert('Failed to load dashboard');
      goto('/dashboards');
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

  async function saveDashboard(updates: any[]) {
    try {
      await apiCall(`/api/dashboards/${dashboardId}/panels/batch`, { updates }, 'PATCH');
      alert('Dashboard saved!');
    } catch (e) {
      console.error(e);
      alert('Failed to save positions');
    }
  }

  async function addPanel(panelConfig: any) {
    try {
      await apiCall(`/api/dashboards/${dashboardId}/panels`, panelConfig, 'POST');
      await loadDashboard(); // reload to get new ID and data
    } catch (e) {
      console.error(e);
      alert('Failed to add panel');
    }
  }

  async function deletePanel(panelId: string) {
    if (!confirm('Remove this panel?')) return;
    try {
      await apiCall(`/api/dashboards/${dashboardId}/panels/${panelId}`, undefined, 'DELETE');
      dashboard.panels = dashboard.panels.filter((p: any) => p.id !== panelId);
    } catch (e) {
      console.error(e);
      alert('Failed to remove panel');
    }
  }
</script>

<div class="dash-layout edit-mode-bg">
  {#if loading && !dashboard}
    <div class="loading-state">
      <div class="spinner"></div>
    </div>
  {:else if dashboard}
    <div class="dash-header glass-panel">
      <div class="dash-header-left">
        <div class="dash-icon-hero">✏️</div>
        <div class="dash-title-stack">
          <h1>Editing: {dashboard.name}</h1>
          <p>Drag, drop, and configure your panels below.</p>
        </div>
      </div>
      <div class="dash-header-actions">
        <a href="/dashboards/{dashboard._id || dashboard.id}" class="btn-primary-glow">Done Editing</a>
      </div>
    </div>

    <div class="dash-content-full" style="padding: 32px 48px;">
      <DashboardEditor
        {dashboard}
        {panelData}
        {savedQueries}
        onSave={saveDashboard}
        onAdd={addPanel}
        onRemove={deletePanel}
      />
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

  .edit-mode-bg {
    background-image: radial-gradient(rgba(var(--brand-rgb), 0.05) 1px, transparent 1px);
    background-size: 24px 24px;
    background-color: var(--bg);
  }

  /* Glassmorphism Header */
  .dash-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 48px;
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .glass-panel {
    background: rgba(var(--surface-rgb), 0.85);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }

  .dash-header-left {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .dash-icon-hero {
    font-size: 32px;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 16px;
    background-color: rgba(245, 158, 11, 0.1);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
  }

  .dash-title-stack h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.5px;
    color: var(--ink);
  }

  .dash-title-stack p {
    margin: 4px 0 0;
    font-size: 14px;
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
    background: linear-gradient(135deg, var(--ok-ink), #10b981);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
    transition: all 0.2s ease;
    text-decoration: none;
  }

  .btn-primary-glow:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
  }

  .loading-state {
    display: flex;
    justify-content: center;
    padding: 64px;
  }
</style>
