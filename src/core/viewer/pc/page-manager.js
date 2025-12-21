/**
 * Page Manager - 페이지 분할 및 콘텐츠 관리
 */

import { TextSplitterPC } from './text-splitter.js';

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

  if (referenceElement) {
    const rect = referenceElement.getBoundingClientRect();
    const styles = window.getComputedStyle(referenceElement);

    container.style.width = rect.width + 'px';
    container.style.height = rect.height + 'px';
    container.style.padding = styles.padding;
    container.style.fontSize = styles.fontSize;
    container.style.lineHeight = styles.lineHeight;
    container.style.fontFamily = styles.fontFamily;
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
    if (element.querySelector('img') || element.tagName === 'IMG') {
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

    const hasOverflow =
      measureContainer.scrollHeight > measureContainer.clientHeight;

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
