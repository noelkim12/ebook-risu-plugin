<script>
  /**
   * SettingsMenu - 뷰어 설정 드롭다운 메뉴
   */

  let {
    isOpen = false,
    settings = { fontSize: 17, lineHeight: 1.9, theme: 'light' },
    onSettingsChange,
    onOpenCustomCss,
    onClose
  } = $props();

  function handleFontSizeChange(e) {
    const newSettings = { ...settings, fontSize: Number(e.target.value) };
    onSettingsChange?.(newSettings);
  }

  function handleLineHeightChange(e) {
    const newSettings = { ...settings, lineHeight: Number(e.target.value) };
    onSettingsChange?.(newSettings);
  }

  function handleThemeChange(e) {
    const newSettings = { ...settings, theme: e.target.value };
    onSettingsChange?.(newSettings);
  }

  function handleClickOutside(e) {
    // 외부 클릭 처리는 부모 컴포넌트에서 담당
  }
</script>

<div class="dropdown-container">
  <div class="dropdown-menu" class:active={isOpen}>
    <div class="dropdown-header">설정</div>

    <div class="setting-item">
      <label for="fontSize">폰트 크기</label>
      <input
        type="range"
        id="fontSize"
        min="12"
        max="24"
        step="1"
        value={settings.fontSize}
        oninput={handleFontSizeChange}
      />
      <span>{settings.fontSize}px</span>
    </div>

    <div class="setting-item">
      <label for="lineHeight">줄 간격</label>
      <input
        type="range"
        id="lineHeight"
        min="1.4"
        max="2.2"
        step="0.1"
        value={settings.lineHeight}
        oninput={handleLineHeightChange}
      />
      <span>{settings.lineHeight.toFixed(1)}</span>
    </div>

    <div class="setting-item">
      <label for="theme">테마</label>
      <select id="theme" value={settings.theme} onchange={handleThemeChange}>
        <option value="light">밝은 테마</option>
        <option value="sepia">세피아</option>
        <option value="dark">어두운 테마</option>
      </select>
    </div>

    <div class="setting-item">
      <button class="custom-css-btn" onclick={onOpenCustomCss}>
        사용자 CSS 편집
      </button>
    </div>
  </div>
</div>
