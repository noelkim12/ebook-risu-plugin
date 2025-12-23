/**
 * viewerHelpers.js - 모바일 뷰어 열기/닫기 헬퍼
 */
import {
  safeMount,
  safeUnmount,
  isMounted,
  safeSetStyle,
  safeRestoreStyle,
} from '../../../../utils/svelte-helper.js';
import {
  risuSelector,
  LOCATOR,
  getChatElementByChatIndex,
} from '../../../../utils/selector.js';
import { RisuAPI } from '../../../../core/risu-api.js';
import MobileBookViewer from './MobileBookViewer.svelte';

const MOBILE_VIEWER_ID = 'mobile-book-viewer';
const STYLE_NAMESPACE = 'mobile-viewer';

/**
 * 모바일 뷰어 열기
 * @param {number|null} chatIndex - 채팅 인덱스 (null이면 마지막 채팅)
 * @param {boolean} toggleViewer - 토글 동작 여부
 * @param {boolean} showLoading - 로딩 오버레이 표시 여부
 */
export function openMobileViewer(
  chatIndex = null,
  toggleViewer = true,
  showLoading = false,
) {
  // 이미 열려있으면 닫기 (토글)
  if (toggleViewer && isMounted(MOBILE_VIEWER_ID)) {
    closeMobileViewer();
    return;
  }

  // 이미 열려있고 토글이 아니면 기존 뷰어 닫고 새로 열기
  if (isMounted(MOBILE_VIEWER_ID)) {
    safeUnmount(MOBILE_VIEWER_ID);
  }

  const risuAPI = RisuAPI.getInstance();

  // 채팅 인덱스 결정
  const targetIndex =
    chatIndex != null ? Number(chatIndex) : risuAPI.getLastChatIndex() - 1;

  // 채팅 요소 가져오기
  const chatElement = getChatElementByChatIndex(targetIndex);
  if (!chatElement) {
    console.warn(
      '[MobileViewer] Chat element not found for index:',
      targetIndex,
    );
    return;
  }

  const chatHtml = chatElement.outerHTML;
  const chatPage = risuAPI.getCurrentChatPage();
  const chaId = risuAPI.getChaId();

  // displayContainer 스타일 변경
  const displayContainer = risuSelector(LOCATOR.chatScreen.displayContainer);
  if (displayContainer) {
    safeSetStyle(displayContainer, { overflow: 'hidden' }, STYLE_NAMESPACE);
  }

  // 모바일 뷰어 마운트
  safeMount({
    id: MOBILE_VIEWER_ID,
    component: MobileBookViewer,
    target: document.body,
    props: {
      chatHtml,
      chatIndex: targetIndex,
      chatPage,
      chaId,
      onClose: closeMobileViewer,
      initialLoading: showLoading,
    },
  });
}

/**
 * 모바일 뷰어 닫기
 */
export async function closeMobileViewer() {
  // displayContainer 스타일 복원
  const displayContainer = risuSelector(LOCATOR.chatScreen.displayContainer);
  if (displayContainer) {
    safeRestoreStyle(displayContainer, STYLE_NAMESPACE);
  }
  if (document.fullscreenElement) {
    await document.exitFullscreen?.();
  }
  safeUnmount(MOBILE_VIEWER_ID);
}

/**
 * 모바일 뷰어 열림 여부 확인
 */
export function isMobileViewerOpen() {
  return isMounted(MOBILE_VIEWER_ID);
}

/**
 * 모바일 뷰어 토글
 * @param {number|null} chatIndex - 채팅 인덱스
 */
export function toggleMobileViewer(chatIndex = null) {
  if (isMobileViewerOpen()) {
    closeMobileViewer();
  } else {
    openMobileViewer(chatIndex, false, false);
  }
}
