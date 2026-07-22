<script lang="ts">
  import ChartPanel from './ChartPanel.svelte';

  let { dashboard, panelData, savedQueries, onSave, onAdd, onRemove } = $props();

  let showAddModal = $state(false);
  let selectedQueryId = $state('');
  let panelTitle = $state('');
  let vizType = $state('table');
  let panelW = $state(6);
  let panelH = $state(4);

  // Drag state
  let draggedPanelId: string | null = $state(null);

  function handleDragStart(e: DragEvent, panel: any) {
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      draggedPanelId = panel.id;
      // Add ghost image or style here if needed
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault(); // necessary to allow dropping
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  }

  function handleDrop(e: DragEvent, targetPanel: any) {
    e.preventDefault();
    if (!draggedPanelId || draggedPanelId === targetPanel.id) return;

    // Swap positions in the local array
    const sourceIdx = dashboard.panels.findIndex((p: any) => p.id === draggedPanelId);
    const targetIdx = dashboard.panels.findIndex((p: any) => p.id === targetPanel.id);

    if (sourceIdx !== -1 && targetIdx !== -1) {
      const sourcePanel = dashboard.panels[sourceIdx];
      const targetPanel = dashboard.panels[targetIdx];

      // Swap grid coordinates
      const tempPos = { ...sourcePanel.position };
      sourcePanel.position = { ...targetPanel.position };
      targetPanel.position = tempPos;

      // Re-trigger reactivity
      dashboard.panels = [...dashboard.panels];

      // Auto-save on drop
      savePositions();
    }
    draggedPanelId = null;
  }

  function handleDragEnd() {
    draggedPanelId = null;
  }

  function savePositions() {
    const updates = dashboard.panels.map((p: any) => ({
      id: p.id,
      position: p.position
    }));
    onSave(updates);
  }

  function submitAddPanel() {
    if (!selectedQueryId) {
      alert("Please select a query");
      return;
    }
    const sq = savedQueries.find((q: any) => q.id === selectedQueryId);

    // Auto-place at bottom
    let maxY = 0;
    for (const p of dashboard.panels) {
      if (p.position?.y + p.position?.h > maxY) {
        maxY = p.position.y + p.position.h;
      }
    }

    onAdd({
      saved_query_id: selectedQueryId,
      title: panelTitle || sq?.name || 'Untitled',
      visualization_type: vizType,
      position: { x: 0, y: maxY, w: panelW, h: panelH }
    });

    showAddModal = false;
    selectedQueryId = '';
    panelTitle = '';
    vizType = 'table';
  }
</script>

<div style="display:flex; gap:12px; margin-bottom:24px;">
  <button
    onclick={() => showAddModal = true}
    class="btn-primary-glow"
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg>
    Add Chart Panel
  </button>
  <button
    onclick={savePositions}
    class="btn-secondary"
  >
    Save Layout Order
  </button>
</div>

<div style="display:grid;grid-template-columns:repeat(12, 1fr);gap:16px;width:100%;grid-auto-rows:minmax(100px, auto);">
  {#each dashboard.panels as panel (panel.id)}
    {@const x = panel.position?.x || 0}
    {@const y = panel.position?.y || 0}
    {@const w = panel.position?.w || 4}
    {@const h = panel.position?.h || 4}
    <div
      class="dash-panel-card"
      style="grid-column: span {w}; grid-row: span {h}; cursor:move; position:relative; opacity: {draggedPanelId === panel.id ? 0.5 : 1};"
      draggable="true"
      ondragstart={(e) => handleDragStart(e, panel)}
      ondragover={handleDragOver}
      ondrop={(e) => handleDrop(e, panel)}
      ondragend={handleDragEnd}
    >
       <!-- Delete button overlay -->
       <button
         class="icon-btn"
         style="position:absolute;top:8px;right:8px;z-index:10;background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:4px;color:var(--danger)"
         onclick={(e) => { e.stopPropagation(); onRemove(panel.id); }}
       >
         <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
         </svg>
       </button>

       <!-- Intercept clicks so chart doesn't eat them during drag -->
       <div style="position:absolute;inset:0;z-index:0;background:transparent;"></div>

       <div style="height:100%;width:100%;pointer-events:none;">
         <ChartPanel {panel} data={panelData[panel.saved_query_id]} />
       </div>
    </div>
  {/each}
</div>

{#if showAddModal}
  <div class="modal-backdrop" onclick={() => showAddModal = false}>
    <div class="modal-content glass-modal" onclick={(e) => e.stopPropagation()} style="max-width:500px;">
      <div class="modal-header">
        <h3>Add Chart Panel</h3>
        <button class="close-btn" onclick={() => showAddModal = false}>✕</button>
      </div>

      <div class="modal-body">
        <div class="input-group" style="margin-bottom:16px">
          <label>Saved Query</label>
          <select bind:value={selectedQueryId} class="input">
            <option value="">-- Select Query --</option>
            {#each savedQueries as sq}
              <option value={sq.id}>{sq.name}</option>
            {/each}
          </select>
        </div>

        <div class="input-group" style="margin-bottom:16px">
          <label>Panel Title (Optional)</label>
          <input type="text" class="input" bind:value={panelTitle} placeholder="Inherit from query if blank" />
        </div>

        <div class="input-group" style="margin-bottom:16px">
          <label>Visualization Type</label>
          <select bind:value={vizType} class="input">
            <option value="table">Data Table</option>
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="pie">Pie Chart</option>
            <option value="area">Area Chart</option>
            <option value="number">Single Number Card</option>
          </select>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <div class="input-group">
            <label>Width (1-12)</label>
            <input type="number" min="1" max="12" class="input" bind:value={panelW} />
          </div>
          <div class="input-group">
            <label>Height (rows)</label>
            <input type="number" min="2" max="12" class="input" bind:value={panelH} />
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" onclick={() => showAddModal = false}>Cancel</button>
        <button class="btn-primary-glow" onclick={submitAddPanel}>
          Add Panel
        </button>
      </div>
    </div>
  </div>
{/if}
