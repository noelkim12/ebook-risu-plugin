<script>
  /**
   * MobileBookViewer - 모바일용 이북 스타일 뷰어 메인 컴포넌트
   */
  import { onMount, onDestroy } from 'svelte';

  // 컴포넌트
  import MobileBookHeader from './MobileBookHeader.svelte';
  import MobileBookPage from './MobileBookPage.svelte';
  import MobileNavFooter from './MobileNavFooter.svelte';
  import MobileSettingsPanel from './MobileSettingsPanel.svelte';
  import MobileLBPanel from './MobileLBPanel.svelte';
  import MobileCustomCssModal from './MobileCustomCssModal.svelte';
  import ViewerToast from '../ViewerToast.svelte';

  // 코어 로직 (PC와 공유)
  import { TextSplitterMobile } from '../../../../core/viewer/mobile/text-splitter-mobile.js';
  import { createSwipeHandler } from '../../../../core/viewer/mobile/touch-handler.js';
  import {
    createMeasureContainer,
    wrapNakedTextNodes,
    splitIntoPagesHTML,
    extractHeaderInfo,
    extractLiveButtons,
    extractLiveContentButtons,
    extractLiveLBModuleButtons,
    collectLBModules,
    waitForLayout,
  } from '../../../../core/viewer/page-manager.js';
  import {
    loadSettings,
    saveSettings,
    applySettings,
    loadCustomCss,
    saveCustomCss,
    applyCustomCss,
    resetCustomCss,
  } from '../../../../core/viewer/settings-manager.js';
  import { openMobileViewer, closeMobileViewer } from './viewerHelpers.js';

  // 스타일
  import '../../../styles/mobile-viewer.css';

  // selector 유틸
  import {
    getChatElementByChatIndex,
    getAdjacentChatIndex,
    getChatIndexPosition,
    getAllVisibleChatIndices,
    LOCATOR,
    risuSelector,
  } from '../../../../utils/selector.js';

  // RisuAPI
  import { RisuAPI } from '../../../../core/risu-api.js';
  import { debounce, isNil } from 'lodash';

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
  let settings = $state({
    fontSize: 17,
    lineHeight: 1.85,
    theme: 'dark',
    fontFamily: 'Pretendard',
  });
  let headerInfo = $state({
    thumbnailUrl: '',
    name: '',
    chatIndex: 0,
    buttons: [],
  });
  let lbModules = $state([]);
  let liveLBModuleButtons = $state(new Map());
  let liveContentButtons = $state([]);
  let customCss = $state('');
  let originalContent = $state(null);
  let lastKnownHtml = $state('');

  // Chat Index 관련 상태
  let chatIndexPosition = $state({
    position: 0,
    total: 0,
    isFirst: true,
    isLast: true,
  });
  let visibleChatIndices = $state([]);

  // 패널 및 모달 상태
  let isSettingsOpen = $state(false);
  let isLBPanelOpen = $state(false);
  let isCssModalOpen = $state(false);

  // 전체화면 상태
  let isFullscreen = $state(false);

  // Toast 및 Loading 상태
  let isLoading = $state(false);
  let loadingMessage = $state('');
  let toastVisible = $state(false);
  let toastMessage = $state('');

  // initialLoading prop 변경 시 상태 업데이트
  $effect(() => {
    isLoading = initialLoading;
    loadingMessage = initialLoading ? 'Loading...' : '';
  });

  // 텍스트 분할기 (모바일용)
  let textSplitter = new TextSplitterMobile({ splittableTags: ['p', 'div'] });

  // 요소 참조
  let rootElement = $state(null);

  // 뷰어 높이 (textarea 높이에 따라 동적 계산)
  let viewerHeight = $state('100%');
  let textareaResizeObserver = null;
  let settingPanelObserver = null;

  // 타이머
  let resizeTimer = null;
  let contentCheckInterval = null;

  // 구독 해제 함수들
  let unsubscribeCharPage = null;
  let unsubscribeChatIndices = null;

  // 스와이프 핸들러
  let swipeHandler = null;

  // Derived
  let totalPages = $derived(pages.length);
  let currentContent = $derived(pages[currentPage] || '');
  let pageNum = $derived(currentPage + 1);
  let prevDisabled = $derived(currentPage === 0 && chatIndexPosition.isFirst);
  let nextDisabled = $derived(
    currentPage >= totalPages - 1 && chatIndexPosition.isLast,
  );

  // 설정 변경 시 CSS 변수 적용
  $effect(() => {
    if (rootElement) {
      rootElement.style.setProperty('--mv-font-size', `${settings.fontSize}px`);
      rootElement.style.setProperty(
        '--mv-line-height',
        String(settings.lineHeight),
      );
      rootElement.style.setProperty('--mv-font-family', settings.fontFamily);
      rootElement.style.setProperty('--risu-font-family', settings.fontFamily);
      rootElement.setAttribute('data-theme', settings.theme);
    }
  });

  onMount(async () => {
    // 전체화면
    // await document.documentElement?.requestFullscreen?.();
    // isFullscreen = true;

    // inputTextarea 높이 감지 및 뷰어 높이 계산
    const inputTextarea = risuSelector(LOCATOR.chatScreen.textarea);
    if (inputTextarea) {
      // 초기 높이 설정
      const textareaHeight = inputTextarea.scrollHeight + 10;
      viewerHeight = `calc(100% - ${textareaHeight}px)`;

      // ResizeObserver로 높이 변화 감지
      textareaResizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          const newTextareaHeight = entry.target.scrollHeight + 10;
          viewerHeight = `calc(100% - ${newTextareaHeight}px)`;
        }
      });
      textareaResizeObserver.observe(inputTextarea);

      if (!isNil(settingPanelObserver)) {
        settingPanelObserver.disconnect();
        settingPanelObserver = null;
      }

      settingPanelObserver = new MutationObserver(() => {
        debouncedHandleSettingPanel();
      });

      settingPanelObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class'],
      });
    }

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

    // 콘텐츠 변경 감지 (1초 간격)
    contentCheckInterval = setInterval(checkContentChange, 1000);

    // 스와이프 핸들러 설정
    swipeHandler = createSwipeHandler({
      onSwipeLeft: nextPage,
      onSwipeRight: prevPage,
      threshold: 50,
    });

    // 스와이프 이벤트 리스너 등록
    if (rootElement) {
      rootElement.addEventListener('touchstart', swipeHandler.touchStart, {
        passive: true,
      });
      rootElement.addEventListener('touchmove', swipeHandler.touchMove, {
        passive: true,
      });
      rootElement.addEventListener('touchend', swipeHandler.touchEnd, {
        passive: true,
      });
    }

    // RisuAPI 구독 설정
    const risuAPI = RisuAPI.getInstance();

    // chatPage 또는 chaId 변경 감지
    unsubscribeCharPage = risuAPI.subscribeToChar(
      char => ({ chatPage: char?.chatPage, chaId: char?.chaId }),
      newValue => {
        if (newValue.chatPage !== chatPage || newValue.chaId !== chaId) {
          console.log(
            '[MobileBookViewer] Chat page or character changed, reloading...',
          );
          openMobileViewer(null, false);
        }
      },
      500,
    );

    // 새 채팅 인덱스 감지
    unsubscribeChatIndices = risuAPI.subscribeToChar(
      char => char?.chats?.[char.chatPage]?.message?.length,
      newLength => {
        const newIndices = getAllVisibleChatIndices();
        if (newIndices.length !== visibleChatIndices.length) {
          visibleChatIndices = newIndices;
          updateChatIndexInfo();
        }
      },
      1000,
    );
  });

  onDestroy(() => {
    if (resizeTimer) clearTimeout(resizeTimer);
    if (contentCheckInterval) clearInterval(contentCheckInterval);

    // textarea ResizeObserver 해제
    if (textareaResizeObserver) {
      textareaResizeObserver.disconnect();
      textareaResizeObserver = null;
    }
    // setting panel mutation observer 해제
    if (settingPanelObserver) {
      settingPanelObserver.disconnect();
      settingPanelObserver = null;
    }

    // 스와이프 이벤트 리스너 제거
    if (rootElement && swipeHandler) {
      rootElement.removeEventListener('touchstart', swipeHandler.touchStart);
      rootElement.removeEventListener('touchmove', swipeHandler.touchMove);
      rootElement.removeEventListener('touchend', swipeHandler.touchEnd);
    }

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

    // 라이브 DOM에서 버튼 참조 추출
    const liveElement = getChatElementByChatIndex(chatIndex);
    if (liveElement) {
      headerInfo.buttons = extractLiveButtons(liveElement);
      liveContentButtons = extractLiveContentButtons(liveElement);
      liveLBModuleButtons = extractLiveLBModuleButtons(liveElement);
    }

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

      // 로딩 완료 후 오버레이 숨김
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
    const measureRef = document.querySelector('.mobile-reader .text-content');
    if (!measureRef) {
      await waitForLayout();
      const retryRef = document.querySelector('.mobile-reader .text-content');
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

    const currentFirstPage = currentPage;
    pages = [];
    currentPage = 0;

    await waitForLayout();
    await splitPages();

    // 이전 위치 복원
    const maxPage = Math.max(0, pages.length - 1);
    currentPage = Math.min(currentFirstPage, maxPage);
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
    if (currentPage >= pages.length - 1) {
      goToNextChatIndex();
      return;
    }
    currentPage++;
  }

  function prevPage() {
    if (currentPage === 0) {
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
      openMobileViewer(index, false, true);
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
      openMobileViewer(index, false, true);
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

    if (isSettingsOpen || isLBPanelOpen) {
      if (e.key === 'Escape') {
        isSettingsOpen = false;
        isLBPanelOpen = false;
      }
      return;
    }

    // 텍스트 입력 중이거나 텍스트 선택 중일 때는 네비게이션 비활성화
    if (e.key !== 'Escape') {
      const activeEl = document.activeElement;
      const isInputFocused =
        activeEl &&
        (activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'INPUT' ||
          activeEl.isContentEditable);
      if (isInputFocused) return;

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

  // 패널 토글
  function toggleSettingsPanel() {
    isSettingsOpen = !isSettingsOpen;
    if (isSettingsOpen) isLBPanelOpen = false;
  }

  function toggleLBPanel() {
    isLBPanelOpen = !isLBPanelOpen;
    if (isLBPanelOpen) isSettingsOpen = false;
  }

  // 전체화면 토글
  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement?.requestFullscreen?.();
        isFullscreen = true;
      } else {
        await document.exitFullscreen?.();
        isFullscreen = false;
      }
    } catch (err) {
      console.warn('[MobileViewer] Fullscreen error:', err);
    }
  }

  // 전체화면 변경 감지
  function handleFullscreenChange() {
    isFullscreen = !!document.fullscreenElement;
  }

  // 사용자 CSS
  function openCustomCssModal() {
    isSettingsOpen = false;
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

    // 라이브 버튼 클릭 트리거
    if (identifier && liveLBModuleButtons.has(identifier)) {
      const liveButton = liveLBModuleButtons.get(identifier);
      const mouseEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });
      liveButton.dispatchEvent(mouseEvent);
    }
  }

  // 리사이즈 감지
  function handleResize() {
    debouncedRepaginate();
  }

  const debouncedHandleSettingPanel = debounce(handleSettingPanel, 100);

  // 모바일 환경에서 세팅 패널 발견 시 뷰어 닫기
  function handleSettingPanel() {
    const settingPanel = risuSelector(LOCATOR.setting.root);
    if (settingPanel) {
      console.log(settingPanel);

      closeMobileViewer();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} onresize={handleResize} />
<svelte:document onfullscreenchange={handleFullscreenChange} />

<div
  class="risu-chat"
  data-chat-index={chatIndex}
  data-chat-page={chatPage}
  data-char-id={chaId}
>
  <div
    class="mobile-reader"
    bind:this={rootElement}
    data-theme={settings.theme}
    style:height={viewerHeight}
    style:padding={'unset !important'}
  >
    <MobileBookHeader
      thumbnailUrl={headerInfo.thumbnailUrl}
      name={headerInfo.name}
      chatIndex={headerInfo.chatIndex}
      buttons={headerInfo.buttons}
      {chatIndexPosition}
      showLBButton={lbModules.length > 0}
      {isFullscreen}
      onBack={onClose}
      onPrevChat={goToPrevChatIndex}
      onNextChat={goToNextChatIndex}
      onFullscreenToggle={toggleFullscreen}
      onLBToggle={toggleLBPanel}
      onSettingsToggle={toggleSettingsPanel}
    />

    <MobileBookPage
      content={currentContent}
      {pageNum}
      {isLoading}
      {loadingMessage}
      {liveContentButtons}
    />

    <MobileNavFooter
      {currentPage}
      {totalPages}
      onPrev={prevPage}
      onNext={nextPage}
      prevDisabled={currentPage === 0}
      nextDisabled={currentPage >= totalPages - 1}
    />

    <MobileSettingsPanel
      isOpen={isSettingsOpen}
      {settings}
      onSettingsChange={handleSettingsChange}
      onOpenCustomCss={openCustomCssModal}
      onClose={() => (isSettingsOpen = false)}
    />

    <MobileLBPanel
      isOpen={isLBPanelOpen}
      modules={lbModules}
      onModuleClick={handleLBModuleClick}
      onClose={() => (isLBPanelOpen = false)}
    />

    <MobileCustomCssModal
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
</div>
