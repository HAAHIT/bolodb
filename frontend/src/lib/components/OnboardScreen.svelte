<script lang="ts">
  import { glossary as defaultGlossary, starters as defaultStarters } from '$lib/data';
  import { apiCall } from '$lib/api';
  import type { SchemaTable, DbInfo, GlossaryItem, StarterItem } from '$lib/types';
  import ProfileStep from '$lib/components/ProfileStep.svelte';
  import GlossaryStep from '$lib/components/GlossaryStep.svelte';
  import StartersStep from '$lib/components/StartersStep.svelte';

  let { onDone, dbInfo, schema, onChangeDb }:
    { onDone: (count: number) => void; dbInfo: DbInfo | null; schema: SchemaTable[] | null; onChangeDb?: () => void } = $props();

  let step = $state('profile');
  let realGlossary: GlossaryItem[] | null = $state(null);
  let realStarters: StarterItem[] | null = $state(null);
  let confirmedGlossary: any[] | null = $state(null);
  let loadErr = $state('');
  let loadingAI = $state(false);

  const stepIndex = $derived(step === 'profile' ? 0 : step === 'glossary' ? 1 : 2);

  async function loadOnboardData() {
    loadErr = '';
    loadingAI = true;
    const errors: string[] = [];
    try {
      const [g, s] = await Promise.allSettled([
        apiCall('/api/onboard/glossary', {}),
        apiCall('/api/onboard/starters', {})
      ]);
      realGlossary = g.status === 'fulfilled' ? (g.value.glossary || []) : defaultGlossary;
      realStarters = s.status === 'fulfilled' ? (s.value.starters || []) : defaultStarters;
      if (g.status === 'rejected') errors.push('glossary');
      if (s.status === 'rejected') errors.push('starters');
      if (errors.length) {
        loadErr = `Failed to load ${errors.join(' and ')} — using built-in examples instead.`;
      }
    } catch (e: any) {
      loadErr = e.message || "Couldn't reach the AI — using built-in examples instead.";
      realGlossary = defaultGlossary;
      realStarters = defaultStarters;
    } finally {
      loadingAI = false;
    }
  }
</script>

