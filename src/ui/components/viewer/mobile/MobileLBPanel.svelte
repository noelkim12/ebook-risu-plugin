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
          <div class="lb-empty">모듈이 없습니다</div>
        {/if}
      </div>
    </div>
  </div>
{/if}
