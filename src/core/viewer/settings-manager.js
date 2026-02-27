const SETTINGS_KEY = 'bookViewerSettings';
const CUSTOM_CSS_KEY = 'bookViewerCustomCss';

const DEFAULT_SETTINGS = {
  fontSize: 17,
  lineHeight: 1.9,
  theme: 'light',
  fontFamily: '나눔스퀘어네오',
  imageCensored: false,
  imageCensoredMinWidth: 100,
  imageCensoredMinHeight: 100,
  jumpToLastPageOnPrevIndex: false,
};

/**
 * 설정 로드
 * @returns {{ fontSize: number, lineHeight: number, theme: string }}
 */
export function loadSettings() {
  try {
    const saved = risuai.pluginStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        fontSize: parsed.fontSize ?? DEFAULT_SETTINGS.fontSize,
        lineHeight: parsed.lineHeight ?? DEFAULT_SETTINGS.lineHeight,
        theme: parsed.theme ?? DEFAULT_SETTINGS.theme,
        fontFamily: parsed.fontFamily ?? DEFAULT_SETTINGS.fontFamily,
        imageCensored: parsed.imageCensored ?? DEFAULT_SETTINGS.imageCensored,
        imageCensoredMinWidth:
          parsed.imageCensoredMinWidth ??
          DEFAULT_SETTINGS.imageCensoredMinWidth,
        imageCensoredMinHeight:
          parsed.imageCensoredMinHeight ??
          DEFAULT_SETTINGS.imageCensoredMinHeight,
        jumpToLastPageOnPrevIndex:
          parsed.jumpToLastPageOnPrevIndex ??
          DEFAULT_SETTINGS.jumpToLastPageOnPrevIndex,
      };
    }
  } catch (error) {
    console.error('[SettingsManager] Failed to load settings:', error);
  }
  return { ...DEFAULT_SETTINGS };
}

/**
 * 설정 저장
 * @param {{ fontSize?: number, lineHeight?: number, theme?: string }} settings
 */
export function saveSettings(settings) {
  try {
    const current = loadSettings();
    const updated = { ...current, ...settings };
    risuai.pluginStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('[SettingsManager] Failed to save settings:', error);
  }
}

/**
 * CSS 변수로 설정 적용
 * @param {{ fontSize: number, lineHeight: number, theme: string }} settings
 */
export function applySettings(settings) {
  document.documentElement.style.setProperty(
    '--font-size',
    `${settings.fontSize}px`,
  );
  document.documentElement.style.setProperty(
    '--line-height',
    String(settings.lineHeight),
  );
  document.body.setAttribute('data-theme', settings.theme);
}

/**
 * 사용자 CSS 로드
 * @returns {string}
 */
export function loadCustomCss() {
  try {
    return risuai.pluginStorage.getItem(CUSTOM_CSS_KEY) || '';
  } catch (error) {
    console.error('[SettingsManager] Failed to load custom CSS:', error);
    return '';
  }
}

/**
 * 사용자 CSS 저장
 * @param {string} css
 */
export function saveCustomCss(css) {
  try {
    if (css) {
      risuai.pluginStorage.setItem(CUSTOM_CSS_KEY, css);
    } else {
      risuai.pluginStorage.removeItem(CUSTOM_CSS_KEY);
    }
  } catch (error) {
    console.error('[SettingsManager] Failed to save custom CSS:', error);
  }
}

/**
 * 사용자 CSS를 문서에 적용
 * @param {string} css
 * @returns {HTMLStyleElement | null}
 */
export function applyCustomCss(css) {
  // 기존 스타일 제거
  const existing = document.getElementById('book-viewer-custom-css');
  if (existing) {
    existing.remove();
  }

  if (!css || css.trim() === '') {
    return null;
  }

  const styleElement = document.createElement('style');
  styleElement.id = 'book-viewer-custom-css';
  styleElement.textContent = css;
  document.head.appendChild(styleElement);

  return styleElement;
}

/**
 * 사용자 CSS 초기화
 */
export function resetCustomCss() {
  const existing = document.getElementById('book-viewer-custom-css');
  if (existing) {
    existing.remove();
  }
  risuai.pluginStorage.removeItem(CUSTOM_CSS_KEY);
}
