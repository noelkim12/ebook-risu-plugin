/**
 * Svelte 다이얼로그 컴포넌트 헬퍼 함수
 * 프로그래밍 방식으로 다이얼로그를 표시하고 관리합니다.
 */

import { mount, unmount } from 'svelte';
import AlertDialog from './AlertDialog.svelte';
import LoadingDialog from './LoadingDialog.svelte';

/**
 * AlertDialog를 표시하고 사용자 확인을 기다림
 * @param {string} message - 표시할 메시지
 * @param {string} [confirmText="확인"] - 확인 버튼 텍스트
 * @returns {Promise<void>}
 */
export function showAlert(message, confirmText = '확인') {
  return new Promise(resolve => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const component = mount(AlertDialog, {
      target: container,
      props: {
        message,
        confirmText,
      },
    });

    // Svelte 5에서는 $on 대신 이벤트 리스너를 props로 전달하거나
    // container에서 이벤트를 캐치해야 합니다
    container.addEventListener('confirm', () => {
      unmount(component);
      container.remove();
      resolve();
    });
  });
}

/**
 * LoadingDialog를 표시하고 지정된 시간 후 자동으로 닫음
 * @param {string} message - 표시할 메시지
 * @param {number} [duration=3000] - 표시 시간 (밀리초)
 * @returns {Promise<void>}
 */
export function showLoading(message = '업데이트를 처리하고 있습니다...', duration = 3000) {
  return new Promise(resolve => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const component = mount(LoadingDialog, {
      target: container,
      props: {
        message,
      },
    });

    setTimeout(() => {
      unmount(component);
      container.remove();
      resolve();
    }, duration);
  });
}
