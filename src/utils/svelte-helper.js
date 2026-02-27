import { mount, unmount } from 'svelte';

// ============================================================
// 상수
// ============================================================
const DATA_PREFIX = 'data-svelte-helper';
const MANAGED_ELEMENTS = new WeakMap();

const mountedComponents = new Map();

export function mountComponent({
  id,
  component,
  target,
  anchor = null,
  props = {},
}) {
  if (!id || !component || !target) {
    console.warn('[mountComponent] id, component, target은 필수입니다.');
    return null;
  }

  if (mountedComponents.has(id)) {
    return mountedComponents.get(id);
  }

  try {
    const instance = mount(component, {
      target,
      anchor,
      props,
    });

    const cleanup = () => unmountComponent(id);
    const record = { instance, target, cleanup };
    mountedComponents.set(id, record);

    return record;
  } catch (error) {
    console.error(`[mountComponent] ${id} 마운트 실패:`, error);
    return null;
  }
}

/**
 * safeMount로 마운트된 컴포넌트를 안전하게 언마운트
 *
 * @param {string} id - 컴포넌트 고유 식별자
 * @returns {boolean} 성공 여부
 */
export function unmountComponent(id) {
  const record = mountedComponents.get(id);

  if (!record) {
    return false;
  }

  try {
    const { instance } = record;

    if (instance) {
      unmount(instance);
    }

    mountedComponents.delete(id);

    return true;
  } catch (error) {
    console.error(`[safeUnmount] ${id} 언마운트 실패:`, error);
    return false;
  }
}

export function safeUnmount(id) {
  return unmountComponent(id);
}

/**
 * 특정 ID의 컴포넌트가 마운트되어 있는지 확인
 *
 * @param {string} id - 컴포넌트 고유 식별자
 * @returns {boolean}
 */
export function isMounted(id) {
  return mountedComponents.has(id);
}

/**
 * 마운트된 컴포넌트 인스턴스 가져오기
 *
 * @param {string} id - 컴포넌트 고유 식별자
 * @returns {Object | null}
 */
export function getMounted(id) {
  return mountedComponents.get(id) || null;
}

/**
 * 모든 마운트된 컴포넌트 언마운트 (cleanup용)
 */
export function unmountAll() {
  const ids = [...mountedComponents.keys()];
  ids.forEach(id => {
    unmountComponent(id);
  });
}

/**
 * 특정 target에 마운트된 모든 컴포넌트 언마운트
 *
 * @param {HTMLElement} target
 */
export function unmountByTarget(target) {
  mountedComponents.forEach((record, id) => {
    if (record.target === target) {
      unmountComponent(id);
    }
  });
}
export function conditionalMount(condition, options) {
  if (condition) {
    return mountComponent(options);
  } else {
    unmountComponent(options.id);
    return null;
  }
}

export function mountMultiple(componentConfigs) {
  return componentConfigs.map(config => mountComponent(config)).filter(Boolean);
}

// ============================================================
// 안전한 DOM 조작 유틸리티
// ============================================================

/**
 * 안전하게 클래스 추가 (Svelte 클래스 바인딩과 충돌 방지)
 * data 속성을 사용하여 추가된 클래스 추적
 *
 * @param {HTMLElement} element
 * @param {string} className
 * @param {string} [namespace='default'] - 네임스페이스 (충돌 방지)
 */
export function safeAddClass(element, className, namespace = 'default') {
  if (!element || !className) return;

  const key = `${DATA_PREFIX}-class-${namespace}`;
  const existing = element.getAttribute(key) || '';
  const classes = existing ? existing.split(' ') : [];

  if (!classes.includes(className)) {
    classes.push(className);
    element.setAttribute(key, classes.join(' '));
    element.classList.add(className);
  }
}

/**
 * safeAddClass로 추가한 클래스 제거
 *
 * @param {HTMLElement} element
 * @param {string} className
 * @param {string} [namespace='default']
 */
export function safeRemoveClass(element, className, namespace = 'default') {
  if (!element || !className) return;

  const key = `${DATA_PREFIX}-class-${namespace}`;
  const existing = element.getAttribute(key) || '';
  const classes = existing.split(' ').filter(c => c && c !== className);

  if (classes.length > 0) {
    element.setAttribute(key, classes.join(' '));
  } else {
    element.removeAttribute(key);
  }
  element.classList.remove(className);
}

/**
 * 특정 네임스페이스의 모든 클래스 제거
 *
 * @param {HTMLElement} element
 * @param {string} [namespace='default']
 */
export function safeRemoveAllClasses(element, namespace = 'default') {
  if (!element) return;

  const key = `${DATA_PREFIX}-class-${namespace}`;
  const existing = element.getAttribute(key) || '';

  existing.split(' ').forEach(className => {
    if (className) element.classList.remove(className);
  });

  element.removeAttribute(key);
}

/**
 * 안전하게 스타일 설정 (Svelte style 바인딩과 충돌 방지)
 * 원래 스타일을 백업하고 복원 가능
 *
 * @param {HTMLElement} element
 * @param {Object} styles - { property: value } 형태
 * @param {string} [namespace='default']
 */
