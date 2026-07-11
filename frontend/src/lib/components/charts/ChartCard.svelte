<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    title,
    subtitle,
    empty = false,
    emptyText = 'No data yet',
    className = '',
    children,
  }: {
    title: string;
    subtitle?: string;
    empty?: boolean;
    emptyText?: string;
    className?: string;
    children?: Snippet;
  } = $props();
</script>

<div class="card p-5 rise {className}" style="overflow:hidden;">
  <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:16px;">
    <div>
      <h3 style="font-size:13px;font-weight:800;color:var(--faint);letter-spacing:.07em;text-transform:uppercase;margin:0;">{title}</h3>
      {#if subtitle}
        <p style="font-size:12px;color:var(--muted);margin:3px 0 0;">{subtitle}</p>
      {/if}
    </div>
  </div>

  {#if empty}
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:180px;border:1px dashed var(--border-2);border-radius:var(--radius);background:var(--surface-2);">
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--faint);margin-bottom:8px;">
        <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
      </svg>
      <span style="font-size:13px;font-weight:600;color:var(--faint);">{emptyText}</span>
    </div>
  {:else if children}
    {@render children()}
  {/if}
</div>
