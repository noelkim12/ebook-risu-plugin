<script>
  /**
   * SettingsMenu - 뷰어 설정 드롭다운 메뉴
   */

  let {
    isOpen = false,
    settings = {
      fontSize: 17,
      lineHeight: 1.5,
      theme: 'dark',
      fontFamily: '나눔스퀘어네오',
      imageCensored: false,
    },
    onSettingsChange,
    onOpenCustomCss,
    onClose,
  } = $props();

  // 사용 가능한 폰트 목록
  const AVAILABLE_FONTS = [
    'Pretendard',
    '나눔스퀘어네오',
    '에스코어드림',
    '레페리포인트',
    '플렉스',
    '스위트',
    '오르빗',
    '스쿨오르빗',
    '프리티나잇',
    '서라운드에어',
    '고운돋움',
    '고운바탕',
    '리디바탕',
    '마루부리',
    '도스고딕',
    '스타더스트',
    '픽시드시스',
    '네오둥근모',
  ];

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

  function handleFontChange(e) {
    const newSettings = { ...settings, fontFamily: e.target.value };
    onSettingsChange?.(newSettings);
  }

  function handleImageCensoredChange(e) {
    const newSettings = { ...settings, imageCensored: e.target.checked };
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
      <label for="fontFamily">폰트</label>
      <select
        id="fontFamily"
        value={settings.fontFamily}
        onchange={handleFontChange}
      >
        {#each AVAILABLE_FONTS as font}
          <option value={font} style:font-family={font}>{font}</option>
        {/each}
      </select>
    </div>

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
        min="1.5"
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
        <option value="light">라이트 테마</option>
        <option value="sepia">세피아</option>
        <option value="dark">다크 테마</option>
      </select>
    </div>

    <div class="setting-item toggle-item">
      <div class="toggle-content">
        <span class="toggle-label">이미지 검열</span>
        <span class="toggle-description">이미지 위에 오버레이 표시</span>
      </div>
      <label class="toggle-switch">
        <input
          type="checkbox"
          checked={settings.imageCensored}
          onchange={handleImageCensoredChange}
        />
        <span class="toggle-slider"></span>
      </label>
    </div>

    <div class="setting-item">
      <button class="custom-css-btn" onclick={onOpenCustomCss}>
        사용자 CSS 편집
      </button>
    </div>
  </div>
</div>
