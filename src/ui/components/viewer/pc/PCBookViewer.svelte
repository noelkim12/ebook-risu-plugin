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
  import ViewerToast from './ViewerToast.svelte';

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
  import { openPCViewer } from './viewerHelpers.js';

  // 스타일
  import '../../../styles/pc-viewer.css';

  // selector 유틸
  import {
    getChatElementByChatIndex,
    getAdjacentChatIndex,
    getChatIndexPosition,
    getAllVisibleChatIndices,
  } from '../../../../utils/selector.js';

  // RisuAPI
  import { RisuAPI } from '../../../../core/risu-api.js';

  // Props
  let {
    chatHtml = '',
    chatIndex = 0,
    chatPage = 0,
    chaId = null,
    onClose,
    initialLoading = false,
  } = $props();

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

  // Chat Index 관련 상태
  let chatIndexPosition = $state({ position: 0, total: 0, isFirst: true, isLast: true });
  let visibleChatIndices = $state([]);

  // Toast 및 Loading 상태
  let isLoading = $state(initialLoading);
  let loadingMessage = $state(initialLoading ? '불러오는 중...' : '');
  let toastVisible = $state(false);
  let toastMessage = $state('');

  // 텍스트 분할기
  let textSplitter = new TextSplitterPC({ splittableTags: ['p'] });

  // 측정용 요소 참조
  let leftContentRef = $state(null);
  let rootElement = $state(null);

  // 리사이즈 타이머
  let resizeTimer = null;
  let contentCheckInterval = null;

  // 구독 해제 함수들
  let unsubscribeCharPage = null;
  let unsubscribeChatIndices = null;

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

    // Chat index 정보 초기화
    updateChatIndexInfo();

    // 콘텐츠 파싱 및 페이지 분할
    await waitForLayout();
    await parseAndSplit();

    // 콘텐츠 변경 감지 (2초 간격)
    contentCheckInterval = setInterval(checkContentChange, 2000);

    // RisuAPI 구독 설정
    const risuAPI = RisuAPI.getInstance();

    // chatPage 또는 chaId 변경 감지
    unsubscribeCharPage = risuAPI.subscribeToChar(
      (char) => ({ chatPage: char?.chatPage, chaId: char?.chaId }),
      (newValue) => {
        if (newValue.chatPage !== chatPage || newValue.chaId !== chaId) {
          console.log('[PCBookViewer] Chat page or character changed, reloading...');
          openPCViewer(null, false);
        }
      },
      500
    );

    // 새 채팅 인덱스 감지
    unsubscribeChatIndices = risuAPI.subscribeToChar(
      (char) => char?.chats?.[char.chatPage]?.message?.length,
      (newLength) => {
        const newIndices = getAllVisibleChatIndices();
        if (newIndices.length !== visibleChatIndices.length) {
          const addedIndices = newIndices.filter(idx => !visibleChatIndices.includes(idx));
          if (addedIndices.length > 0) {
            console.log('[PCBookViewer] New chat indices detected:', addedIndices);
            // TODO: toast 알림 추가 가능
          }
          visibleChatIndices = newIndices;
          updateChatIndexInfo();
        }
      },
      1000
    );
  });

  onDestroy(() => {
    if (resizeTimer) clearTimeout(resizeTimer);
    if (contentCheckInterval) clearInterval(contentCheckInterval);

    // 구독 해제
    if (unsubscribeCharPage) unsubscribeCharPage();
    if (unsubscribeChatIndices) unsubscribeChatIndices();

    // 사용자 CSS 스타일 요소 제거
    const styleEl = document.getElementById('book-viewer-custom-css');
    if (styleEl) styleEl.remove();
  });

  /**
   * Chat index 정보 업데이트
   */
  function updateChatIndexInfo() {
    visibleChatIndices = getAllVisibleChatIndices();
    chatIndexPosition = getChatIndexPosition(chatIndex);
  }

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

      // 로딩 완료 후 오버레이 숨김 (부드러운 fade-out을 위해 약간 지연)
      if (isLoading) {
        setTimeout(() => {
          isLoading = false;
          loadingMessage = '';
        }, 100);
      }
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

  /**
   * Toast 표시
   */
  function showToast(message) {
    toastMessage = message;
    toastVisible = true;
  }

  function hideToast() {
    toastVisible = false;
    toastMessage = '';
  }

  // 네비게이션
  function nextPage() {
    if (rightIndex >= pages.length - 1) {
      // 마지막 페이지에서 다음 chat index로 이동
      goToNextChatIndex();
      return;
    }
    currentPage++;
  }

  function prevPage() {
    if (currentPage === 0) {
      // 첫 페이지에서 이전 chat index로 이동
      goToPrevChatIndex();
      return;
    }
    currentPage--;
  }

  /**
   * 이전 chat index로 이동
   */
  function goToPrevChatIndex() {
    const { index, isFirst } = getAdjacentChatIndex(chatIndex, 'prev');
    if (index !== null) {
      // 새 뷰어를 로딩 상태로 열기
      openPCViewer(index, false, true);
    } else if (isFirst) {
      showToast('현재 채팅의 첫 번째 페이지입니다');
    }
  }

  /**
   * 다음 chat index로 이동
   */
  function goToNextChatIndex() {
    const { index, isLast } = getAdjacentChatIndex(chatIndex, 'next');
    if (index !== null) {
      // 새 뷰어를 로딩 상태로 열기
      openPCViewer(index, false, true);
    } else if (isLast) {
      showToast('현재 채팅의 마지막 페이지입니다');
    }
  }

  // 키보드 네비게이션
  function handleKeydown(e) {
    if (isCssModalOpen) {
      if (e.key === 'Escape') {
        isCssModalOpen = false;
      }
      return;
    }

    // 텍스트 입력 중이거나 텍스트 선택 중일 때는 네비게이션 비활성화 (Escape 제외)
    if (e.key !== 'Escape') {
      // 1. textarea나 input에 포커스가 있는 경우
      const activeEl = document.activeElement;
      const isInputFocused = activeEl && (
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.tagName === 'INPUT' ||
        activeEl.isContentEditable
      );
      if (isInputFocused) return;

      // 2. 텍스트를 드래그 선택 중인 경우
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) return;
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
  class="book-viewer-root risu-chat chat-message-container"
  data-chat-index={chatIndex}
  data-chat-page={chatPage}
  data-char-id={chaId}
  bind:this={rootElement}
  data-theme={settings.theme}
>
  <BookHeader
    thumbnailUrl={headerInfo.thumbnailUrl}
    name={headerInfo.name}
    chatIndex={headerInfo.chatIndex}
    buttons={headerInfo.buttons}
    {chatIndexPosition}
    onPrevChat={goToPrevChatIndex}
    onNextChat={goToNextChatIndex}
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
    {isLoading}
    {loadingMessage}
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

  <ViewerToast
    message={toastMessage}
    visible={toastVisible}
    duration={2000}
    onHide={hideToast}
  />
</div>
