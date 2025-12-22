/**
 * viewerHelpers.js - PC 뷰어 열기/닫기 헬퍼 함수
 */

import {
  safeMount,
  safeUnmount,
  isMounted,
  safeSetStyle,
  safeRestoreStyle,
} from '../../../../utils/svelte-helper.js';
import PCBookViewer from './PCBookViewer.svelte';
import {
  getChatElementByChatIndex,
  LOCATOR,
  risuSelector,
} from '../../../../utils/selector.js';
import { RisuAPI } from '../../../../core/risu-api.js';

const VIEWER_ID = 'pc-book-viewer';
const VIEWER_STYLE_NAMESPACE = 'pc-viewer';

// 마운트 타겟 참조 저장
let mountTarget = null;

/**
 * PC 뷰어 열기
 * @param {number|null} chatIndex - 표시할 채팅 인덱스 (null이면 마지막 채팅)
 * @param {boolean} togleViewer - 뷰어 토글 여부 (true이면 뷰어 토글, false이면 뷰어 열기)
 * @param {boolean} showLoading - 로딩 오버레이 표시 여부 (chat index 이동 시 true)
 * @returns {boolean} 성공 여부
 */
export function openPCViewer(chatIndex = null, togleViewer = true, showLoading = false) {
  // togleViewer일 때, 뷰어가 이미 열려있으면 닫기
  if (isMounted(VIEWER_ID)) {
    closePCViewer();
    // togleViewer true이면 여기서 끝
    if (togleViewer) return true;
  }

  try {
    const risuAPI = RisuAPI.getInstance();

    // 채팅 인덱스 결정 (null/undefined인 경우에만 마지막 채팅 사용, -1 등 음수는 유효한 인덱스)
    // chatIndex가 문자열로 전달될 수 있으므로 숫자로 변환
    const targetIndex = chatIndex != null ? Number(chatIndex) : risuAPI.getLastChatIndex() - 1;

    // 채팅 요소 가져오기
    const chatElement = getChatElementByChatIndex(targetIndex);
    if (!chatElement) {
      console.warn('[PCViewer] Chat element not found for index:', targetIndex);
      return false;
    }

    // 마운트 타겟 찾기
    const displayContainer = risuSelector(LOCATOR.chatScreen.displayContainer);
    if (!displayContainer) {
      console.warn('[PCViewer] Display container not found');
      return false;
    }

    // 마운트 타겟 저장 및 position: relative 설정 (absolute 포지셔닝 기준점)
    mountTarget = displayContainer;
    safeSetStyle(
      displayContainer,
      {
        overflow: 'hidden',
      },
      VIEWER_STYLE_NAMESPACE,
    );

    const rootContainer = risuSelector(LOCATOR.chatScreen.root);
    safeSetStyle(
      rootContainer,
      {
        overflow: 'hidden',
      },
      VIEWER_STYLE_NAMESPACE,
    );

    // 뷰어 마운트
    const result = safeMount({
      id: VIEWER_ID,
      component: PCBookViewer,
      target: displayContainer,
      props: {
        chatHtml: chatElement.outerHTML,
        chatIndex: targetIndex,
        chatPage: risuAPI.getCurrentChatPage(),
        chaId: risuAPI.getChaId(),
        onClose: closePCViewer,
        initialLoading: showLoading,
      },
      useContents: false,
    });

    if (result) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('[PCViewer] Failed to open:', error);
    return false;
  }
}

/**
 * PC 뷰어 닫기
 * @returns {boolean} 성공 여부
 */
export function closePCViewer() {
  // 마운트 타겟의 스타일 복원
  if (mountTarget) {
    safeRestoreStyle(mountTarget, VIEWER_STYLE_NAMESPACE);
    const rootContainer = risuSelector(LOCATOR.chatScreen.root);
    safeRestoreStyle(rootContainer, VIEWER_STYLE_NAMESPACE);
    mountTarget = null;
  }

  const result = safeUnmount(VIEWER_ID);
  return result;
}

/**
 * PC 뷰어가 열려있는지 확인
 * @returns {boolean}
 */
export function isPCViewerOpen() {
  return isMounted(VIEWER_ID);
}

/**
 * 뷰어 토글
 * @param {number|null} chatIndex
 * @returns {boolean} 열렸으면 true, 닫혔으면 false
 */
export function togglePCViewer(chatIndex = null) {
  if (isPCViewerOpen()) {
    closePCViewer();
    return false;
  } else {
    openPCViewer(chatIndex);
    return true;
  }
}
