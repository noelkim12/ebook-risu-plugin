/**
 * Page Manager - 페이지 분할 및 콘텐츠 관리
 */

import { TextSplitterPC } from './pc/text-splitter.js';
import { LOCATOR, risuSelector } from '../../utils/selector.js';
import { censored } from './img-encoded.js';
/**
 * 측정용 컨테이너 생성
 * @param {HTMLElement} referenceElement - 실제 페이지 콘텐츠 요소
 * @returns {HTMLElement}
 */
export function createMeasureContainer(referenceElement) {
  const container = document.createElement('div');
  container.className = 'text-content chattext';
  container.style.position = 'absolute';
  container.style.visibility = 'hidden';
  container.style.pointerEvents = 'none';
  container.style.overflow = 'hidden';

  if (referenceElement) {
    const rect = referenceElement.getBoundingClientRect();
    const styles = window.getComputedStyle(referenceElement);

    // 기본 크기 및 패딩
    container.style.width = rect.width + 'px';
    container.style.height = rect.height + 'px';
    container.style.padding = styles.padding;
    container.style.margin = styles.margin;
    container.style.boxSizing = styles.boxSizing;

    // 타이포그래피 (CSS 변수 포함)
    container.style.fontSize = styles.fontSize;
    container.style.lineHeight = styles.lineHeight;
    container.style.fontFamily = styles.fontFamily;
    container.style.fontWeight = styles.fontWeight;
    container.style.fontStyle = styles.fontStyle;
    container.style.letterSpacing = styles.letterSpacing;
    container.style.wordSpacing = styles.wordSpacing;

    // 텍스트 관련
    container.style.textAlign = styles.textAlign;
    container.style.textIndent = styles.textIndent;
    container.style.textTransform = styles.textTransform;
    container.style.whiteSpace = styles.whiteSpace;
    container.style.wordBreak = styles.wordBreak;
    container.style.wordWrap = styles.wordWrap;

    // 뷰어 루트 컨테이너 찾기 (CSS 변수 및 스타일 상속을 위해)
    const viewerRoot =
      referenceElement.closest('.book-viewer-root') ||
      referenceElement.closest('.mobile-reader');

    if (viewerRoot) {
      // 뷰어 루트 안에 추가하여 CSS 선택자(.text-content p 등)가 작동하도록 함
      viewerRoot.appendChild(container);

      // CSS 변수 값들을 직접 가져와서 적용 (이미 상속되지만 명시적으로 설정)
      const rootStyles = window.getComputedStyle(viewerRoot);
      const fontSize =
        rootStyles.getPropertyValue('--bv-font-size') ||
        rootStyles.getPropertyValue('--mv-font-size') ||
        styles.fontSize;
      const lineHeight =
        rootStyles.getPropertyValue('--bv-line-height') ||
        rootStyles.getPropertyValue('--mv-line-height') ||
        styles.lineHeight;
      const fontFamily =
        rootStyles.getPropertyValue('--bv-font-family') ||
        rootStyles.getPropertyValue('--mv-font-family') ||
        styles.fontFamily;

      if (fontSize) container.style.fontSize = fontSize;
      if (lineHeight) container.style.lineHeight = lineHeight;
      if (fontFamily) container.style.fontFamily = fontFamily;
    } else {
      // 뷰어 루트를 찾을 수 없으면 document.body에 추가 (폴백)
      document.body.appendChild(container);
    }
  } else {
    // referenceElement가 없으면 document.body에 추가
    document.body.appendChild(container);
  }

  return container;
}

/**
 * p 태그 없이 노출된 텍스트 노드를 p 태그로 감싸기
 * @param {HTMLElement} container
 */
