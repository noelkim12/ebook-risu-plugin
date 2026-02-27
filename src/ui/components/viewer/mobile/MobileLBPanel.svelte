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
    if (!label) return 'LB Module';
    const trimmed = label.replace(/\s+/g, ' ').trim();
    return trimmed.length > maxLength
      ? `${trimmed.slice(0, maxLength)}...`
      : trimmed;
  }
</script>

{#if isOpen}
  <div class="lb-panel active">
    <button
      type="button"
      class="panel-overlay"
      aria-label="LB 모듈 목록 닫기"
      onclick={handleOverlayClick}
      onkeydown={e =>
        (e.key === 'Enter' || e.key === ' ') && handleOverlayClick()}
    ></button>
    <div
      class="panel-content"
      role="presentation"
      onclick={handleContentClick}
      onkeydown={handleContentClick}
    >
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
                onkeydown={e =>
                  (e.key === 'Enter' || e.key === ' ') &&
                  handleModuleClick(module)}
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
