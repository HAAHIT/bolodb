<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { apiCall } from '$lib/api';
  import { appState } from '$lib/appState.svelte';

  let dashboards = $state<any[]>([]);
  let loading = $state(true);
  // let loading = $state(true);

  onMount(async () => {
    await fetchDashboards();
  });

  async function fetchDashboards() {
    loading = true;
    try {
      const res = await apiCall('/api/dashboards');
      if (res.dashboards) {
        dashboards = res.dashboards;
      }
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  async function createDashboard() {
    try {
      const res = await apiCall('/api/dashboards', {
        name: 'Untitled Dashboard',
        description: ''
      }, 'POST');
      await fetchDashboards();
      goto(`/dashboards/${res._id || res.id}/edit`);
    } catch (e: any) {
      console.error(e);
      appState.showError(e.message || 'Failed to create dashboard.');
    }
  }
</script>

<div class="dash-layout">
  <div class="dash-header glass-panel">
    <div class="dash-header-left">
      <div class="dash-icon-hero">📊</div>
      <div class="dash-title-stack">
        <h1>Dashboards</h1>
        <p>Analytics, charts, and metrics for your workspace</p>
      </div>
    </div>
    <div class="dash-header-actions">
      <button class="btn-secondary" onclick={() => goto('/chat')}>Back to Chat</button>
      {#if appState.activeWorkspace?.role === 'admin' || appState.activeWorkspace?.role === 'owner'}
        <button class="btn-primary-glow" onclick={createDashboard}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Dashboard
        </button>
      {/if}
    </div>
  </div>

  <div class="dash-content">
    {#if loading}
      <div class="loading-state">
        <div class="spinner"></div>
      </div>
    {:else if dashboards.length === 0}
      <div class="empty-state glass-panel">
        <div class="empty-icon">📈</div>
        <h3>No dashboards yet</h3>
        <p>Get started by creating your first dashboard to visualize data.</p>
        {#if appState.activeWorkspace?.role === 'admin' || appState.activeWorkspace?.role === 'owner'}
          <button class="btn-primary-glow" style="margin-top:20px" onclick={createDashboard}>
            Create Dashboard
          </button>
        {/if}
      </div>
    {:else}
      <div class="dash-grid">
        {#each dashboards as dash}
          <a href="/dashboards/{dash._id || dash.id}" class="dash-card group">
            <div class="card-icon">📊</div>
            <div class="card-content">
              <h3>{dash.name}</h3>
              <p>{dash.description || 'No description provided.'}</p>
            </div>
            <div class="card-footer">
              <span>Updated {new Date(dash.updated_at).toLocaleDateString()}</span>
              <div class="card-arrow group-hover-arrow">→</div>
            </div>
          </a>
        {/each}
      </div>
    {/if}
  </div>
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
  }

  .btn-primary-glow:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(var(--brand-rgb), 0.5);
  }

  .btn-primary-glow:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
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
  }

  .btn-secondary:hover {
    background: var(--border);
  }

  /* Content Area */
  .dash-content {
    flex: 1;
    padding: 48px;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  /* Grid & Cards */
  .dash-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
  }

  .dash-card {
    display: flex;
    flex-direction: column;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 24px;
    text-decoration: none;
    color: inherit;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .dash-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--brand), #8b5cf6);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .dash-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
    border-color: transparent;
  }

  .dash-card:hover::before {
    opacity: 1;
  }

  .card-icon {
    font-size: 24px;
    margin-bottom: 16px;
    background: rgba(var(--brand-rgb), 0.1);
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
  }

  .card-content {
    flex: 1;
  }

  .card-content h3 {
    margin: 0 0 8px;
    font-size: 18px;
    font-weight: 600;
    color: var(--ink);
  }

  .card-content p {
    margin: 0 0 24px;
    font-size: 14px;
    color: var(--muted);
    line-height: 1.5;
  }

  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 16px;
    border-top: 1px solid var(--border);
    font-size: 13px;
    color: var(--muted);
  }

  .group-hover-arrow {
    transform: translateX(-10px);
    opacity: 0;
    transition: all 0.3s ease;
    color: var(--brand);
    font-weight: bold;
    font-size: 16px;
  }

  .dash-card:hover .group-hover-arrow {
    transform: translateX(0);
    opacity: 1;
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

</style>