export function wrapNakedTextNodes(container) {
  const childNodes = Array.from(container.childNodes);
  let currentTextGroup = [];

  const flushTextGroup = () => {
    if (currentTextGroup.length === 0) return;

    const combinedText = currentTextGroup
      .map(node =>
        node.nodeType === Node.TEXT_NODE ? node.textContent : node.outerHTML,
      )
      .join('');

    if (combinedText.trim() === '') {
      currentTextGroup.forEach(node => {
        if (node.parentNode) node.parentNode.removeChild(node);
      });
      currentTextGroup = [];
      return;
    }

    const p = document.createElement('p');
    p.innerHTML = combinedText;

    const firstNode = currentTextGroup[0];
    container.insertBefore(p, firstNode);

    currentTextGroup.forEach(node => {
      if (node.parentNode) node.parentNode.removeChild(node);
    });

    currentTextGroup = [];
  };

  const blockElements = [
    'p',
    'div',
    'ul',
    'ol',
    'li',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'table',
    'blockquote',
    'pre',
    'hr',
    'details',
    'figure',
    'section',
    'article',
    'header',
    'footer',
    'nav',
    'aside',
    'title',
  ];

  childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent.trim() !== '') {
        currentTextGroup.push(node);
      } else if (currentTextGroup.length > 0) {
        currentTextGroup.push(node);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toLowerCase();

      if (blockElements.includes(tagName)) {
        flushTextGroup();
      } else {
        currentTextGroup.push(node);
      }
    }
  });

  flushTextGroup();
}

/**
 * HTML 콘텐츠를 페이지로 분할
 * @param {HTMLElement} content - 분할할 콘텐츠 요소
 * @param {HTMLElement} measureContainer - 측정용 컨테이너
 * @param {TextSplitterPC} textSplitter - 텍스트 분할기
 * @returns {string[]} - 페이지 HTML 배열
 */
export function splitIntoPagesHTML(content, measureContainer, textSplitter) {
  const pages = [];
  const elements = Array.from(content.children);
  const availableHeight = measureContainer.clientHeight;

  let currentPageContent = [];

  const addElementToPage = el => {
    const cloned = el.cloneNode(true);
    measureContainer.appendChild(cloned);

    const hasOverflow =
      measureContainer.scrollHeight > measureContainer.clientHeight;

    if (hasOverflow && currentPageContent.length > 0) {
      pages.push(createPageHTML(currentPageContent));
      currentPageContent = [];
      measureContainer.innerHTML = '';
      measureContainer.appendChild(cloned);
    }

    currentPageContent.push(el);
  };

  elements.forEach(element => {
    const clonedElement = element.cloneNode(true);
    measureContainer.innerHTML = '';
    measureContainer.appendChild(clonedElement);

    // 이미지가 포함된 요소는 별도 페이지로
    if (
      element.querySelector('img') ||
      element.tagName === 'IMG' ||
      (element.tagName === 'DIV' &&
        element.classList.contains('x-risu-image-container')) ||
      element.tagName === 'DETAILS'
    ) {
      if (currentPageContent.length > 0) {
        pages.push(createPageHTML(currentPageContent));
        currentPageContent = [];
      }
      pages.push(createPageHTML([element.cloneNode(true)]));
      measureContainer.innerHTML = '';
      return;
    }

    // 현재 페이지 내용과 함께 측정
    measureContainer.innerHTML = '';
    currentPageContent.forEach(el => {
      measureContainer.appendChild(el.cloneNode(true));
    });
    measureContainer.appendChild(clonedElement);

    const scrollH = measureContainer.scrollHeight;
    const clientH = measureContainer.clientHeight;
    const hasOverflow = scrollH > clientH;

    // 오버플로우 발생하고 분할 가능한 경우
    if (hasOverflow && textSplitter.isSplittable(element)) {
      if (currentPageContent.length > 0) {
        pages.push(createPageHTML(currentPageContent));
        currentPageContent = [];
      }

      measureContainer.innerHTML = '';
      const splitElements = textSplitter.splitElement(
        element,
        measureContainer,
        availableHeight,
      );

      splitElements.forEach(splitEl => {
        addElementToPage(splitEl);
      });

      return;
    }

    // 일반적인 경우
    if (hasOverflow && currentPageContent.length > 0) {
      pages.push(createPageHTML(currentPageContent));
      currentPageContent = [];
      measureContainer.innerHTML = '';
      measureContainer.appendChild(clonedElement);
    }

    currentPageContent.push(element.cloneNode(true));
  });

  // 마지막 페이지
  if (currentPageContent.length > 0) {
    pages.push(createPageHTML(currentPageContent));
  }

  return pages;
}

