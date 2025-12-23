/**
 * dom-helper.js - DOM 조작 유틸리티
 */

/**
 * 버튼 요소들을 클론하여 컨테이너에 추가하고, 클릭 시 원본 버튼의 이벤트를 트리거
 * cloneNode는 이벤트 리스너를 복사하지 않으므로, 이벤트 위임 패턴을 사용
 *
 * @param {HTMLElement[]} buttons - 원본 버튼 요소 배열
 * @param {HTMLElement} container - 클론된 버튼을 추가할 컨테이너
 * @param {Object} [options] - 옵션
 * @param {boolean} [options.clearContainer=true] - 컨테이너 초기화 여부
 * @param {string[]} [options.additionalClasses=[]] - 클론된 버튼에 추가할 클래스
 * @returns {HTMLElement[]} 클론된 버튼 요소 배열
 */
export function cloneButtonsWithEventDelegation(
  buttons,
  container,
  options = {},
) {
  const { clearContainer = true, additionalClasses = [] } = options;

  if (!container || !buttons?.length) return [];

  if (clearContainer) {
    container.innerHTML = '';
  }

  const clonedButtons = [];

  buttons.forEach(btn => {
    const cloned = btn.cloneNode(true);

    // 추가 클래스 적용
    additionalClasses.forEach(cls => cloned.classList.add(cls));

    // 클릭 시 원본 버튼 클릭 트리거 (이벤트 위임)
    // Svelte의 onclick 핸들러는 .click()으로 트리거되지 않을 수 있으므로
    // MouseEvent를 직접 dispatch
    cloned.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();

      const mouseEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });
      btn.dispatchEvent(mouseEvent);
    });

    container.appendChild(cloned);
    clonedButtons.push(cloned);
  });

  return clonedButtons;
}

/**
 * HTML 문자열 내의 버튼들에 이벤트 위임을 설정
 * BookPages에서 innerHTML로 콘텐츠를 설정한 후 사용
 *
 * @param {HTMLElement} container - 버튼을 포함한 컨테이너
 * @param {HTMLElement[]} originalButtons - 원본 버튼 요소 배열 (data-id 또는 클래스로 매칭)
 * @param {Object} [options] - 옵션
 * @param {string} [options.buttonSelector='button, [role="button"]'] - 버튼 선택자
 * @param {(original: HTMLElement, cloned: HTMLElement) => boolean} [options.matcher] - 매칭 함수
 */
export function delegateButtonEvents(container, originalButtons, options = {}) {
  const {
    buttonSelector = 'button, [role="button"], .risu-btn, [risu-btn]',
    matcher,
  } = options;

  if (!container || !originalButtons?.length) return;

  const clonedButtons = container.querySelectorAll(buttonSelector);

  clonedButtons.forEach(cloned => {
    // 매칭되는 원본 버튼 찾기
    const original = originalButtons.find(btn => {
      if (matcher) {
        return matcher(btn, cloned);
      }

      // 기본 매칭: data-id, risu-btn, 또는 클래스명으로 매칭
      const originalId = btn.dataset?.id || btn.getAttribute('risu-btn');
      const clonedId = cloned.dataset?.id || cloned.getAttribute('risu-btn');

      if (originalId && clonedId && originalId === clonedId) {
        return true;
      }

      // 클래스명으로 매칭 (동일한 클래스 세트를 가진 경우)
      if (
        btn.className &&
        cloned.className &&
        btn.className === cloned.className
      ) {
        return true;
      }

      return false;
    });

    if (original) {
      cloned.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();

        const mouseEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
        });
        original.dispatchEvent(mouseEvent);
      });
    }
  });
}
