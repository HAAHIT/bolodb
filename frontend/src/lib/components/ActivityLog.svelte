<script lang="ts">
  import { onMount } from 'svelte';
  import { getWorkspaceActivity } from '$lib/api';
  import { appState } from '$lib/appState.svelte';

  let activities = $state<any[]>([]);
  let loading = $state(true);
  let error = $state('');
  let page = $state(1);
  let hasMore = $state(true);

  async function loadActivity(loadMore = false) {
    if (!appState.activeWorkspace) return;
    try {
      if (!loadMore) {
        page = 1;
        loading = true;
      } else {
        page += 1;
      }
      
      const res = await getWorkspaceActivity(appState.activeWorkspace.id, page);
      if (loadMore) {
        activities = [...activities, ...res];
      } else {
        activities = res;
      }
      
      hasMore = res.length === 50; // if it returned exactly limit, there might be more
    } catch (e: any) {
      error = e.message || 'Could not load activity log';
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadActivity();
  });

  // Watch for workspace changes
  $effect(() => {
    if (appState.activeWorkspace) {
      // Small delay to prevent too many fetches when switching
      loadActivity();
    }
  });

  function formatEvent(a: any) {
    const actor = a.actor_email || 'System';
    const type = a.event_type;
    
    // Formatting logic
    if (type === 'workspace.created') return `${actor} created this workspace`;
    if (type === 'workspace.updated') return `${actor} updated workspace settings`;
    if (type === 'member.invited') return `${actor} invited ${a.metadata_?.email || 'a user'}`;
    if (type === 'member.joined') return `${actor} joined the workspace`;
    if (type === 'member.role_updated') return `Role updated for ${a.resource_id} to ${a.metadata_?.new_role}`;
    if (type === 'member.removed') return `Member ${a.resource_id} removed`;
    if (type === 'db.connected') return `${actor} connected a database (${a.metadata_?.dialect || 'unknown'})`;
    if (type === 'db.disconnected') return `${actor} disconnected a database`;
    if (type === 'query.executed') return `${actor} ran a query`;
    if (type === 'knowledge.verified') return `${actor} verified an answer for knowledge base`;
    
    return `${actor} performed ${type}`;
  }
  
  function timeAgo(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  }
</script>

<div class="activity-container">
  <h2>Activity Log (Last 30 Days)</h2>
  
  {#if error}
    <div class="error-msg">{error}</div>
  {/if}

  {#if loading && page === 1}
    <div class="loading-state">
      <div class="spinner"></div>
      Loading activities...
    </div>
  {:else if activities.length === 0}
    <div class="empty-state">
      <p>No activity recorded yet.</p>
    </div>
  {:else}
    <div class="activity-list">
      {#each activities as a (a.id)}
        <div class="activity-item">
          <div class="activity-icon">
            {#if a.event_type.startsWith('workspace')}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            {:else if a.event_type.startsWith('member')}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            {:else if a.event_type.startsWith('db')}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
            {:else if a.event_type.startsWith('query')}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
            {:else if a.event_type.startsWith('knowledge')}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            {:else}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            {/if}
          </div>
          <div class="activity-content">
            <div class="activity-text">{formatEvent(a)}</div>
            <div class="activity-time" title={new Date(a.created_at).toLocaleString()}>{timeAgo(a.created_at)}</div>
          </div>
        </div>
      {/each}
    </div>
    
    {#if hasMore}
      <button class="load-more-btn" onclick={() => loadActivity(true)} disabled={loading}>
        {#if loading}
          Loading...
        {:else}
          Load Older
        {/if}
      </button>
    {/if}
  {/if}
</div>

<style>
  .activity-container {
    margin-top: 40px;
    padding-top: 32px;
    border-top: 1px solid var(--border);
  }
  .activity-container h2 {
    font-size: 18px;
    font-weight: 700;
    color: var(--ink);
    margin: 0 0 20px;
  }
  .activity-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    position: relative;
  }
  .activity-list::before {
    content: '';
    position: absolute;
    top: 12px;
    bottom: 12px;
    left: 15px;
    width: 2px;
    background: var(--border-2);
    z-index: 0;
  }
  .activity-item {
    display: flex;
    gap: 16px;
    position: relative;
    z-index: 1;
  }
  .activity-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--surface-1);
    border: 2px solid var(--border-2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--muted);
    flex-shrink: 0;
  }
  .activity-content {
    background: var(--card);
    border: 1px solid var(--border-2);
    border-radius: 8px;
    padding: 10px 14px;
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }
  .activity-text {
    font-size: 13.5px;
    color: var(--ink);
    line-height: 1.4;
  }
  .activity-time {
    font-size: 12px;
    color: var(--muted);
    white-space: nowrap;
  }
  .load-more-btn {
    margin-top: 24px;
    background: var(--surface-2);
    border: 1px solid var(--border-2);
    color: var(--ink);
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
    transition: all 0.2s;
  }
  .load-more-btn:hover:not(:disabled) {
    background: var(--surface-3);
  }
  .loading-state, .empty-state {
    padding: 32px;
    text-align: center;
    color: var(--muted);
    font-size: 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    background: var(--surface-1);
    border-radius: 8px;
    border: 1px dashed var(--border-2);
  }
  .spinner {
    width: 24px;
    height: 24px;
    border: 2px solid var(--border-2);
    border-top-color: var(--brand);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .error-msg {
    color: var(--c-low-ink);
    background: var(--c-low-tint);
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 16px;
  }
</style>