/**
 * DOM 요소 배열을 HTML 문자열로 변환
 * @param {HTMLElement[]} elements
 * @returns {string}
 */
function createPageHTML(elements) {
  const div = document.createElement('div');
  elements.forEach(el => div.appendChild(el));
  return div.innerHTML;
}

/**
 * 헤더 정보 추출
 * @param {Document} doc - 파싱된 HTML 문서
 * @returns {{ thumbnailUrl: string, name: string, chatIndex: number, buttons: HTMLElement[] }}
 */
export function extractHeaderInfo(doc) {
  const result = {
    thumbnailUrl: '',
    name: '',
    chatIndex: 0,
    buttons: [],
  };

  // 썸네일 추출
  const thumbnailEl = doc.querySelector('.shadow-lg.bg-textcolor2.rounded-md');
  if (thumbnailEl) {
    const style = thumbnailEl.getAttribute('style');
    if (style) {
      const bgMatch = style.match(/background:\s*url\(['"]?([^'")\s]+)['"]?\)/);
      if (bgMatch && bgMatch[1]) {
        result.thumbnailUrl = bgMatch[1];
      }
    }
  }

  // 채팅명 추출
  const chatWidthEl = doc.querySelector('.flexium.items-center.chat-width');
  if (chatWidthEl) {
    const nameEl = chatWidthEl.querySelector('span.chat-width');
    if (nameEl) {
      result.name = nameEl.textContent.trim();
    }
  }

  // 버튼들 추출
  const buttonsContainer = doc.querySelector(
    '.risu-ebooklike-viewer-chat-message-bot-buttons',
  );
  if (buttonsContainer) {
    const buttonSelectors = [
      '.button-icon-copy',
      '.button-icon-tts',
      '.button-icon-edit',
      '.button-icon-translate',
    ];

    buttonSelectors.forEach(selector => {
      const btn = buttonsContainer.querySelector(selector);
      if (btn) {
        result.buttons.push(btn.cloneNode(true));
      }
    });
  }

  // 채팅 인덱스 추출
  const risuChatEl = doc.querySelector('.risu-chat');
  if (risuChatEl) {
    const chatIndex = risuChatEl.getAttribute('data-chat-index');
    if (chatIndex) {
      result.chatIndex = parseInt(chatIndex, 10);
    }
  }

  return result;
}

/**
 * 라이브 DOM에서 헤더 버튼 요소들 추출
 * DOMParser로 파싱된 요소는 이벤트 핸들러가 없으므로,
 * 라이브 DOM에서 직접 버튼 참조를 가져와야 함
 *
 * @param {HTMLElement} liveElement - 라이브 DOM 요소 (getChatElementByChatIndex로 가져온 요소)
 * @returns {HTMLElement[]} 버튼 요소 배열
 */
export function extractLiveButtons(liveElement) {
  if (!liveElement) return [];

  const buttons = [];
  const buttonsContainer = risuSelector(
    LOCATOR.chatMessage.botButtonDiv,
    liveElement,
  );

  if (buttonsContainer) {
    const buttonSelectors = [
      '.button-icon-copy',
      '.button-icon-edit',
      '.button-icon-translate',
      '.button-icon-reroll',
    ];

    buttonSelectors.forEach(selector => {
      const btn = buttonsContainer.querySelector(selector);
      if (btn) {
        buttons.push(btn); // 라이브 DOM 요소 참조 (cloneNode 하지 않음)
      }
    });
  }

  return buttons;
}

