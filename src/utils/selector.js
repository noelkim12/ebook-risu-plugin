import { PLUGIN_NAME } from '../constants.js';

export const LOCATOR = {
  chatScreen: {
    root: {
      cssClass: ['div.default-chat-screen'],
      className: `default-chat-screen`,
    },
    displayContainer: {
      cssClass: ['div.default-chat-screen > div.flex.flex-col-reverse'],
      className: `${PLUGIN_NAME}-display-container`,
    },
    inputContainer: {
      cssClass: [
        'div.default-chat-screen > div.mt-2.mb-2.flex.items-stretch.w-full',
        'div.default-chat-screen > div.sticky.pt-2.pb-2.right-0.bottom-0.bg-bgcolor.flex.items-stretch.w-full',
      ],
      className: `${PLUGIN_NAME}-input-container`,
    },
    textarea: {
      cssClass: [
        'div.default-chat-screen > div.mt-2.mb-2.flex.items-stretch.w-full > textarea',
        'div.default-chat-screen textarea.text-input-area',
      ],
      className: `${PLUGIN_NAME}-input-textarea`,
    },
    sendButton: {
      cssClass: [
        'div.default-chat-screen > button.button-icon-send',
        '.button-icon-send',
      ],
      className: `${PLUGIN_NAME}-send-button`,
    },
    burgerButton: {
      cssClass: [
        'div.default-chat-screen > button.peer-focus\:border-textcolor.mr-2.flex.border-y.border-r.border-darkborderc.justify-center.items-center.text-gray-100.p-3.rounded-r-md.hover\:bg-blue-500.transition-colors',
        `${PLUGIN_NAME}-burger-button`,
      ],
    },
    burgerMenu: {
      cssClass: [
        'div.default-chat-screen > div.right-2.bottom-16.p-5.bg-darkbg.flex.flex-col.gap-3.text-textcolor.rounded-md',
      ],
      className: `burger-menu`,
    },
  },
  chatMessage: {
    root: {
      cssClass: ['div.risu-chat'],
      className: `${PLUGIN_NAME}-chat-message-root`,
    },
    thumbnail: {
      cssClass: ['div.shadow-lg.bg-textcolor2.rounded-md'],
      className: `${PLUGIN_NAME}-chat-message-thumbnail`,
    },
    botName: {
      cssClass: ['span.chat-width.text-xl.unmargin.text-textcolor'],
      className: `${PLUGIN_NAME}-chat-message-bot-name`,
    },
    botButtonDiv: {
      cssClass: ['div.flex-grow.flex.items-center.justify-end.text-textcolor2'],
      className: `${PLUGIN_NAME}-chat-message-bot-buttons`,
    },
    copyButton: {
      cssClass: ['button-icon-copy'],
      className: `button-icon-copy`,
    },
    ttsButton: {
      cssClass: ['button-icon-tts'],
      className: `button-icon-tts`,
    },
    removeButton: {
      cssClass: ['button-icon-remove'],
      className: `button-icon-remove`,
    },
    translateButton: {
      cssClass: ['button-icon-translate'],
      className: `button-icon-translate`,
    },
    unrerollButton: {
      cssClass: ['button-icon-unreroll'],
      className: `button-icon-unreroll`,
    },
    rerollButton: {
      cssClass: ['button-icon-reroll'],
      className: `button-icon-reroll`,
    },
    lightboardButtons: {
      cssClass: ['x-risu-lb-module-root', 'x-risu-lb-nai-btn'],
      className: `x-risu-lb-module-root`,
    },
    lightboardNewsButton: {
      dataId: 'lightboard-news',
      cssClass: ['div.x-risu-lb-module-root'],
      className: `${PLUGIN_NAME}-lightboard-news`,
    },
    lightboardCommentButton: {
      dataId: 'lightboard-comment',
      cssClass: ['div.x-risu-lb-module-root'],
      className: `${PLUGIN_NAME}-lightboard-comment`,
    },
    lightboardMiniboardButton: {
      dataId: 'lightboard-miniboard',
      cssClass: ['div.x-risu-lb-module-root'],
      className: `${PLUGIN_NAME}-lightboard-miniboard`,
    },
    lightboardSNSButton: {
      dataId: 'SNS-Forme',
      cssClass: ['div.x-risu-lb-module-root'],
      className: `${PLUGIN_NAME}-lightboard-sns`,
    },
    lightboardNAIButton: {
      cssClass: ['x-risu-lb-nai-btn'],
      className: `x-risu-lb-nai-btn`,
    },
  },
  setting: {
    root: {
      cssClass: ['rs-setting-cont'],
      className: 'rs-setting-cont',
    },
  },
};

