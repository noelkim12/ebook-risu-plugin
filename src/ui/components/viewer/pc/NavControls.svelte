<script>
  /**
   * NavControls - 하단 네비게이션 컨트롤
   */
  import { ChevronLeft, ChevronRight, Settings, Layers } from 'lucide-svelte';
  import SettingsMenu from './SettingsMenu.svelte';
  import LBModuleMenu from './LBModuleMenu.svelte';

  let {
    currentSpread = 0,
    totalSpreads = 1,
    isFirst = true,
    isLast = true,
    onPrev,
    onNext,
    prevDisabled = false,
    nextDisabled = false,
    settings = { fontSize: 17, lineHeight: 1.9, theme: 'light' },
    onSettingsChange,
    onOpenCustomCss,
    lbModules = [],
    onLBModuleClick,
  } = $props();

  let isSettingsOpen = $state(false);
  let isLBMenuOpen = $state(false);

  function toggleSettings() {
    isSettingsOpen = !isSettingsOpen;
    if (isSettingsOpen) isLBMenuOpen = false;
  }

  function toggleLBMenu() {
    isLBMenuOpen = !isLBMenuOpen;
    if (isLBMenuOpen) isSettingsOpen = false;
  }

  function closeAllMenus() {
    isSettingsOpen = false;
    isLBMenuOpen = false;
  }

  function handleSettingsChange(newSettings) {
    onSettingsChange?.(newSettings);
  }

  function handleOpenCustomCss() {
    closeAllMenus();
    onOpenCustomCss?.();
  }

  function handleLBModuleClick(module) {
    closeAllMenus();
    onLBModuleClick?.(module);
  }

  // 외부 클릭 감지
  function handleClickOutside(e) {
    const settingsContainer = e.target.closest('.settings-menu-container');
    const lbContainer = e.target.closest('.lb-menu-container');

    if (!settingsContainer && isSettingsOpen) {
      isSettingsOpen = false;
    }
    if (!lbContainer && isLBMenuOpen) {
      isLBMenuOpen = false;
    }
  }
</script>

<svelte:window onclick={handleClickOutside} />

<nav class="nav-controls">
  <button
    class="nav-btn prev-btn"
    onclick={onPrev}
    disabled={isFirst && prevDisabled}
    title="이전 페이지"
  >
    <ChevronLeft size={28} />
  </button>

  <span class="page-indicator">{currentSpread + 1} / {totalSpreads}</span>

  <button
    class="nav-btn next-btn"
    onclick={onNext}
    disabled={isLast && nextDisabled}
    title="다음 페이지"
  >
    <ChevronRight size={28} />
  </button>

  <div class="nav-right-buttons">
    {#if lbModules.length > 0}
      <div class="lb-menu-container">
        <button
          class="nav-icon-btn lb-btn"
          onclick={e => {
            e.stopPropagation();
            toggleLBMenu();
          }}
          title="LB 모듈"
        >
          <Layers size={18} />
          <span>LB</span>
        </button>
        <LBModuleMenu
          isOpen={isLBMenuOpen}
          modules={lbModules}
          onModuleClick={handleLBModuleClick}
          onClose={() => (isLBMenuOpen = false)}
        />
      </div>
    {/if}

    <div class="settings-menu-container">
      <button
        class="nav-icon-btn settings-btn"
        onclick={e => {
          e.stopPropagation();
          toggleSettings();
        }}
        title="설정"
      >
        <Settings size={18} />
      </button>
      <SettingsMenu
        isOpen={isSettingsOpen}
        {settings}
        onSettingsChange={handleSettingsChange}
        onOpenCustomCss={handleOpenCustomCss}
        onClose={() => (isSettingsOpen = false)}
      />
    </div>
  </div>
</nav>
