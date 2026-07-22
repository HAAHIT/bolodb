<script lang="ts">
  import { onMount } from 'svelte';
  import {
    createWorkspace,
    getWorkspaceMembers,
    inviteWorkspaceMember,
    updateWorkspaceMemberRole,
    removeWorkspaceMember,
    acceptWorkspaceInvite,
    updateWorkspace,
  } from '$lib/api';
  import { appState } from '$lib/appState.svelte';
  import { goto } from '$app/navigation';
  import LoadingScreen from '$lib/components/ui/LoadingScreen.svelte';
  import ActivityLog from '$lib/components/ActivityLog.svelte';

  let loading = $state(true);
  let error = $state('');
  let newWorkspaceName = $state('');
  let joinToken = $state('');
  let inviteEmail = $state('');
  let inviteRole = $state('member');
  let members = $state<any[]>([]);
  let invites = $state<any[]>([]);

  let editingWorkspaceId = $state<string | null>(null);
  let editWorkspaceName = $state('');

  const isAdmin = $derived(
    appState.activeWorkspace?.role === 'admin' ||
    appState.activeWorkspace?.role === 'owner'
  );

  async function handleRename(wsId: string) {
    if (!editWorkspaceName.trim()) return;
    try {
      await updateWorkspace(wsId, editWorkspaceName);
      editingWorkspaceId = null;
      await loadData();
    } catch (e: any) {
      appState.showError(e.message || 'Could not rename workspace');
    }
  }

  onMount(async () => {
    if (!appState.isLoaded) {
      await appState.init(false);
    }
    await loadData();
    loading = false;
  });

  async function loadData() {
    try {
      await appState.loadWorkspaces();
      invites = appState.invites || [];
      if (appState.activeWorkspace) {
        members = await getWorkspaceMembers(appState.activeWorkspace.id);
      }
    } catch (e: any) {
      error = e.message || 'Could not load workspaces';
    }
  }

  async function handleCreateWorkspace() {
    if (!newWorkspaceName.trim()) return;
    try {
      await createWorkspace(newWorkspaceName);
      newWorkspaceName = '';
      await loadData();
    } catch (e: any) {
      appState.showError(e.message || 'Could not create workspace');
    }
  }

  async function handleInvite() {
    if (!inviteEmail.trim() || !appState.activeWorkspace) return;
    try {
      await inviteWorkspaceMember(appState.activeWorkspace.id, inviteEmail, inviteRole);
      inviteEmail = '';
      appState.showToast({ title: 'Invite sent', body: `Invited user to workspace as ${inviteRole}.` });
      await loadData();
    } catch (e: any) {
      appState.showError(e.message || 'Could not send invite');
    }
  }

  async function handleAcceptInvite(token: string) {
    try {
      await acceptWorkspaceInvite(token);
      appState.showToast({ title: 'Invite accepted', body: 'You joined the workspace.' });
      await loadData();
    } catch (e: any) {
      appState.showError(e.message || 'Could not accept invite');
    }
  }

  async function switchWorkspace(ws: any) {
    localStorage.setItem("bolodb_active_workspace_id", ws.id);
    // localStorage.removeItem("bolodb_active_db_id"); // Persist per workspace
    appState.activeWorkspace = ws;
    appState.dbInfo = null;
    appState.isLoaded = false;
    appState.activeConversationId = null;
    await appState.init(true);
  }

  async function handleUpdateRole(userId: string, newRole: string) {
    if (!appState.activeWorkspace) return;
    try {
      await updateWorkspaceMemberRole(appState.activeWorkspace.id, userId, newRole);
      await loadData();
    } catch (e: any) {
      appState.showError(e.message || 'Could not update role');
    }
  }

  async function handleRemoveMember(userId: string) {
    if (!appState.activeWorkspace) return;
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      await removeWorkspaceMember(appState.activeWorkspace.id, userId);
      await loadData();
    } catch (e: any) {
      appState.showError(e.message || 'Could not remove member');
    }
  }
</script>

<svelte:head>
  <title>Workspace Settings — BoloDB</title>
</svelte:head>