async function getRootDoc(root) {
  if (root) {
    return root;
  }

  const api = globalThis.risuai;
  if (api && typeof api.getRootDocument === 'function') {
    return await api.getRootDocument();
  }

  return document;
}

async function getClassNameValue(element) {
  if (!element) {
    return '';
  }

  if (typeof element.getClassName === 'function') {
    return (await element.getClassName()) || '';
  }

  return element.className || '';
}

async function hasClassName(element, className) {
  if (!element || !className) {
    return false;
  }

  if (typeof element.hasClass === 'function') {
    return await element.hasClass(className);
  }

  if (typeof element.matches === 'function') {
    return element.matches(`.${className}`);
  }

  if (typeof element.classList?.contains === 'function') {
    return element.classList.contains(className);
  }

  const names = String(await getClassNameValue(element))
    .split(' ')
    .filter(Boolean);
  return names.includes(className);
}

async function markLocatorClass(element, className) {
  if (!element || !className) {
    return;
  }

  if (await hasClassName(element, className)) {
    return;
  }

  if (typeof element.addClass === 'function') {
    await element.addClass(className);
    return;
  }

  if (typeof element.setClassName === 'function') {
    await element.setClassName(
      `${className} ${await getClassNameValue(element)}`.trim(),
    );
    return;
  }

  if (typeof element.className === 'string') {
    element.className = `${className} ${element.className}`.trim();
  }
}

async function getParentNode(node) {
  if (!node) {
    return null;
  }

  if (typeof node.getParent === 'function') {
    return await node.getParent();
  }

  return node.parentElement || node.parentNode || null;
}

function readChatIndexFromElement(element) {
  if (!element) {
    return null;
  }

  const dataset = element?.dataset;
  if (dataset && Object.prototype.hasOwnProperty.call(dataset, 'chatIndex')) {
    const text = dataset.chatIndex;
    if (text == null) {
      return null;
    }
    const index = parseInt(text, 10);
    return Number.isFinite(index) ? index : null;
  }

  return null;
}

async function matchesSelector(element, selector) {
  if (!element || !selector) {
    return false;
  }

  if (typeof element.matches === 'function') {
    return element.matches(selector);
  }

  if (selector.startsWith('.')) {
    return await hasClassName(element, selector.slice(1));
  }

  return false;
}

async function safeQuerySelectorAll(root, selector) {
  if (!root || !selector || typeof root.querySelectorAll !== 'function') {
    return [];
  }

  try {
    const matched = await root.querySelectorAll(selector);
    if (Array.isArray(matched)) {
      return matched;
    }

    return [...matched];
  } catch {
    return [];
  }
}

function getLocatorSelectors(locator) {
  return [
    ...(locator?.className ? [`.${locator.className}`] : []),
    ...(locator?.cssClass ?? []),
  ];
}
/**
 * 사전 정의된 LOCATOR를 통해 element를 찾는 함수
 * @param {*} locator
 * @param {*} root
 * @returns
 * @example
 * const textarea = risuSelector(LOCATOR.chatScreen.textarea);
 * const sendButton = risuSelector(LOCATOR.chatScreen.sendButton);
 * const burgerButton = risuSelector(LOCATOR.chatScreen.burgerButton);
 * const burgerMenu = risuSelector(LOCATOR.chatScreen.burgerMenu);
 */
