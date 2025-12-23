/**
 * TextSplitterMobile - 모바일 환경용 텍스트 분할 유틸리티
 * 모바일은 화면이 작아서 세밀한 분할 필요, HTML 태그 구조 보존
 */
class TextSplitterMobile {
  /**
   * @param {Object} options - 설정 옵션
   * @param {string[]} options.splittableTags - 분할 가능한 태그 목록 (기본: ['p'])
   */
  constructor(options = {}) {
    // 모바일에서는 더 많은 태그 분할 허용
    this.splittableTags = options.splittableTags || ['p', 'div'];
  }

  /**
   * 분할 가능한 태그인지 확인
   */
  isSplittable(element) {
    const tagName = element.tagName?.toLowerCase();
    return this.splittableTags.includes(tagName);
  }

  /**
   * 분할 가능한 태그 추가
   */
  addSplittableTags(tags) {
    const tagsArray = Array.isArray(tags) ? tags : [tags];
    tagsArray.forEach(tag => {
      const normalizedTag = tag.toLowerCase();
      if (!this.splittableTags.includes(normalizedTag)) {
        this.splittableTags.push(normalizedTag);
      }
    });
  }

  /**
   * 요소를 높이에 맞게 분할 (DOM 기반)
   */
  splitElement(element, measureContainer, availableHeight) {
    const tagName = element.tagName?.toLowerCase();

    // 분할 불가능한 태그는 그대로 반환
    if (!this.isSplittable(element)) {
      return [element.cloneNode(true)];
    }

    // innerText를 단어 단위로 분할
    const fullText = element.innerText || element.textContent || '';
    const words = this._splitIntoWords(fullText);

    if (words.length === 0) {
      return [element.cloneNode(true)];
    }

    const results = [];
    let startWordIndex = 0;

    while (startWordIndex < words.length) {
      // 이진 탐색으로 맞는 단어 수 찾기
      const bestFit = this._binarySearchWordFit(
        words,
        startWordIndex,
        element,
        measureContainer,
        availableHeight
      );

      // 최소 1개는 포함해야 함 (무한 루프 방지)
      const endWordIndex = Math.max(bestFit, startWordIndex + 1);

      // 분할된 요소 생성 (원본 HTML 구조에서 해당 텍스트 범위 추출)
      const partElement = this._createPartElementFromText(
        element,
        fullText,
        words,
        startWordIndex,
        endWordIndex
      );

      results.push(partElement);
      startWordIndex = endWordIndex;
    }

    return results;
  }

  /**
   * 텍스트를 단어 단위로 분할 (공백 포함)
   * @private
   */
  _splitIntoWords(text) {
    // 공백을 포함하여 분할 (공백도 별도 요소로)
    const parts = text.split(/(\s+)/);
    return parts.filter(p => p.length > 0);
  }

