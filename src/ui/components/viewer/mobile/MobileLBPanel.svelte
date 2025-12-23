<script>
  /**
   * MobileLBPanel - 모바일용 LB 모듈 바텀시트 패널
   */
  let {
    isOpen = false,
    modules = [],
    onModuleClick = () => {},
    onClose = () => {},
  } = $props();

  function handleModuleClick(module) {
    onModuleClick(module);
    onClose();
  }

  function handleOverlayClick() {
    onClose();
  }

  function handleContentClick(e) {
    e.stopPropagation();
  }

  // 모듈 라벨 truncate
  function truncateLabel(label, maxLength = 30) {
    if (!label) return '';
    return label.length > maxLength ? label.slice(0, maxLength) + '...' : label;
  }
</script>

{#if isOpen}
  <div class="lb-panel active">
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div class="panel-overlay" onclick={handleOverlayClick}></div>
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div class="panel-content" onclick={handleContentClick}>
      <div class="panel-header">
        <h3>LB 모듈</h3>
        <button class="panel-close" onclick={onClose}>✕</button>
      </div>

      <div class="panel-body">
        {#if modules.length > 0}
          <div class="lb-modules-list">
            {#each modules as module}
              <button
                class="lb-module-item"
                onclick={() => handleModuleClick(module)}
              >
                {truncateLabel(module.label)}
              </button>
            {/each}
          </div>
        {:else}
          <div class="lb-empty">
            모듈이 없습니다
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .lb-panel {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 200;
    display: none;
  }

  .lb-panel.active {
    display: block;
  }

  .panel-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  .panel-content {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background: var(--mv-page-color, #fdfbf7);
    border-radius: 24px 24px 0 0;
    max-height: 60%;
    overflow-y: auto;
    animation: slideUp 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.2);
  }

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 24px 20px;
    border-bottom: 1px solid rgba(201, 166, 107, 0.2);
    position: sticky;
    top: 0;
    background: var(--mv-page-color, #fdfbf7);
    z-index: 10;
  }

  .panel-header h3 {
    font-size: 18px;
    font-weight: 700;
    color: var(--mv-text-color, #2c2c2c);
    letter-spacing: -0.02em;
    margin: 0;
  }

  .panel-close {
    background: none;
    border: none;
    font-size: 20px;
    color: var(--mv-text-secondary, #6b6b6b);
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 8px;
    transition: all var(--mv-transition-fast, 0.15s);
    line-height: 1;
  }

  .panel-close:active {
    background: var(--mv-accent-light, rgba(201, 166, 107, 0.15));
    color: var(--mv-accent-color, #c9a66b);
  }

  .panel-body {
    padding: 16px 24px 24px;
  }

  .lb-modules-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .lb-module-item {
    padding: 16px;
    background: rgba(201, 166, 107, 0.08);
    border-radius: 12px;
    cursor: pointer;
    transition: all var(--mv-transition-fast, 0.15s);
    font-size: 15px;
    font-weight: 500;
    color: var(--mv-text-color, #2c2c2c);
    border: 1px solid transparent;
    text-align: left;
    width: 100%;
  }

  .lb-module-item:active {
    background: rgba(201, 166, 107, 0.2);
    border-color: var(--mv-accent-color, #c9a66b);
    transform: scale(0.98);
  }

  .lb-empty {
    text-align: center;
    color: var(--mv-text-secondary, #6b6b6b);
    font-size: 14px;
    padding: 20px;
  }

  /* Safe Area */
  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    .panel-body {
      padding-bottom: max(24px, env(safe-area-inset-bottom));
    }
  }

  /* 태블릿 */
  @media (min-width: 768px) {
    .panel-content {
      max-width: 480px;
      left: 50%;
      transform: translateX(-50%);
    }

    @keyframes slideUp {
      from {
        transform: translateX(-50%) translateY(100%);
      }
      to {
        transform: translateX(-50%) translateY(0);
      }
    }
  }
</style>
