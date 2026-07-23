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

  type Section = 'general' | 'members' | 'invites' | 'activity' | 'workspaces';

  let loading = $state(true);
  let error = $state('');
  let section = $state<Section>('general');
  let newWorkspaceName = $state('');
  let joinToken = $state('');
  let inviteEmail = $state('');
  let inviteRole = $state('member');
  let members = $state<any[]>([]);
  let invites = $state<any[]>([]);
  let editWorkspaceName = $state('');
  let savingName = $state(false);
  let inviting = $state(false);
  let copied = $state(false);

  const isAdmin = $derived(
    appState.activeWorkspace?.role === 'admin' ||
      appState.activeWorkspace?.role === 'owner',
  );

  const sections = $derived([
    { id: 'general' as const, label: 'General', desc: 'Name & identity' },
    { id: 'members' as const, label: 'Members', desc: 'Roles & access' },
    ...(isAdmin
      ? [
          { id: 'invites' as const, label: 'Invitations', desc: 'Add teammates' },
          { id: 'activity' as const, label: 'Activity', desc: 'Audit trail' },
        ]
      : []),
    { id: 'workspaces' as const, label: 'Workspaces', desc: 'Switch or create' },
  ]);

  onMount(async () => {
    if (!appState.isLoaded) await appState.init(false);
    await loadData();
    loading = false;
  });

  async function loadData() {
    try {
      await appState.loadWorkspaces();
      invites = appState.invites || [];
      if (appState.activeWorkspace) {
        editWorkspaceName = appState.activeWorkspace.name;
        members = await getWorkspaceMembers(appState.activeWorkspace.id);
      }
      error = '';
    } catch (e: any) {
      error = e.message || 'Could not load workspaces';
    }
  }

  async function handleRename() {
    if (!appState.activeWorkspace || !editWorkspaceName.trim() || !isAdmin) return;
    savingName = true;
    try {
      await updateWorkspace(appState.activeWorkspace.id, editWorkspaceName.trim());
      await loadData();
      appState.showToast({ title: 'Workspace updated', body: 'Name saved successfully.' });
    } catch (e: any) {
      appState.showError(e.message || 'Could not rename workspace');
    } finally {
      savingName = false;
    }
  }

  async function handleCreateWorkspace() {
    if (!newWorkspaceName.trim()) return;
    try {
      await createWorkspace(newWorkspaceName.trim());
      newWorkspaceName = '';
      await loadData();
      appState.showToast({ title: 'Workspace created', body: 'You are the owner.' });
    } catch (e: any) {
      appState.showError(e.message || 'Could not create workspace');
    }
  }

  async function handleInvite() {
    if (!inviteEmail.trim() || !appState.activeWorkspace) return;
    inviting = true;
    try {
      await inviteWorkspaceMember(
        appState.activeWorkspace.id,
        inviteEmail.trim(),
        inviteRole,
      );
      inviteEmail = '';
      appState.showToast({
        title: 'Invite sent',
        body: `Invitation emailed as ${inviteRole}.`,
      });
      await loadData();
    } catch (e: any) {
      appState.showError(e.message || 'Could not send invite');
    } finally {
      inviting = false;
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
    localStorage.setItem('bolodb_active_workspace_id', ws.id);
    appState.activeWorkspace = ws;
    appState.dbInfo = null;
    appState.isLoaded = false;
    appState.activeConversationId = null;
    await appState.init(true);
    await loadData();
    section = 'general';
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
    if (!confirm('Remove this member from the workspace?')) return;
    try {
      await removeWorkspaceMember(appState.activeWorkspace.id, userId);
      await loadData();
    } catch (e: any) {
      appState.showError(e.message || 'Could not remove member');
    }
  }

  async function copyWorkspaceId() {
    if (!appState.activeWorkspace) return;
    try {
      await navigator.clipboard.writeText(appState.activeWorkspace.id);
      copied = true;
      setTimeout(() => (copied = false), 1600);
    } catch {
      appState.showError('Could not copy workspace ID');
    }
  }
</script>

<svelte:head>
  <title>Workspace Settings — BoloDB</title>
</svelte:head>

{#if loading}
  <LoadingScreen variant="connect" message="Loading workspace settings…" submessage="" />
{:else}
  <div class="settings-shell">
    <header class="top">
      <div>
        <p class="eyebrow">Administration</p>
        <h1>Workspace settings</h1>
        <p class="lede">
          Manage identity, members, and access for
          <strong>{appState.activeWorkspace?.name || 'your workspace'}</strong>.
        </p>
      </div>
      <button class="btn ghost" onclick={() => goto('/chat')}>Back to chat</button>
    </header>

    {#if error}
      <div class="banner error">{error}</div>
    {/if}

    {#if invites.length > 0}
      <div class="banner invite">
        <div>
          <strong>{invites.length} pending invitation{invites.length === 1 ? '' : 's'}</strong>
          <span>Accept to join another workspace.</span>
        </div>
        <button class="btn primary sm" onclick={() => (section = 'workspaces')}>Review</button>
      </div>
    {/if}

    <div class="layout">
      <nav class="nav" aria-label="Settings sections">
        {#each sections as s}
          <button
            class="nav-item"
            class:active={section === s.id}
            onclick={() => (section = s.id)}
          >
            <span class="nav-label">{s.label}</span>
            <span class="nav-desc">{s.desc}</span>
          </button>
        {/each}
      </nav>

      <main class="main">
        {#if !appState.activeWorkspace && section !== 'workspaces'}
          <div class="empty-card">
            <h3>No active workspace</h3>
            <p>Create or switch to a workspace to manage settings.</p>
            <button class="btn primary" onclick={() => (section = 'workspaces')}>
              Go to workspaces
            </button>
          </div>
        {:else if section === 'general' && appState.activeWorkspace}
          <section class="panel">
            <div class="panel-head">
              <h2>General</h2>
              <p>Workspace identity visible to all members.</p>
            </div>
            <div class="panel-body">
              <div class="field-row">
                <div class="field-info">
                  <label for="ws-name">Display name</label>
                  <span>Shown in the sidebar and invite emails.</span>
                </div>
                <div class="field-control">
                  <input
                    id="ws-name"
                    class="input"
                    bind:value={editWorkspaceName}
                    disabled={!isAdmin}
                  />
                  {#if isAdmin}
                    <button
                      class="btn primary"
                      onclick={handleRename}
                      disabled={savingName || !editWorkspaceName.trim()}
                    >
                      {savingName ? 'Saving…' : 'Save'}
                    </button>
                  {/if}
                </div>
              </div>
              <div class="divider"></div>
              <div class="field-row">
                <div class="field-info">
                  <label>Your role</label>
                  <span>Permissions for this workspace.</span>
                </div>
                <span class="role-badge" data-role={appState.activeWorkspace.role}>
                  {appState.activeWorkspace.role}
                </span>
              </div>
              <div class="divider"></div>
              <div class="field-row">
                <div class="field-info">
                  <label>Workspace ID</label>
                  <span>Use when contacting support.</span>
                </div>
                <div class="id-row">
                  <code>{appState.activeWorkspace.id}</code>
                  <button class="btn ghost sm" onclick={copyWorkspaceId}>
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <div class="divider"></div>
              <div class="field-row">
                <div class="field-info">
                  <label>Members</label>
                  <span>People with access to this workspace.</span>
                </div>
                <span class="stat">{members.length}</span>
              </div>
            </div>
          </section>

          <section class="panel muted-panel">
            <div class="panel-head">
              <h2>Data & privacy</h2>
              <p>How BoloDB handles workspace data.</p>
            </div>
            <div class="panel-body stack">
              <div class="policy">
                <strong>Read-only queries</strong>
                <span>SQL execution is restricted to SELECT statements.</span>
              </div>
              <div class="policy">
                <strong>Schema-only AI context</strong>
                <span>Prompts include structure and samples — never bulk rows or credentials.</span>
              </div>
              <div class="policy">
                <strong>Workspace-scoped knowledge</strong>
                <span>Catalog terms and verified examples stay inside this workspace.</span>
              </div>
            </div>
          </section>
        {:else if section === 'members' && appState.activeWorkspace}
          <section class="panel">
            <div class="panel-head">
              <h2>Members</h2>
              <p>Control who can ask questions, manage connections, and edit dashboards.</p>
            </div>
            <div class="members">
              {#each members as member}
                <div class="member">
                  <div class="member-left">
                    <div class="avatar">
                      {(member.email || 'U').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div class="member-name">{member.email || member.user_id}</div>
                      <div class="member-meta">
                        Joined {member.joined_at || member.created_at
                          ? new Date(member.joined_at || member.created_at).toLocaleDateString()
                          : '—'}
                      </div>
                    </div>
                  </div>
                  <div class="member-right">
                    {#if isAdmin && member.role !== 'owner'}
                      <select
                        class="select"
                        value={member.role}
                        onchange={(e) =>
                          handleUpdateRole(member.user_id, e.currentTarget.value)}
                      >
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                      </select>
                      <button
                        class="icon-btn"
                        aria-label="Remove member"
                        onclick={() => handleRemoveMember(member.user_id)}
                      >✕</button>
                    {:else}
                      <span class="role-badge" data-role={member.role}>{member.role}</span>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
            <div class="roles-help">
              <div><strong>Owner</strong> — full control, including billing-level actions.</div>
              <div><strong>Admin</strong> — manage members, connections, catalog, dashboards.</div>
              <div><strong>Member</strong> — ask questions and view shared resources.</div>
            </div>
          </section>
        {:else if section === 'invites' && isAdmin && appState.activeWorkspace}
          <section class="panel">
            <div class="panel-head">
              <h2>Invite teammates</h2>
              <p>Send an email invitation with a role. They’ll join after accepting.</p>
            </div>
            <div class="invite-form">
              <label class="field">
                <span>Email</span>
                <input
                  type="email"
                  class="input"
                  placeholder="name@company.com"
                  bind:value={inviteEmail}
                />
              </label>
              <label class="field">
                <span>Role</span>
                <select class="input" bind:value={inviteRole}>
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                </select>
              </label>
              <button
                class="btn primary"
                onclick={handleInvite}
                disabled={inviting || !inviteEmail.trim()}
              >
                {inviting ? 'Sending…' : 'Send invite'}
              </button>
            </div>
          </section>
        {:else if section === 'activity' && isAdmin}
          <section class="panel">
            <div class="panel-head">
              <h2>Activity log</h2>
              <p>Recent administrative events in this workspace.</p>
            </div>
            <ActivityLog />
          </section>
        {:else if section === 'workspaces'}
          <section class="panel">
            <div class="panel-head">
              <h2>Your workspaces</h2>
              <p>Switch context or create a new workspace for another team.</p>
            </div>
            <div class="ws-list">
              {#each appState.workspaces || [] as ws}
                <div class="ws-item" class:active={ws.id === appState.activeWorkspace?.id}>
                  <div>
                    <div class="ws-name">{ws.name}</div>
                    <div class="ws-meta">{ws.role}</div>
                  </div>
                  {#if ws.id === appState.activeWorkspace?.id}
                    <span class="pill">Current</span>
                  {:else}
                    <button class="btn ghost sm" onclick={() => switchWorkspace(ws)}>Switch</button>
                  {/if}
                </div>
              {/each}
            </div>
          </section>

          {#if invites.length > 0}
            <section class="panel">
              <div class="panel-head">
                <h2>Pending invitations</h2>
              </div>
              <div class="ws-list">
                {#each invites as invite}
                  <div class="ws-item">
                    <div>
                      <div class="ws-name">Invited as {invite.role}</div>
                      <div class="ws-meta">Workspace {invite.workspace_id?.substring(0, 8)}…</div>
                    </div>
                    <button class="btn primary sm" onclick={() => handleAcceptInvite(invite.token)}>
                      Accept
                    </button>
                  </div>
                {/each}
              </div>
            </section>
          {/if}

          <section class="panel">
            <div class="panel-head">
              <h2>Create workspace</h2>
              <p>Start a new isolated space for another team or environment.</p>
            </div>
            <div class="inline-form">
              <input
                class="input"
                placeholder="e.g. Acme Analytics"
                bind:value={newWorkspaceName}
              />
              <button
                class="btn primary"
                onclick={handleCreateWorkspace}
                disabled={!newWorkspaceName.trim()}
              >Create</button>
            </div>
          </section>

          <section class="panel">
            <div class="panel-head">
              <h2>Join with invite code</h2>
              <p>Paste a token from an invitation email if you weren’t auto-matched.</p>
            </div>
            <div class="inline-form">
              <input class="input" placeholder="Invite code" bind:value={joinToken} />
              <button
                class="btn primary"
                onclick={() => {
                  handleAcceptInvite(joinToken);
                  joinToken = '';
                }}
                disabled={!joinToken.trim()}
              >Join</button>
            </div>
          </section>
        {/if}
      </main>
    </div>
  </div>
{/if}

<style>
  .settings-shell {
    max-width: 1120px;
    margin: 0 auto;
    padding: 40px 28px 72px;
    box-sizing: border-box;
  }
  .top {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 20px;
    margin-bottom: 28px;
    flex-wrap: wrap;
  }
  .eyebrow {
    margin: 0 0 6px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--faint);
  }
  h1 {
    margin: 0;
    font-size: 30px;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: var(--ink);
  }
  .lede {
    margin: 8px 0 0;
    color: var(--muted);
    font-size: 14.5px;
    max-width: 520px;
    line-height: 1.5;
  }
  .lede strong { color: var(--ink-2); }
  .layout {
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr);
    gap: 28px;
    align-items: start;
  }
  .nav {
    display: flex;
    flex-direction: column;
    gap: 4px;
    position: sticky;
    top: 76px;
  }
  .nav-item {
    text-align: left;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 12px;
    padding: 12px 14px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 2px;
    transition: all 0.15s ease;
  }
  .nav-item:hover { background: var(--surface-2); }
  .nav-item.active {
    background: var(--surface);
    border-color: var(--border);
    box-shadow: var(--shadow-sm);
  }
  .nav-label { font-size: 14px; font-weight: 700; color: var(--ink); }
  .nav-desc { font-size: 12px; color: var(--muted); }
  .main { display: flex; flex-direction: column; gap: 18px; min-width: 0; }
  .panel {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: var(--shadow-sm);
  }
  .muted-panel { background: var(--surface-2); }
  .panel-head {
    padding: 20px 22px 0;
  }
  .panel-head h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 750;
    color: var(--ink);
  }
  .panel-head p {
    margin: 6px 0 0;
    font-size: 13.5px;
    color: var(--muted);
    line-height: 1.45;
  }
  .panel-body { padding: 8px 0 10px; }
  .panel-body.stack { padding: 18px 22px 22px; display: flex; flex-direction: column; gap: 12px; }
  .field-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
    padding: 16px 22px;
  }
  .field-info { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
  .field-info label { font-size: 14px; font-weight: 650; color: var(--ink); }
  .field-info span { font-size: 12.5px; color: var(--muted); }
  .field-control { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
  .divider { height: 1px; background: var(--border); margin: 0 22px; }
  .input, .select {
    background: var(--bg);
    border: 1px solid var(--border-2);
    border-radius: 10px;
    padding: 10px 12px;
    font-size: 14px;
    color: var(--ink);
    outline: none;
    min-width: 220px;
  }
  .input:focus, .select:focus {
    border-color: var(--brand);
    box-shadow: 0 0 0 3px var(--ring);
  }
  .input:disabled { opacity: 0.65; cursor: not-allowed; }
  .btn {
    border: none;
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 13.5px;
    font-weight: 650;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
  }
  .btn.primary { background: var(--brand); color: var(--on-brand); }
  .btn.primary:hover { filter: brightness(1.05); }
  .btn.primary:disabled { opacity: 0.55; cursor: not-allowed; filter: none; }
  .btn.ghost {
    background: transparent;
    color: var(--muted);
    border: 1px solid var(--border);
  }
  .btn.ghost:hover { color: var(--ink); border-color: var(--border-2); }
  .btn.sm { padding: 7px 12px; font-size: 12.5px; }
  .role-badge {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 5px 10px;
    border-radius: 999px;
    background: var(--surface-3);
    color: var(--ink-2);
  }
  .role-badge[data-role='owner'] { background: var(--brand-tint); color: var(--brand-ink); }
  .role-badge[data-role='admin'] { background: var(--surface-3); color: var(--ink); }
  .id-row { display: flex; align-items: center; gap: 8px; max-width: 100%; }
  .id-row code {
    font-family: var(--font-mono);
    font-size: 11.5px;
    color: var(--muted);
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 7px 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 280px;
  }
  .stat { font-size: 18px; font-weight: 800; color: var(--ink); }
  .policy {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 12px 14px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
  }
  .policy strong { font-size: 13.5px; color: var(--ink); }
  .policy span { font-size: 12.5px; color: var(--muted); line-height: 1.45; }
  .members { display: flex; flex-direction: column; }
  .member {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 14px 22px;
    border-top: 1px solid var(--border);
  }
  .member:first-child { border-top: none; }
  .member-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .avatar {
    width: 38px; height: 38px;
    border-radius: 50%;
    background: var(--brand-tint);
    color: var(--brand-ink);
    display: grid; place-items: center;
    font-size: 12px; font-weight: 750;
    flex-shrink: 0;
  }
  .member-name { font-size: 14px; font-weight: 650; color: var(--ink); }
  .member-meta { font-size: 12px; color: var(--muted); margin-top: 2px; }
  .member-right { display: flex; align-items: center; gap: 8px; }
  .icon-btn {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--muted);
    width: 32px; height: 32px;
    border-radius: 8px;
    cursor: pointer;
  }
  .icon-btn:hover { background: var(--c-low-tint); color: var(--c-low-ink); border-color: #ebc6bd; }
  .roles-help {
    padding: 14px 22px 20px;
    border-top: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 12.5px;
    color: var(--muted);
    background: var(--surface-2);
  }
  .roles-help strong { color: var(--ink-2); }
  .invite-form {
    padding: 18px 22px 22px;
    display: grid;
    grid-template-columns: 1.4fr 0.8fr auto;
    gap: 12px;
    align-items: end;
  }
  .field { display: flex; flex-direction: column; gap: 6px; }
  .field span {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--faint);
  }
  .inline-form {
    padding: 18px 22px 22px;
    display: flex;
    gap: 10px;
  }
  .inline-form .input { flex: 1; min-width: 0; }
  .ws-list { display: flex; flex-direction: column; }
  .ws-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 14px 22px;
    border-top: 1px solid var(--border);
  }
  .ws-item:first-child { border-top: none; }
  .ws-item.active { background: rgba(var(--brand-rgb), 0.04); }
  .ws-name { font-size: 14px; font-weight: 650; color: var(--ink); }
  .ws-meta { font-size: 12px; color: var(--muted); margin-top: 2px; text-transform: capitalize; }
  .pill {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--brand-ink);
    background: var(--brand-tint);
    padding: 5px 10px;
    border-radius: 999px;
  }
  .banner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 12px 16px;
    border-radius: 12px;
    margin-bottom: 18px;
    font-size: 13.5px;
  }
  .banner.error { background: var(--c-low-tint); color: var(--c-low-ink); }
  .banner.invite {
    background: var(--brand-tint);
    color: var(--brand-ink);
    border: 1px solid var(--brand-tint-2);
  }
  .banner.invite span { display: block; font-size: 12.5px; opacity: 0.85; margin-top: 2px; }
  .empty-card {
    background: var(--surface);
    border: 1.5px dashed var(--border);
    border-radius: 16px;
    padding: 48px 28px;
    text-align: center;
  }
  .empty-card h3 { margin: 0 0 8px; color: var(--ink); }
  .empty-card p { margin: 0 0 18px; color: var(--muted); }
  @media (max-width: 860px) {
    .layout { grid-template-columns: 1fr; }
    .nav { position: static; flex-direction: row; overflow-x: auto; gap: 6px; }
    .nav-item { min-width: 140px; }
    .invite-form { grid-template-columns: 1fr; }
    .field-row { flex-direction: column; align-items: flex-start; }
    .field-control { width: 100%; }
    .field-control .input { flex: 1; min-width: 0; width: 100%; }
  }
</style>