export async function risuSelector(locator, root) {
  const r = await getRootDoc(root);

  if (!locator) return null;

  for (const sel of getLocatorSelectors(locator) ?? []) {
    if (!sel) continue;
    try {
      const el = await r.querySelector(sel.startsWith('.') ? sel : `.${sel}`);
      if (el) {
        if (await hasClassName(el, locator.className)) return el;

        // 클래스를 맨 앞에 추가
        await markLocatorClass(el, locator.className);
        return el;
      }
    } catch {
      // 잘못된 셀렉터는 무시
    }
  }

  return null;
}

/**
 * 사전 정의된 LOCATOR를 통해 모든 매칭 element를 찾는 함수
 * @param {Object} locator - LOCATOR 객체
 * @param {Element|Document} [root] - 검색 시작 루트 (기본: document)
 * @returns {HTMLElement[]} 매칭된 요소 배열
 * @example
 * const allChatMessages = risuSelectorAll(LOCATOR.chatMessage.root);
 * allChatMessages.forEach((msg, idx) => console.log(`Message ${idx}:`, msg));
 */
export async function risuSelectorAll(locator, root) {
  const r = await getRootDoc(root);

  if (!locator) return [];

  const results = new Set();

  for (const sel of locator?.cssClass ?? []) {
    (await safeQuerySelectorAll(r, sel)).forEach(el => {
      results.add(el);
    });
  }

  if (locator?.className) {
    (await safeQuerySelectorAll(r, `.${locator.className}`)).forEach(el => {
      results.add(el);
    });
  }

  // 각 요소에 클래스 마킹
  const resultArray = [...results];
  for (const el of resultArray) {
    await markLocatorClass(el, locator.className);
  }

  return resultArray;
}

/**
 * 노드에서 가장 가까운 risu-chat 요소를 찾아 chat index를 반환
 * @param {Object} options
 * @param {Node|null} options.node - 검색 시작 노드
 * @param {number} [options.maxDepth=10] - 최대 탐색 깊이 (무한 루프 방지)
 * @returns {number|null} chat index (숫자) 또는 null
 */
export async function getChatIndexFromNode({ node, maxDepth = 10 }) {
  if (!node) {
    return null;
  }

  const CHAT_CLASS = 'risu-chat';
  let current = node;
  if (!(await matchesSelector(current, `.${CHAT_CLASS}`))) {
    current = await getParentNode(current);
  }
  let depth = 0;

  while (current && depth < maxDepth) {
    if (await matchesSelector(current, `.${CHAT_CLASS}`)) {
      return readChatIndexFromElement(current);
    }

    current = await getParentNode(current);
    depth += 1;
  }

  return null;
}

/**
 * data-chat-index값과 index가 일치하는 risu-chat 요소를 찾아 element를 반환
 * @param {number|string} index - chat index (숫자 또는 문자열)
 * @returns {HTMLElement|null}
 * @example
 * const chatEl = getChatElementByChatIndex(0);
 * const chatEl2 = getChatElementByChatIndex('5');
 */
export async function getChatElementByChatIndex(index) {
  // 1. 입력값 검증
  if (index == null) return null;

  // 2. 현재 채팅창인지 검증
  const chatElements = await risuSelectorAll(LOCATOR.chatMessage.root);
  if (!chatElements.length) return null;

  // 3. 숫자로 변환 및 유효성 검사 (음수 인덱스도 유효함, 예: -1)
  const numIndex = typeof index === 'string' ? parseInt(index, 10) : index;
  if (!Number.isFinite(numIndex)) return null;

  // 4. 문자열로 변환 (dataset 비교용)
  const indexStr = String(numIndex);

  // 5. 매칭되는 요소 반환
  return (
    chatElements.find(el => {
      const chatIndex = readChatIndexFromElement(el);
      return chatIndex != null && String(chatIndex) === indexStr;
    }) ?? null
  );
}

/**
 * 현재 chat screen을 보고있는지 확인하는 함수
 * @returns {boolean}
 * @example
 * const isInChatScreen = isInChatScreenNow();
 * if (isInChatScreen) {
 *   console.log('채팅창에 있습니다.');
 * } else {
 *   console.log('채팅창에 있지 않습니다.');
 * }
 */
export async function isInChatScreenNow() {
  return !!(await risuSelector(LOCATOR.chatScreen.root));
}