export function safeSetStyle(element, styles, namespace = 'default') {
  if (!element || !styles) return;

  const key = `${DATA_PREFIX}-style-${namespace}`;
  let backup = MANAGED_ELEMENTS.get(element)?.[key] || {};

  Object.entries(styles).forEach(([prop, value]) => {
    // 원래 값 백업 (처음 설정할 때만)
    if (!(prop in backup)) {
      backup[prop] = element.style.getPropertyValue(prop);
    }
    element.style.setProperty(prop, value);
  });

  // WeakMap에 백업 저장
  const elementData = MANAGED_ELEMENTS.get(element) || {};
  elementData[key] = backup;
  MANAGED_ELEMENTS.set(element, elementData);
}

/**
 * safeSetStyle로 설정한 스타일 복원
 *
 * @param {HTMLElement} element
 * @param {string} [namespace='default']
 */
export function safeRestoreStyle(element, namespace = 'default') {
  if (!element) return;

  const key = `${DATA_PREFIX}-style-${namespace}`;
  const elementData = MANAGED_ELEMENTS.get(element);
  const backup = elementData?.[key];

  if (backup) {
    Object.entries(backup).forEach(([prop, value]) => {
      if (value) {
        element.style.setProperty(prop, value);
      } else {
        element.style.removeProperty(prop);
      }
    });
    delete elementData[key];
  }
}

/**
 * 안전하게 data 속성 설정 (Svelte와 충돌 없음)
 *
 * @param {HTMLElement} element
 * @param {string} key - data- 접두사 제외한 키
 * @param {string} value
 */
export function safeSetData(element, key, value) {
  if (!element || !key || !value) return;
  element.dataset[key] = value;
}

/**
 * data 속성 가져오기
 *
 * @param {HTMLElement} element
 * @param {string} key
 * @returns {string | undefined}
 */
export function safeGetData(element, key) {
  return element?.dataset?.[key];
}

/**
 * data 속성 제거
 *
 * @param {HTMLElement} element
 * @param {string} key
 */
export function safeRemoveData(element, key) {
  if (element?.dataset) {
    delete element.dataset[key];
  }
}

/**
 * 안전하게 요소 삽입 (wrapper 사용)
 * Svelte 관리 컨테이너에 순수 HTML 요소 삽입
 *
 * @param {Object} options
 * @param {string} options.id - 고유 식별자
 * @param {HTMLElement} options.element - 삽입할 요소
 * @param {HTMLElement} options.target - 부모 요소
 * @param {HTMLElement} [options.anchor] - 이 요소 앞에 삽입
 * @returns {{ wrapper: HTMLElement, cleanup: Function } | null}
 */
export function safeInsertElement({ id, element, target, anchor = null }) {
  if (!id || !element || !target) return null;

  const flagKey = `${DATA_PREFIX}-element-${id}`;
  if (target.hasAttribute(flagKey)) {
    return null; // 이미 삽입됨
  }

  const wrapper = document.createElement('div');
  wrapper.style.display = 'contents';
  wrapper.setAttribute(`${DATA_PREFIX}-wrapper`, id);
  wrapper.appendChild(element);

  if (anchor && anchor.parentElement === target) {
    target.insertBefore(wrapper, anchor);
  } else {
    target.appendChild(wrapper);
  }

  target.setAttribute(flagKey, 'true');

  const cleanup = () => {
    wrapper.remove();
    target.removeAttribute(flagKey);
  };

  return { wrapper, cleanup };
}

/**
 * 안전한 이벤트 리스너 추가 (자동 정리 지원)
 *
 * @param {HTMLElement} element
 * @param {string} event
 * @param {Function} handler
 * @param {Object} [options]
 * @returns {Function} cleanup 함수
 */
export function safeAddEventListener(element, event, handler, options = {}) {
  if (!element || !event || !handler) return () => {};

  element.addEventListener(event, handler, options);

  return () => {
    element.removeEventListener(event, handler, options);
  };
}

/**
 * 안전한 MutationObserver (무한 루프 방지)
 *
 * @param {HTMLElement} target
 * @param {Function} callback
 * @param {Object} [options]
 * @param {number} [debounceMs=50] - 디바운스 시간
 * @returns {{ observer: MutationObserver, disconnect: Function }}
 */
export function safeMutationObserver(
  target,
  callback,
  options = {},
  debounceMs = 50,
) {
  let timeoutId = null;
  let isProcessing = false;

  const debouncedCallback = mutations => {
    if (isProcessing) return;

    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      isProcessing = true;
      try {
        callback(mutations);
      } finally {
        // 다음 틱에서 플래그 해제 (Svelte 업데이트 완료 후)
        requestAnimationFrame(() => {
          isProcessing = false;
        });
      }
    }, debounceMs);
  };

  const observer = new MutationObserver(debouncedCallback);

  observer.observe(target, {
    childList: true,
    subtree: true,
    ...options,
  });

  const disconnect = () => {
    clearTimeout(timeoutId);
    observer.disconnect();
  };

  return { observer, disconnect };
}
