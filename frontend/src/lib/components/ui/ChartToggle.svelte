<script lang="ts">
  let { mode = 'table', onToggle }: { mode: 'table' | 'chart'; onToggle: () => void } = $props();
</script>

<button
  onclick={onToggle}
  style="display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:8px;font-size:12px;font-weight:700;border:1px solid var(--border-2);background:var(--surface-2);color:var(--ink-2);cursor:pointer;transition:all .15s;"
  onmouseenter={(e) => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand-ink)'; e.currentTarget.style.background = 'var(--brand-tint)'; }}
  onmouseleave={(e) => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--ink-2)'; e.currentTarget.style.background = 'var(--surface-2)'; }}
>
  {#if mode === 'table'}
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/></svg>
    Chart
  {:else}
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
    Table
  {/if}
</button>
