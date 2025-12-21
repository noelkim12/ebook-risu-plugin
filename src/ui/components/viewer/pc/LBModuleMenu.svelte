<script>
  /**
   * LBModuleMenu - LB 모듈 드롭다운 메뉴
   */

  let {
    isOpen = false,
    modules = [],
    onModuleClick,
    onClose
  } = $props();

  function handleModuleClick(module) {
    onModuleClick?.(module);
  }

  function truncateLabel(label, maxLength = 30) {
    const cleaned = label.replace(/\s+/g, ' ').trim();
    if (cleaned.length <= maxLength) return cleaned;
    return cleaned.substring(0, maxLength) + '...';
  }
</script>

<div class="dropdown-container">
  <div class="dropdown-menu" class:active={isOpen}>
    <div class="dropdown-header">LB 모듈</div>

    <div class="lb-modules-list">
      {#if modules.length === 0}
        <div class="lb-module-item" style="cursor: default; opacity: 0.6;">
          모듈이 없습니다
        </div>
      {:else}
        {#each modules as module, index}
          <div
            class="lb-module-item"
            role="button"
            tabindex="0"
            onclick={() => handleModuleClick(module)}
            onkeydown={(e) => e.key === 'Enter' && handleModuleClick(module)}
          >
            <span class="lb-module-label">{truncateLabel(module.label)}</span>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>