/**
 * 라이브 DOM에서 콘텐츠 내부의 버튼 요소들 추출
 * chattext 영역 내의 모든 인터랙티브 버튼 (LB 모듈, risu-btn 등)
 *
 * @param {HTMLElement} liveElement - 라이브 DOM 요소
 * @returns {HTMLElement[]} 버튼 요소 배열
 */
export function extractLiveContentButtons(liveElement) {
  if (!liveElement) return [];

  const chattext = liveElement.querySelector('.chattext');
  if (!chattext) return [];

  // 콘텐츠 내의 모든 인터랙티브 버튼 선택
  const buttonSelector = [
    'button',
    '[role="button"]',
    '.risu-btn',
    '[risu-btn]',
    '.x-risu-lb-opener',
    '.x-risu-lb-nai-btn',
    '.x-risu-lb-nai-opener',
  ].join(', ');

  return Array.from(chattext.querySelectorAll(buttonSelector));
}

/**
 * 라이브 DOM에서 LB 모듈 버튼 요소들을 Map으로 추출
 * dataId 또는 risuBtn을 키로 하여 라이브 버튼 참조를 저장
 *
 * @param {HTMLElement} liveElement - 라이브 DOM 요소
 * @returns {Map<string, HTMLElement>} dataId/risuBtn → 라이브 버튼 요소 맵
 */
export function extractLiveLBModuleButtons(liveElement) {
  const buttonMap = new Map();
  if (!liveElement) return buttonMap;

  const chattext = liveElement.querySelector('.chattext');
  if (!chattext) return buttonMap;

  // x-risu-lb-module-root 내의 opener 버튼 수집
  const moduleRoots = chattext.querySelectorAll('.x-risu-lb-module-root');
  moduleRoots.forEach(module => {
    const dataId = module.getAttribute('data-id');
    if (dataId) {
      // opener 버튼 찾기 (클릭 가능한 요소)
      const opener =
        module.querySelector('.x-risu-lb-opener') ||
        module.querySelector('.x-risu-lb-nai-opener');
      if (opener) {
        buttonMap.set(dataId, opener);
      }
    }
  });

  // 독립적인 x-risu-lb-nai-btn 버튼 수집
  const naiButtons = chattext.querySelectorAll('.x-risu-lb-nai-btn');
  naiButtons.forEach(btn => {
    const isInsideModuleRoot = btn.closest('.x-risu-lb-module-root');
    if (!isInsideModuleRoot) {
      const risuBtn = btn.getAttribute('risu-btn');
      if (risuBtn) {
        buttonMap.set(risuBtn, btn);
      }
    }
  });

  return buttonMap;
}

/**
 * LB 모듈 수집
 * @param {Document} doc - 파싱된 HTML 문서
 * @returns {Array<{ type: string, dataId: string, label: string, element: HTMLElement }>}
 */
export function collectLBModules(doc) {
  const lbModules = [];

  // x-risu-lb-module-root 클래스 요소 수집
  const moduleRoots = doc.querySelectorAll('.x-risu-lb-module-root');
  moduleRoots.forEach(module => {
    const dataId = module.getAttribute('data-id') || '';
    const openerSpan = module.querySelector('.x-risu-lb-opener span');
    const summarySpan = module.querySelector('.x-risu-lb-nai-opener span');
    const label =
      openerSpan?.textContent?.trim() ||
      summarySpan?.textContent?.trim() ||
      dataId ||
      'LB Module';

    lbModules.push({
      type: 'module-root',
      dataId: dataId,
      label: label,
      element: module.cloneNode(true),
    });
  });

  // x-risu-lb-nai-btn 클래스 요소 수집 (독립적인 버튼들)
  const naiButtons = doc.querySelectorAll('.x-risu-lb-nai-btn');
  naiButtons.forEach(btn => {
    const isInsideModuleRoot = btn.closest('.x-risu-lb-module-root');
    if (!isInsideModuleRoot) {
      const risuBtn = btn.getAttribute('risu-btn') || '';
      const label = btn.textContent?.trim() || risuBtn || 'NAI Button';

      lbModules.push({
        type: 'nai-btn',
        dataId: risuBtn,
        label: label,
        element: btn.cloneNode(true),
      });
    }
  });

  return lbModules;
}

