<script lang="ts">
  import { page } from '$app/stores';
  import LL from '$lib/i18n/i18n-svelte';

  let { size = 28, sub = true }: { size?: number; sub?: boolean } = $props();
</script>

<div class="logo-wrapper" style="display:flex;align-items:center;gap:10px">
  <svg
    width={size}
    height={size}
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style="flex-shrink:0"
  >
    <rect width="28" height="28" rx="8" fill="var(--brand)" />
    <path
      d="M10.8 6.5 L10.8 18 L13.2 18 L13.2 6.5 Z M6.5 12.8 L18 12.8 L18 10.4 L6.5 10.4 Z"
      fill="#fff"
      transform="translate(1, 1) scale(0.85)"
    />
  </svg>
  <div style="line-height:1.15">
    <span style="font-weight:800;font-size:{size * 0.75}px;color:var(--ink);letter-spacing:-.02em"
      >{$LL.common.appName()}</span
    >
    {#if sub}
      <div style="font-size:{size * 0.38}px;color:var(--muted);font-weight:600;margin-top:1px">
        {$LL.common.tagline()}
      </div>
    {/if}
  </div>
</div>
