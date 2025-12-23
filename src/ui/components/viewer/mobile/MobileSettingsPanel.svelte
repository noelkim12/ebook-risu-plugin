<script>
  /**
   * MobileSettingsPanel - 모바일용 설정 바텀시트 패널
   * 폰트, 글자 크기, 줄 간격, 테마, 사용자 CSS
   */
  let {
    isOpen = false,
    settings = {
      fontSize: 17,
      lineHeight: 1.85,
      theme: 'dark',
      fontFamily: 'Pretendard',
    },
    onSettingsChange = () => {},
    onOpenCustomCss = () => {},
    onClose = () => {},
  } = $props();

  // 사용 가능한 폰트 목록 (PC와 동일)
  const fonts = [
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

  // 설정 변경 핸들러
  function handleFontSizeChange(e) {
    onSettingsChange({ ...settings, fontSize: Number(e.target.value) });
  }

  function handleLineHeightChange(e) {
    onSettingsChange({ ...settings, lineHeight: Number(e.target.value) });
  }

  function handleThemeChange(theme) {
    onSettingsChange({ ...settings, theme });
  }

  function handleFontChange(fontFamily) {
    onSettingsChange({ ...settings, fontFamily });
  }

  function handleOverlayClick() {
    onClose();
  }

  function handleContentClick(e) {
    e.stopPropagation();
  }
</script>

{#if isOpen}
  <div class="settings-panel active">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="panel-overlay" onclick={handleOverlayClick}></div>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="panel-content" onclick={handleContentClick}>
      <div class="panel-header">
        <h3>설정</h3>
        <button class="panel-close" onclick={onClose}>✕</button>
      </div>

      <div class="panel-body">
        <!-- 폰트 선택 -->
        <div class="setting-item">
          <label for="fontSelector">폰트</label>
          <div class="font-selector" id="fontSelector">
            {#each fonts as font}
              <button
                class="font-option"
                class:active={settings.fontFamily === font}
                style="font-family: '{font}'"
                onclick={() => handleFontChange(font)}
              >
                {font}
              </button>
            {/each}
          </div>
        </div>

        <!-- 글자 크기 -->
        <div class="setting-item">
          <label for="fontSize">글자 크기</label>
          <div class="range-control">
            <span class="range-label">작게</span>
            <input
              name="fontSize"
              type="range"
              min="14"
              max="20"
              step="1"
              value={settings.fontSize}
              oninput={handleFontSizeChange}
            />
            <span class="range-label">크게</span>
          </div>
          <span class="setting-value">{settings.fontSize}px</span>
        </div>

        <!-- 줄 간격 -->
        <div class="setting-item">
          <label for="lineHeight">줄 간격</label>
          <div class="range-control">
            <span class="range-label">좁게</span>
            <input
              type="range"
              name="lineHeight"
              min="1.4"
              max="2.2"
              step="0.1"
              value={settings.lineHeight}
              oninput={handleLineHeightChange}
            />
            <span class="range-label">넓게</span>
          </div>
          <span class="setting-value">{settings.lineHeight.toFixed(1)}</span>
        </div>

        <!-- 테마 -->
        <div class="setting-item">
          <label for="themeButtons">테마</label>
          <div class="theme-buttons" id="themeButtons">
            <button
              class="theme-btn"
              class:active={settings.theme === 'light'}
              onclick={() => handleThemeChange('light')}
            >
              <span class="theme-preview light"></span>
              밝게
            </button>
            <button
              class="theme-btn"
              class:active={settings.theme === 'sepia'}
              onclick={() => handleThemeChange('sepia')}
            >
              <span class="theme-preview sepia"></span>
              세피아
            </button>
            <button
              class="theme-btn"
              class:active={settings.theme === 'dark'}
              onclick={() => handleThemeChange('dark')}
            >
              <span class="theme-preview dark"></span>
              어둡게
            </button>
          </div>
        </div>

        <!-- 사용자 CSS -->
        <div class="setting-item">
          <button class="custom-css-btn" onclick={onOpenCustomCss}>
            사용자 CSS 편집
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