/**
 * 레이아웃이 완전히 계산될 때까지 대기
 * @returns {Promise<void>}
 */
export function waitForLayout() {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });
}

/**
 * 이미지 요소에 검열 오버레이 추가
 * @param {HTMLElement} container - 검열 오버레이를 추가할 컨테이너
 * @param {number} minWidth - 최소 너비 (픽셀)
 * @param {number} minHeight - 최소 높이 (픽셀)
 */
export function applyCensoredOverlay(container, minWidth = 0, minHeight = 0) {
  const images = container.querySelectorAll('img, div.x-risu-image-container');

  images.forEach(img => {
    // 이미 처리된 이미지는 스킵
    if (img.closest('.censored-image-container')) {
      return;
    }

    // 최소 크기 체크
    if (minWidth > 0 || minHeight > 0) {
      let width = 0;
      let height = 0;

      if (img.tagName === 'IMG') {
        // img 태그인 경우
        height = img.height || img.naturalHeight || 0;
        width = img.width || img.naturalWidth || 0;
      } else if (img.classList.contains('x-risu-image-container')) {
        // div.x-risu-image-container인 경우
        const rect = img.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
      }

      // 너비와 높이 모두 최소값 이상이어야 검열 적용
      if (width < minWidth && height < minHeight) {
        return;
      }
    }

    // 컨테이너 생성
    const wrapper = document.createElement('div');
    wrapper.className = 'censored-image-container';

    // 오버레이 생성
    const overlay = document.createElement('div');
    overlay.className = 'censored-overlay';
    overlay.style.backgroundImage = `url(${censored})`;

    // 클릭 시 페이드아웃 후 제거
    overlay.addEventListener('click', e => {
      e.stopPropagation();
      overlay.classList.add('vanished');
      setTimeout(() => {
        overlay.remove();
      }, 1000);
    });

    // 이미지를 wrapper로 감싸고 오버레이 추가
    img.parentNode.insertBefore(wrapper, img);
    wrapper.appendChild(img);
    wrapper.appendChild(overlay);
  });
}

/**
 * 컨테이너에서 검열 오버레이 제거
 * @param {HTMLElement} container - 검열 오버레이를 제거할 컨테이너
 */
export function removeCensoredOverlay(container) {
  // 모든 오버레이 제거
  const overlays = container.querySelectorAll('.censored-overlay');
  overlays.forEach(overlay => overlay.remove());

  // wrapper 해제 (이미지 또는 div.x-risu-image-container를 원래 위치로 복원)
  const wrappers = Array.from(
    container.querySelectorAll('.censored-image-container'),
  );
  wrappers.forEach(wrapper => {
    if (!wrapper.parentNode) return;

    // 오버레이 제거 (혹시 남아있을 수 있음)
    const overlay = wrapper.querySelector('.censored-overlay');
    if (overlay) overlay.remove();

    // wrapper 안의 모든 자식 요소를 찾기 (오버레이 제외)
    const children = Array.from(wrapper.children).filter(
      child => !child.classList.contains('censored-overlay'),
    );

    if (children.length > 0) {
      // 첫 번째 자식 요소를 원래 위치로 복원
      // (일반적으로 img 또는 div.x-risu-image-container 하나만 있음)
      const elementToRestore = children[0];
      wrapper.parentNode.insertBefore(elementToRestore, wrapper);

      // 나머지 자식 요소들도 복원 (혹시 여러 개가 있을 경우)
      for (let i = 1; i < children.length; i++) {
        elementToRestore.parentNode.insertBefore(
          children[i],
          elementToRestore.nextSibling,
        );
      }
    }

    // wrapper 제거
    wrapper.remove();
  });
}