  /**
   * 이진 탐색으로 최적 단어 수 찾기
   * @private
   */
  _binarySearchWordFit(words, startIndex, originalElement, measureContainer, availableHeight) {
    let low = startIndex + 1;
    let high = words.length;
    let bestFit = startIndex + 1;

    const tagName = originalElement.tagName.toLowerCase();

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const testText = words.slice(startIndex, mid).join('');

      // 테스트 요소 생성
      const testElement = document.createElement(tagName);
      // 속성 복사
      Array.from(originalElement.attributes).forEach(attr => {
        testElement.setAttribute(attr.name, attr.value);
      });
      testElement.textContent = testText;

      measureContainer.innerHTML = '';
      measureContainer.appendChild(testElement);

      // 마진 포함 높이 계산
      const style = getComputedStyle(testElement);
      const marginTop = parseFloat(style.marginTop) || 0;
      const marginBottom = parseFloat(style.marginBottom) || 0;
      const totalHeight = measureContainer.scrollHeight + marginTop + marginBottom;

      const fits = totalHeight <= availableHeight;

      if (fits) {
        bestFit = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    return bestFit;
  }

  /**
   * 원본 HTML 구조를 유지하면서 분할된 요소 생성
   * @private
   */
  _createPartElementFromText(originalElement, fullText, words, startWordIndex, endWordIndex) {
    const tagName = originalElement.tagName.toLowerCase();
    const partElement = document.createElement(tagName);

    // 속성 복사
    Array.from(originalElement.attributes).forEach(attr => {
      partElement.setAttribute(attr.name, attr.value);
    });

    // 시작/끝 텍스트 위치 계산
    const startCharIndex = words.slice(0, startWordIndex).join('').length;
    const endCharIndex = words.slice(0, endWordIndex).join('').length;

    // 원본 HTML에서 해당 텍스트 범위에 해당하는 부분 추출
    const partHtml = this._extractHtmlRange(
      originalElement,
      startCharIndex,
      endCharIndex
    );

    partElement.innerHTML = partHtml;

    return partElement;
  }

  /**
   * 원본 요소에서 텍스트 범위에 해당하는 HTML 추출
   * @private
   */
  _extractHtmlRange(element, startChar, endChar) {
    const clonedElement = element.cloneNode(true);
    const textNodes = this._getTextNodes(clonedElement);

    let currentPos = 0;
    let startNode = null;
    let startOffset = 0;
    let endNode = null;
    let endOffset = 0;

    // 시작점과 끝점 찾기
    for (const node of textNodes) {
      const nodeLength = node.textContent.length;
      const nodeEnd = currentPos + nodeLength;

      // 시작점 찾기
      if (startNode === null && startChar < nodeEnd) {
        startNode = node;
        startOffset = startChar - currentPos;
      }

      // 끝점 찾기
      if (endChar <= nodeEnd) {
        endNode = node;
        endOffset = endChar - currentPos;
        break;
      }

      currentPos = nodeEnd;
    }

    // 범위 외 텍스트 제거
    if (startNode && endNode) {
      this._trimTextNodes(clonedElement, textNodes, startNode, startOffset, endNode, endOffset);
    }

    return clonedElement.innerHTML;
  }

  /**
   * 모든 텍스트 노드 가져오기
   * @private
   */
  _getTextNodes(element) {
    const textNodes = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }

    return textNodes;
  }

  /**
   * 범위 외 텍스트 잘라내기
   * @private
   */
  _trimTextNodes(root, textNodes, startNode, startOffset, endNode, endOffset) {
    let inRange = false;

    for (const node of textNodes) {
      if (node === startNode) {
        // 시작 노드: 앞부분 제거
        node.textContent = node.textContent.substring(startOffset);
        inRange = true;

        if (node === endNode) {
          // 시작과 끝이 같은 노드
          const adjustedEndOffset = endOffset - startOffset;
          node.textContent = node.textContent.substring(0, adjustedEndOffset);
          inRange = false;
        }
      } else if (node === endNode) {
        // 끝 노드: 뒷부분 제거
        node.textContent = node.textContent.substring(0, endOffset);
        inRange = false;
      } else if (!inRange) {
        // 범위 밖: 노드 제거
        node.textContent = '';
      }
    }

    // 빈 요소 정리
    this._removeEmptyNodes(root);
  }

  /**
   * 빈 노드 제거
   * @private
   */
  _removeEmptyNodes(element) {
    const emptyNodes = [];

    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_ELEMENT,
      null,
      false
    );

    let node;
    while ((node = walker.nextNode())) {
      if (node.textContent.trim() === '' && node.children.length === 0) {
        emptyNodes.push(node);
      }
    }

    emptyNodes.forEach(node => {
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
    });
  }

  /**
   * 측정용 컨테이너 생성 헬퍼
   */
  static createMeasureContainer(referenceElement) {
    const container = document.createElement('div');
    const styles = getComputedStyle(referenceElement);

    container.style.cssText = `
      position: absolute;
      visibility: hidden;
      pointer-events: none;
      width: ${referenceElement.clientWidth}px;
      padding: ${styles.padding};
      font-size: ${styles.fontSize};
      line-height: ${styles.lineHeight};
      font-family: ${styles.fontFamily};
      overflow: hidden;
    `;

    return container;
  }
}

// 전역 또는 모듈로 내보내기
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TextSplitterMobile;
}