{#if loading}
  <LoadingScreen variant="connect" message="Loading settings…" submessage="" />
{:else}
<div class="official-layout">
  <div class="header">
    <div class="header-logo">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
      <h1>Workspace Settings</h1>
    </div>
    <div style="display:flex;align-items:center;gap:12px">
      <button class="btn btn-ghost" onclick={() => goto('/chat')}>Back to chat</button>
    </div>
  </div>

  <div class="content-split">
    <!-- Main Pane (Active Workspace) -->
    <div class="main-pane">
      {#if error}
        <div class="error-msg">{error}</div>
      {/if}

      {#if appState.activeWorkspace}
        <div class="section-block">
          <h2>Active Workspace</h2>
          <div class="ws-card active-ws-card">
            <div class="ws-header">
              <div class="ws-info">
                {#if editingWorkspaceId === appState.activeWorkspace.id}
                  <div class="edit-row">
                    <input type="text" class="input-inline" bind:value={editWorkspaceName} onkeydown={(e) => e.key === 'Enter' && handleRename(appState.activeWorkspace.id)} autofocus />
                    <button class="btn-inline primary" onclick={() => handleRename(appState.activeWorkspace.id)}>Save</button>
                    <button class="btn-inline" onclick={() => editingWorkspaceId = null}>Cancel</button>
                  </div>
                {:else}
                  <span class="ws-title">{appState.activeWorkspace.name}</span>
                  {#if isAdmin}
                    <button class="icon-btn" onclick={() => { editingWorkspaceId = appState.activeWorkspace.id; editWorkspaceName = appState.activeWorkspace.name; }} aria-label="Edit name">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    </button>
                  {/if}
                {/if}
              </div>
              <span class="role-badge" data-role={appState.activeWorkspace.role}>{appState.activeWorkspace.role}</span>
            </div>
            <div class="ws-meta">
              <span>{members.length} member{members.length === 1 ? '' : 's'}</span>
              <span>Workspace ID: {appState.activeWorkspace.id.substring(0,8)}...</span>
            </div>
          </div>
        </div>

        <div class="section-block">
          <h2>Members</h2>
          <div class="members-list">
            {#each members as member}
              <div class="member-row">
                <div class="member-info">
                  <div class="member-avatar">{member.email ? member.email.substring(0,2).toUpperCase() : 'U'}</div>
                  <div>
                    <div class="member-name">{member.email || member.user_id}</div>
                    <div class="member-date">Joined {new Date(member.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <div class="member-actions">
                  {#if isAdmin}
                    <select class="role-select" value={member.role} onchange={(e) => handleUpdateRole(member.user_id, e.currentTarget.value)}>
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                      <option value="readonly">Read-only</option>
                    </select>
                    <button class="icon-btn del-btn" onclick={() => handleRemoveMember(member.user_id)} aria-label="Remove member">✕</button>
                  {:else}
                    <span class="role-badge" data-role={member.role}>{member.role}</span>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>

        {#if isAdmin}
          <ActivityLog />
        {/if}
      {:else}
        <div class="empty-state">
          <h3>No Active Workspace</h3>
          <p>You don't have an active workspace selected. Please create or switch to one.</p>
        </div>
      {/if}
    </div>

    <!-- Right Pane (Invites & Other Workspaces) -->
    <div class="side-pane">
      {#if isAdmin}
        <div class="side-card">
          <h3>Invite Member</h3>
          <div class="form-row">
            <input type="email" class="input" placeholder="User email" bind:value={inviteEmail} />
          </div>
          <div class="form-row" style="margin-top:8px">
            <select class="input" bind:value={inviteRole}>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
              <option value="readonly">Read-only</option>
            </select>
            <button class="btn btn-primary" onclick={handleInvite} disabled={!inviteEmail.trim()}>Invite</button>
          </div>
        </div>
      {/if}

      {#if invites.length > 0}
        <div class="side-card highlight">
          <h3>Pending Invites ({invites.length})</h3>
          <div class="invites-list">
            {#each invites as invite}
              <div class="invite-item">
                <div>
                  <div class="inv-role">Invited as {invite.role}</div>
                  <div class="inv-id">ID: {invite.workspace_id.substring(0,8)}</div>
                </div>
                <button class="btn btn-sm btn-primary" onclick={() => handleAcceptInvite(invite.token)}>Accept</button>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <div class="side-card">
        <h3>Other Workspaces</h3>
        <div class="ws-list">
          {#each (appState.workspaces || []).filter(w => w.id !== appState.activeWorkspace?.id) as ws}
            <div class="ws-list-item">
              <div>
                <div class="ws-list-name">{ws.name}</div>
                <div class="ws-list-role">{ws.role}</div>
              </div>
              <button class="btn btn-sm btn-ghost" onclick={() => switchWorkspace(ws)}>Switch</button>
            </div>
          {/each}
          {#if (appState.workspaces || []).filter(w => w.id !== appState.activeWorkspace?.id).length === 0}
            <div class="empty-text">No other workspaces.</div>
          {/if}
        </div>

        <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border-2)">
          <h4 style="margin:0 0 8px;font-size:13px;font-weight:600;color:var(--ink)">Create Workspace</h4>
          <div class="form-row">
            <input type="text" class="input" placeholder="Workspace name" bind:value={newWorkspaceName} />
            <button class="btn btn-primary" onclick={handleCreateWorkspace} disabled={!newWorkspaceName.trim()}>Create</button>
          </div>
        </div>

        <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border-2)">
          <h4 style="margin:0 0 8px;font-size:13px;font-weight:600;color:var(--ink)">Join Workspace</h4>
          <div class="form-row">
            <input type="text" class="input" placeholder="Invite code" bind:value={joinToken} />
            <button class="btn btn-primary" onclick={() => { handleAcceptInvite(joinToken); joinToken = ''; }} disabled={!joinToken.trim()}>Join</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
{/if}

<style>
  .official-layout {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 48px 32px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 40px;
  }
  .header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    border-bottom: 1px solid var(--border);
    padding-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;
  }
  .header-logo {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .header h1 {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--ink);
    margin: 0;
  }
  .content-split {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 48px;
    align-items: start;
  }
  @media (max-width: 900px) {
    .content-split {
      grid-template-columns: 1fr;
    }
  }

  .section-block {
    margin-bottom: 40px;
  }
  .section-block h2 {
    font-size: 18px;
    font-weight: 700;
    color: var(--ink);
    margin: 0 0 16px;
  }

  .ws-card {
    background: var(--card);
    border: 1.5px solid var(--brand);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 8px 24px -12px rgba(var(--brand-rgb), 0.15);
  }
  .ws-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .ws-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .ws-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--ink);
  }
  .ws-meta {
    display: flex;
    gap: 16px;
    font-size: 13px;
    color: var(--muted);
  }
  .role-badge {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 4px 8px;
    border-radius: 99px;
    background: var(--surface-3);
    color: var(--ink);
  }
  .role-badge[data-role="owner"] { background: var(--brand-tint); color: var(--brand); }
  .role-badge[data-role="admin"] { background: var(--surface-3); color: var(--ink); }

  .members-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .member-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: var(--card);
    border: 1px solid var(--border-2);
    border-radius: 10px;
  }
  .member-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .member-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--brand-tint);
    color: var(--brand);
    display: grid;
    place-items: center;
    font-size: 13px;
    font-weight: 700;
  }
  .member-name {
    font-size: 14.5px;
    font-weight: 600;
    color: var(--ink);
  }
  .member-date {
    font-size: 12px;
    color: var(--muted);
  }
  .member-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .side-pane {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .side-card {
    background: var(--surface-1);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px;
  }
  .side-card.highlight {
    border-color: var(--brand);
    background: var(--brand-tint);
  }
  .side-card h3 {
    margin: 0 0 16px;
    font-size: 15px;
    font-weight: 700;
    color: var(--ink);
  }

  .form-row {
    display: flex;
    gap: 8px;
  }

  .input {
    flex: 1;
    background: var(--card);
    border: 1px solid var(--border-2);
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 14px;
    color: var(--ink);
    outline: none;
    transition: border-color 0.2s;
  }
  .input:focus { border-color: var(--brand); }

  .role-select {
    background: var(--surface-2);
    border: 1px solid var(--border-2);
    border-radius: 6px;
    padding: 6px 10px;
    font-size: 13px;
    color: var(--ink);
    outline: none;
  }

  .btn {
    background: var(--surface-3);
    color: var(--ink);
    border: none;
    border-radius: 8px;
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .btn:hover { filter: brightness(0.95); }
  .btn-primary { background: var(--brand); color: var(--on-brand); }
  .btn-primary:hover { filter: brightness(1.1); box-shadow: 0 4px 14px var(--brand-shadow); }
  .btn-primary:disabled { opacity: 0.7; cursor: default; box-shadow: none; }
  .btn-ghost { background: transparent; color: var(--muted); border: 1px solid var(--border); }
  .btn-ghost:hover { color: var(--ink); border-color: var(--border-2); }
  .btn-sm { padding: 6px 12px; font-size: 12.5px; }

  .icon-btn {
    background: transparent;
    border: none;
    color: var(--muted);
    padding: 4px;
    border-radius: 6px;
    cursor: pointer;
    display: inline-flex;
    transition: all 0.15s;
  }
  .icon-btn:hover { background: var(--surface-3); color: var(--ink); }
  .del-btn:hover { background: var(--c-low-tint); color: var(--low); }

  .input-inline {
    background: var(--card);
    border: 1px solid var(--brand);
    border-radius: 6px;
    padding: 4px 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--ink);
    outline: none;
  }
  .edit-row { display: flex; gap: 6px; }
  .btn-inline { background: var(--surface-3); border: none; border-radius: 6px; padding: 4px 10px; font-size: 12px; font-weight: 600; cursor: pointer; color: var(--ink); }
  .btn-inline.primary { background: var(--brand); color: var(--on-brand); }

  .invites-list, .ws-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .invite-item, .ws-list-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    background: var(--card);
    border: 1px solid var(--border-2);
    border-radius: 8px;
  }
  .inv-role, .ws-list-name { font-size: 13px; font-weight: 600; color: var(--ink); }
  .inv-id, .ws-list-role { font-size: 11.5px; color: var(--muted); }

  .empty-text { font-size: 13px; color: var(--muted); }
  .error-msg {
    color: var(--c-low-ink);
    background: var(--c-low-tint);
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 24px;
  }
  .empty-state {
    padding: 48px;
    text-align: center;
    background: var(--surface-1);
    border: 1px dashed var(--border);
    border-radius: 12px;
  }
</style>