/**
 * 현재 화면에 렌더링된 모든 chat index를 배열로 반환
 * RisuAI는 가상화로 인해 모든 메시지가 DOM에 없을 수 있으므로,
 * 실제 렌더링된 요소만 추출합니다.
 *
 * @returns {number[]} chat index 배열 (오름차순 정렬)
 * @example
 * const indices = getAllVisibleChatIndices();
 * // [0, 1, 2, 5, 6, 7] - 중간에 빠진 인덱스가 있을 수 있음
 */
export async function getAllVisibleChatIndices() {
  const chatElements = await risuSelectorAll(LOCATOR.chatMessage.root);
  if (!chatElements.length) return [];

  const indices = [];
  for (const el of chatElements) {
    if (await hasClassName(el, 'book-viewer-root')) {
      continue;
    }
    const idx = readChatIndexFromElement(el);
    if (idx !== null) {
      indices.push(idx);
    }
  }

  // 오름차순 정렬하고 중복 제거
  return [...new Set(indices)].sort((a, b) => a - b);
}

/**
 * 현재 chat index 기준으로 이전/다음 chat index를 반환
 * @param {number} currentIndex - 현재 chat index
 * @param {'prev' | 'next'} direction - 이동 방향
 * @returns {{ index: number | null, isFirst: boolean, isLast: boolean }}
 */
export async function getAdjacentChatIndex(currentIndex, direction) {
  const indices = await getAllVisibleChatIndices();
  if (indices.length === 0) {
    return { index: null, isFirst: true, isLast: true };
  }

  let currentPos = indices.indexOf(currentIndex);

  // currentIndex가 visible indices에 없는 경우, 가장 가까운 위치 찾기
  if (currentPos === -1) {
    // 현재 인덱스보다 작은 값 중 가장 큰 값의 위치 찾기
    currentPos = indices.findIndex(idx => idx > currentIndex);
    if (currentPos === -1) {
      // 모든 인덱스가 currentIndex보다 작음 -> 맨 마지막 위치로
      currentPos = indices.length;
    }
    // 이 경우 currentPos는 "삽입될 위치"를 나타냄
    // prev면 currentPos - 1, next면 currentPos
    if (direction === 'prev') {
      const prevIndex = currentPos > 0 ? indices[currentPos - 1] : null;
      return {
        index: prevIndex,
        isFirst: prevIndex === null,
        isLast: currentPos >= indices.length,
      };
    } else {
      const nextIndex =
        currentPos < indices.length ? indices[currentPos] : null;
      return {
        index: nextIndex,
        isFirst: currentPos <= 0,
        isLast: nextIndex === null,
      };
    }
  }

  const isFirst = currentPos === 0;
  const isLast = currentPos === indices.length - 1;

  if (direction === 'prev') {
    return {
      index: isFirst ? null : indices[currentPos - 1],
      isFirst,
      isLast,
    };
  } else {
    return {
      index: isLast ? null : indices[currentPos + 1],
      isFirst,
      isLast,
    };
  }
}

/**
 * 현재 chat index의 위치 정보를 반환
 * @param {number} currentIndex - 현재 chat index
 * @returns {{ position: number, total: number, isFirst: boolean, isLast: boolean }}
 */
export async function getChatIndexPosition(currentIndex) {
  const indices = await getAllVisibleChatIndices();
  if (indices.length === 0) {
    return { position: 0, total: 0, isFirst: true, isLast: true };
  }

  const currentPos = indices.indexOf(currentIndex);

  // currentIndex가 visible indices에 없는 경우
  if (currentPos === -1) {
    // 가장 가까운 위치 계산 (어디에 삽입될지)
    const insertPos = indices.findIndex(idx => idx > currentIndex);
    const effectivePos = insertPos === -1 ? indices.length : insertPos;

    return {
      position: 0, // 리스트에 없으므로 0
      total: indices.length,
      isFirst: effectivePos === 0,
      isLast: effectivePos >= indices.length,
    };
  }

  return {
    position: currentPos + 1,
    total: indices.length,
    currentIndex: currentIndex,
    lastIndex: indices[indices.length - 1],
    isFirst: currentPos === 0,
    isLast: currentPos === indices.length - 1,
  };
}