<div class="ob">
  {#if onChangeDb}
    <button class="ob-change-db" onclick={onChangeDb} data-testid="onboard-change-db">← Change database</button>
  {/if}
  <div class="ob-logo">
    <svg width="26" height="26" viewBox="0 0 256 256" fill="none">
      <path d="M 52 44 Q 52 30 66 30 L 190 30 Q 204 30 204 44 L 204 138 Q 204 152 190 152 L 116 152 L 88 176 L 92 152 L 66 152 Q 52 152 52 138 Z" stroke="var(--brand)" stroke-width="6" fill="none" />
      <g stroke="var(--brand)" stroke-width="6" stroke-linecap="round" fill="none">
        <ellipse cx="128" cy="66" rx="34" ry="11" />
        <path d="M 94 66 L 94 108 Q 94 119 128 119 Q 162 119 162 108 L 162 66" />
        <path d="M 94 87 Q 94 98 128 98 Q 162 98 162 87" />
      </g>
      <circle cx="182" cy="46" r="3.5" fill="var(--brand)" />
    </svg>
    <span class="ob-name">Bolo<span style="color:var(--brand)">DB</span></span>
  </div>

  <div class="ob-dots" data-testid="onboard-stepper">
    {#each [0, 1, 2] as i}
      <span class="dot" style="width:{i === stepIndex ? '26px' : '10px'};background:{i <= stepIndex ? 'var(--brand)' : 'var(--surface-3)'}"></span>
    {/each}
  </div>

  {#if loadErr}
    <div class="ob-err">
      <b>AI not available:</b> {loadErr} Setup continues with example data — you can re-run it later from Settings.
    </div>
  {/if}

  <div class="ob-step">
    {#if loadingAI}
      <!-- Full-screen AI loading card shown while LLM analyses the schema -->
      <div class="ai-loading-card">
        <div class="ai-loading-icon">
          <div class="ai-ring ai-ring-outer"></div>
          <div class="ai-ring ai-ring-inner"></div>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" class="ai-brain-icon">
            <path d="M12 2l1.09 3.26L16.5 5l-2.5 2.27.82 3.23L12 8.77l-2.82 1.73.82-3.23L7.5 5l3.41.26L12 2z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
            <path d="M5 20h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            <path d="M8 20v-5a4 4 0 0 1 8 0v5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>

        <div class="ai-loading-text">
          <p class="ai-loading-headline">AI is reading your schema<span class="ai-dots"><span>.</span><span>.</span><span>.</span></span></p>
          <p class="ai-loading-sub">Mapping business terms and generating starter questions tailored to your database</p>
        </div>

        <div class="ai-progress-track">
          <div class="ai-progress-bar"></div>
        </div>

        <div class="ai-steps">
          <div class="ai-step ai-step-done">
            <span class="ai-step-dot"></span>
            <span>Schema structure analysed</span>
          </div>
          <div class="ai-step ai-step-active">
            <span class="ai-step-dot"></span>
            <span>Inferring business terminology</span>
          </div>
          <div class="ai-step ai-step-pending">
            <span class="ai-step-dot"></span>
            <span>Generating starter questions</span>
          </div>
        </div>
      </div>
    {:else if step === 'profile'}
      <ProfileStep onNext={async () => { await loadOnboardData(); step = 'glossary'; }} {schema} />
    {:else if step === 'glossary'}
      <GlossaryStep glossaryItems={realGlossary} onNext={(g) => { confirmedGlossary = g; step = 'starters'; }} onBack={() => { step = 'profile'; }} />
    {:else if step === 'starters'}
      <StartersStep starterItems={realStarters} glossary={confirmedGlossary || []} {onDone} onBack={() => { step = 'glossary'; }} />
    {/if}
  </div>

  <div class="ob-footer">READ-ONLY · NO TELEMETRY · YOUR ROWS NEVER LEAVE</div>
</div>

<style>
  .ob {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 48px 24px 40px;
    min-height: 100vh;
    box-sizing: border-box;
    position: relative;
    background: radial-gradient(1000px 600px at 50% -10%, rgba(var(--glow-rgb), 0.1) 0%, transparent 60%), var(--bg);
  }
  .ob-change-db {
    position: absolute;
    top: 20px;
    left: 20px;
    background: transparent;
    border: 1px solid var(--border-2);
    color: var(--muted);
    font-size: 13px;
    font-weight: 600;
    padding: 7px 14px;
    border-radius: 99px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .ob-change-db:hover { color: var(--ink); border-color: var(--muted); }
  @media (max-width: 768px) {
    .ob-change-db { top: 12px; left: 12px; padding: 6px 12px; font-size: 12px; }
  }
  .ob-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 40px;
  }
  .ob-name {
    font-weight: 800;
    font-size: 17px;
    letter-spacing: -0.02em;
    color: var(--ink);
  }
  .ob-dots {
    display: flex;
    gap: 8px;
    margin-bottom: 44px;
  }
  .dot {
    height: 6px;
    border-radius: 99px;
    transition: all 0.4s var(--ease);
  }
  .ob-err {
    max-width: 560px;
    width: 100%;
    margin-bottom: 20px;
    padding: 11px 15px;
    background: var(--c-med-tint);
    border: 1px solid var(--border-2);
    border-radius: var(--radius-sm);
    color: var(--med-ink);
    font-size: 13px;
    font-weight: 550;
    line-height: 1.5;
  }
  .ob-step {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .ob-footer {
    margin-top: auto;
    padding-top: 40px;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    color: var(--faint);
  }

  /* ---- AI loading card (shown while LLM analyses schema) ---- */
  .ai-loading-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    max-width: 440px;
    width: 100%;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl, 26px);
    box-shadow: var(--shadow-lg);
    padding: 44px 40px 36px;
    animation: cardPop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  @keyframes cardPop {
    from { opacity: 0; transform: scale(0.9) translateY(16px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }

  /* orbit icon */
  .ai-loading-icon {
    position: relative;
    width: 72px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .ai-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid transparent;
    border-top-color: var(--brand);
    animation: aiOrbit 1.4s linear infinite;
  }
  .ai-ring-inner {
    inset: 12px;
    border-top-color: var(--accent, var(--brand));
    opacity: 0.5;
    animation-direction: reverse;
    animation-duration: 2s;
  }
  @keyframes aiOrbit { to { transform: rotate(360deg); } }

  .ai-brain-icon {
    color: var(--brand);
    position: relative;
    z-index: 1;
    animation: aiPulse 2s ease-in-out infinite;
  }
  @keyframes aiPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.7; transform: scale(0.9); }
  }

  /* text */
  .ai-loading-text { text-align: center; display: flex; flex-direction: column; gap: 8px; }
  .ai-loading-headline {
    margin: 0;
    font-size: 18px;
    font-weight: 800;
    letter-spacing: -0.025em;
    color: var(--ink);
  }
  .ai-loading-sub {
    margin: 0;
    font-size: 13.5px;
    color: var(--muted);
    line-height: 1.55;
  }

  /* animated ellipsis */
  .ai-dots {
    display: inline-flex;
    gap: 1px;
    color: var(--brand);
  }
  .ai-dots span {
    animation: dotSeq 1.3s ease-in-out infinite;
    opacity: 0;
  }
  .ai-dots span:nth-child(1) { animation-delay: 0s; }
  .ai-dots span:nth-child(2) { animation-delay: 0.22s; }
  .ai-dots span:nth-child(3) { animation-delay: 0.44s; }
  @keyframes dotSeq {
    0%, 60%, 100% { opacity: 0; }
    30%            { opacity: 1; }
  }

  /* progress bar */
  .ai-progress-track {
    width: 100%;
    height: 3px;
    background: var(--surface-3, var(--border));
    border-radius: 99px;
    overflow: hidden;
  }
  .ai-progress-bar {
    height: 100%;
    width: 45%;
    background: linear-gradient(90deg, transparent, var(--brand), var(--accent, var(--brand)), transparent);
    border-radius: 99px;
    animation: aiSweep 1.8s ease-in-out infinite;
  }
  @keyframes aiSweep {
    0%   { transform: translateX(-200%); }
    100% { transform: translateX(320%); }
  }

  /* step list */
  .ai-steps {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
  }
  .ai-step {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    font-weight: 500;
    color: var(--faint);
    transition: color 0.3s;
  }
  .ai-step-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    background: var(--border-2);
    transition: background 0.3s, box-shadow 0.3s;
  }
  /* Done: solid green check */
  .ai-step-done {
    color: var(--ok-ink, var(--brand-ink));
  }
  .ai-step-done .ai-step-dot {
    background: var(--brand);
  }
  /* Active: pulsing brand dot */
  .ai-step-active {
    color: var(--ink-2);
    font-weight: 600;
  }
  .ai-step-active .ai-step-dot {
    background: var(--brand);
    animation: dotPulse 1s ease-in-out infinite;
    box-shadow: 0 0 0 3px rgba(var(--glow-rgb), 0.25);
  }
  @keyframes dotPulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.45; }
  }
  /* Pending: dim */
  .ai-step-pending {
    color: var(--faint);
    opacity: 0.6;
  }
</style>
