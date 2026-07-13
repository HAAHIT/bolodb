<script lang="ts">
  import LL from "$lib/i18n/i18n-svelte";
  let { level = 'medium', reason = '', compact = false }:
    { level?: 'high' | 'medium' | 'low'; reason?: string; compact?: boolean } = $props();

  const map: Record<string, [string, string]> = {
    high: ['conf-high', $LL.chat.highConfidence()],
    medium: ['conf-med', $LL.chat.mediumConfidence()],
    low: ['conf-low', $LL.chat.lowConfidence()]
  };

  const cls = $derived(map[level]?.[0] ?? map.medium[0]);
  const label = $derived(map[level]?.[1] ?? map.medium[1]);
</script>

<span class="conf {cls}" title={reason}>
  <span class="dot"></span>
  {compact ? label.split(' ')[0] : label}
</span>
