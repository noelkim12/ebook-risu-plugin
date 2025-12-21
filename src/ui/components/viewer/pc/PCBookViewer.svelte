<script>
  /**
   * PCBookViewer - PC용 이북 스타일 뷰어 메인 컴포넌트
   */
  import { onMount, onDestroy } from 'svelte';

  // 컴포넌트
  import BookHeader from './BookHeader.svelte';
  import BookPages from './BookPages.svelte';
  import NavControls from './NavControls.svelte';
  import CustomCssModal from './CustomCssModal.svelte';

  // 코어 로직
  import { TextSplitterPC } from '../../../../core/viewer/pc/text-splitter.js';
  import {
    createMeasureContainer,
    wrapNakedTextNodes,
    splitIntoPagesHTML,
    extractHeaderInfo,
    collectLBModules,
    waitForLayout,
  } from '../../../../core/viewer/pc/page-manager.js';
  import {
    loadSettings,
    saveSettings,
    applySettings,
    loadCustomCss,
    saveCustomCss,
    applyCustomCss,
    resetCustomCss,
  } from '../../../../core/viewer/pc/settings-manager.js';

  // 스타일
  import '../../../styles/pc-viewer.css';

  // selector 유틸
  import { getChatElementByChatIndex } from '../../../../utils/selector.js';

  // Props
  let { chatHtml = '', chatIndex = 0, onClose } = $props();

  // State
  let pages = $state([]);
  let currentPage = $state(0);
  let settings = $state({ fontSize: 17, lineHeight: 1.9, theme: 'dark' });
  let headerInfo = $state({
    thumbnailUrl: '',
    name: '',
    chatIndex: 0,
    buttons: [],
  });
  let lbModules = $state([]);
  let isCssModalOpen = $state(false);
  let customCss = $state('');
  let originalContent = $state(null);
  let lastKnownHtml = $state('');

  // 텍스트 분할기
  let textSplitter = new TextSplitterPC({ splittableTags: ['p'] });

  // 측정용 요소 참조
  let leftContentRef = $state(null);
  let rootElement = $state(null);

  // 리사이즈 타이머
  let resizeTimer = null;
  let contentCheckInterval = null;

  // Derived
  let totalSpreads = $derived(Math.ceil(pages.length / 2));
  let leftIndex = $derived(currentPage * 2);
  let rightIndex = $derived(currentPage * 2 + 1);
  let leftContent = $derived(pages[leftIndex] || '');
  let rightContent = $derived(pages[rightIndex] || '');
  let leftPageNum = $derived(pages[leftIndex] ? leftIndex + 1 : 0);
  let rightPageNum = $derived(pages[rightIndex] ? rightIndex + 1 : 0);
  let prevDisabled = $derived(currentPage === 0);
  let nextDisabled = $derived(rightIndex >= pages.length - 1);

  // 설정 변경 시 CSS 변수 적용
  $effect(() => {
    if (rootElement) {
      rootElement.style.setProperty('--bv-font-size', `${settings.fontSize}px`);
      rootElement.style.setProperty(
        '--bv-line-height',
        String(settings.lineHeight),
      );
      rootElement.setAttribute('data-theme', settings.theme);
    }
  });

  onMount(async () => {
    // 설정 로드
    settings = loadSettings();

    // 사용자 CSS 로드
    customCss = loadCustomCss();
    if (customCss) {
      applyCustomCss(customCss);
    }

    // 콘텐츠 파싱 및 페이지 분할
    await waitForLayout();
    await parseAndSplit();

    // 콘텐츠 변경 감지 (2초 간격)
    contentCheckInterval = setInterval(checkContentChange, 2000);
  });

  onDestroy(() => {
    if (resizeTimer) clearTimeout(resizeTimer);
    if (contentCheckInterval) clearInterval(contentCheckInterval);

    // 사용자 CSS 스타일 요소 제거
    const styleEl = document.getElementById('book-viewer-custom-css');
    if (styleEl) styleEl.remove();
  });

  async function parseAndSplit() {
    if (!chatHtml) return;

    lastKnownHtml = chatHtml;

    // HTML 파싱
    const parser = new DOMParser();
    const doc = parser.parseFromString(chatHtml, 'text/html');

    // 헤더 정보 추출
    headerInfo = extractHeaderInfo(doc);
    headerInfo.chatIndex = chatIndex;

    // LB 모듈 수집
    lbModules = collectLBModules(doc);

    // 텍스트 콘텐츠 추출
    const textContent = doc.querySelector('.chattext');

    if (textContent) {
      wrapNakedTextNodes(textContent);
      originalContent = textContent.cloneNode(true);

      // 레이아웃 대기 후 페이지 분할
      await waitForLayout();
      await splitPages();
    }
  }

  async function splitPages() {
    if (!originalContent) return;

    // 측정용 컨테이너 생성
    const measureRef = document.querySelector(
      '.book-viewer-root .text-content',
    );
    if (!measureRef) {
      // 아직 DOM이 준비되지 않은 경우 재시도
      await waitForLayout();
      const retryRef = document.querySelector(
        '.book-viewer-root .text-content',
      );
      if (!retryRef) return;
    }

    const measureContainer = createMeasureContainer(
      measureRef || document.body,
    );
    document.body.appendChild(measureContainer);

    try {
      pages = splitIntoPagesHTML(
        originalContent.cloneNode(true),
        measureContainer,
        textSplitter,
      );
    } finally {
      document.body.removeChild(measureContainer);
    }
  }

  async function repaginate() {
    if (!originalContent) return;

    const currentFirstPage = currentPage * 2;
    pages = [];
    currentPage = 0;

    await waitForLayout();
    await splitPages();

    // 이전 위치 복원
    const maxPage = Math.max(0, Math.ceil(pages.length / 2) - 1);
    currentPage = Math.min(Math.floor(currentFirstPage / 2), maxPage);
  }

  function debouncedRepaginate() {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      repaginate();
    }, 300);
  }

  function checkContentChange() {
    const currentElement = getChatElementByChatIndex(chatIndex);
    if (currentElement) {
      const newHtml = currentElement.outerHTML;
      if (newHtml !== lastKnownHtml) {
        lastKnownHtml = newHtml;
        chatHtml = newHtml;
        parseAndSplit();
      }
    }
  }

  // 네비게이션
  function nextPage() {
    if (rightIndex >= pages.length - 1) return;
    currentPage++;
  }

  function prevPage() {
    if (currentPage === 0) return;
    currentPage--;
  }

  // 키보드 네비게이션
  function handleKeydown(e) {
    if (isCssModalOpen) {
      if (e.key === 'Escape') {
        isCssModalOpen = false;
      }
      return;
    }

    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
      e.preventDefault();
      nextPage();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      prevPage();
    } else if (e.key === 'Escape') {
      onClose?.();
    }
  }

  // 설정 변경
  function handleSettingsChange(newSettings) {
    settings = newSettings;
    saveSettings(settings);
    debouncedRepaginate();
  }

  // 사용자 CSS 모달
  function openCustomCssModal() {
    isCssModalOpen = true;
  }

  function handleApplyCustomCss(css) {
    customCss = css;
    saveCustomCss(css);
    applyCustomCss(css);
    isCssModalOpen = false;
    debouncedRepaginate();
  }

  function handleResetCustomCss() {
    customCss = '';
    resetCustomCss();
    debouncedRepaginate();
  }

  // LB 모듈 클릭
  function handleLBModuleClick(module) {
    const identifier = module.dataId || module.risuBtn;

    for (let i = 0; i < pages.length; i++) {
      const pageContent = pages[i];
      if (
        pageContent.includes(`data-id="${identifier}"`) ||
        pageContent.includes(`risu-btn="${identifier}"`)
      ) {
        currentPage = Math.floor(i / 2);
        break;
      }
    }
  }

  // 리사이즈 감지
  function handleResize() {
    debouncedRepaginate();
  }
</script>

<svelte:window onkeydown={handleKeydown} onresize={handleResize} />

<div
  class="book-viewer-root"
  bind:this={rootElement}
  data-theme={settings.theme}
>
  <BookHeader
    thumbnailUrl={headerInfo.thumbnailUrl}
    name={headerInfo.name}
    chatIndex={headerInfo.chatIndex}
    buttons={headerInfo.buttons}
    {onClose}
  />

  <BookPages
    {leftContent}
    {rightContent}
    {leftPageNum}
    {rightPageNum}
    onPrevPage={prevPage}
    onNextPage={nextPage}
    bind:leftContentRef
  />

  <NavControls
    currentSpread={currentPage}
    {totalSpreads}
    onPrev={prevPage}
    onNext={nextPage}
    {prevDisabled}
    {nextDisabled}
    {settings}
    onSettingsChange={handleSettingsChange}
    onOpenCustomCss={openCustomCssModal}
    {lbModules}
    onLBModuleClick={handleLBModuleClick}
  />

  <CustomCssModal
    isOpen={isCssModalOpen}
    initialCss={customCss}
    onApply={handleApplyCustomCss}
    onReset={handleResetCustomCss}
    onClose={() => (isCssModalOpen = false)}
  />
</div>
