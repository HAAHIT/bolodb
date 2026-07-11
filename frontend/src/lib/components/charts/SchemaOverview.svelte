<script lang="ts">
  import type { SchemaTable } from '$lib/types';
  import { CHART_COLORS } from './chartUtils';

  let {
    schema,
  }: {
    schema: SchemaTable[];
  } = $props();

  const tableData = $derived(
    schema
      .map((t) => ({
        name: t.name,
        rowCount: parseInt(t.rows.replace(/,/g, ''), 10) || 0,
        colCount: t.cols.length,
      }))
      .sort((a, b) => b.rowCount - a.rowCount)
      .slice(0, 10),
  );

  const maxRows = $derived(Math.max(...tableData.map((t) => t.rowCount), 1));
</script>

{#if tableData.length === 0}
  <div style="display:flex;align-items:center;justify-content:center;height:180px;">
    <span style="font-size:13px;font-weight:600;color:var(--faint);">No schema data</span>
  </div>
{:else}
  <div style="display:flex;flex-direction:column;gap:8px;">
    {#each tableData as table, i}
      {@const pct = Math.round((table.rowCount / maxRows) * 100)}
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
          <span style="font-size:13px;font-weight:650;color:var(--ink);">{table.name}</span>
          <span style="font-size:12px;font-weight:600;color:var(--muted);font-variant-numeric:tabular-nums;">{table.rowCount.toLocaleString()} rows · {table.colCount} cols</span>
        </div>
        <div style="height:8px;border-radius:4px;background:var(--surface-3);overflow:hidden;">
          <div
            style="height:100%;width:{pct}%;border-radius:4px;background:{CHART_COLORS[i % CHART_COLORS.length]};transition:width 0.6s var(--ease);"
          ></div>
        </div>
      </div>
    {/each}
  </div>
{/if}
