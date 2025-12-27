/**
 * TextSplitterBase - 텍스트 분할 유틸리티 기반 클래스
 * PC/Mobile 공통 로직을 제공하며, 환경별 특화는 서브클래스에서 구현
 */
export class TextSplitterBase {
  /**
   * @param {Object} options - 설정 옵션
   * @param {string[]} options.splittableTags - 분할 가능한 태그 목록
   */
  constructor(options = {}) {
    this.splittableTags = options.splittableTags || ['p'];
  }

  /**
   * 마지막 요소의 실제 하단 위치를 기준으로 콘텐츠 높이 계산
   * margin-bottom은 시각적으로 필요 없으므로 제외
   * @protected
   * @param {HTMLElement} container - 측정 컨테이너
   * @returns {number} - 실제 콘텐츠 높이
   */
  _getContentHeight(container) {
    const lastChild = container.lastElementChild;
    if (!lastChild) {
      return container.scrollHeight;
    }

    // 마지막 요소의 margin-bottom을 가져와서 제외
    const styles = window.getComputedStyle(lastChild);
    const marginBottom = parseFloat(styles.marginBottom) || 0;

    return container.scrollHeight - marginBottom;
  }

  /**
   * 분할 가능한 태그인지 확인 (서브클래스에서 오버라이드)
   * @param {HTMLElement} element
   * @returns {boolean}
   */
  isSplittable(element) {
    const tagName = element.tagName?.toLowerCase();

    if (!this.splittableTags.includes(tagName)) {
      return false;
    }

    // 기본: 인라인 요소를 포함한 복잡한 구조는 분할하지 않음
    const hasComplexChildren = element.querySelector(
      'mark, strong, em, a, span[class], code',
    );
    if (hasComplexChildren) {
      return false;
    }

    return true;
  }

  /**
   * 요소를 높이에 맞게 분할
   * @param {HTMLElement} element - 분할할 요소
   * @param {HTMLElement} measureContainer - 측정용 컨테이너
   * @param {number} availableHeight - 사용 가능한 높이
   * @returns {HTMLElement[]} 분할된 요소 배열
   */
  splitElement(element, measureContainer, availableHeight) {
    if (!this.isSplittable(element)) {
      return [element.cloneNode(true)];
    }

    const cloned = element.cloneNode(true);
    measureContainer.innerHTML = '';
    measureContainer.appendChild(cloned);

    // 마지막 요소의 margin-bottom을 제외하고 측정
    const elementHeight = this._getContentHeight(measureContainer);

    if (elementHeight <= availableHeight) {
      return [element.cloneNode(true)];
    }

    return this._splitBySentence(element, measureContainer, availableHeight);
  }

  /**
   * 문장 단위로 분할
   * @protected
   */
  _splitBySentence(element, measureContainer, availableHeight) {
    const tagName = element.tagName.toLowerCase();
    const fullText = this._getElementText(element);
    const sentences = this._splitIntoSentences(fullText);

    if (sentences.length <= 1) {
      return this._splitByWords(element, measureContainer, availableHeight);
    }

    const results = [];
    let currentSentences = [];

    for (const sentence of sentences) {
      const testSentences = [...currentSentences, sentence];
      const testText = testSentences.join('');

      const testElement = this._createPartElement(element, tagName, testText);
      measureContainer.innerHTML = '';
      measureContainer.appendChild(testElement);

      // 마지막 요소의 margin-bottom을 제외하고 측정
      if (this._getContentHeight(measureContainer) <= availableHeight) {
        currentSentences.push(sentence);
      } else {
        if (currentSentences.length > 0) {
          const partElement = this._createPartElement(
            element,
            tagName,
            currentSentences.join(''),
          );
          results.push(partElement);
        }
        currentSentences = [sentence];
      }
    }

    if (currentSentences.length > 0) {
      const partElement = this._createPartElement(
        element,
        tagName,
        currentSentences.join(''),
      );
      results.push(partElement);
    }

    return results.length > 0 ? results : [element.cloneNode(true)];
  }

  /**
   * 문장 단위로 텍스트 분할
   * 한글, 영어, 일본어, 중국어 문장 구분자 지원
   * @protected
   */
  _splitIntoSentences(text) {
    const parts = text.split(/(?<=[.!?。！？])\s*/);
    return parts.filter(p => p.length > 0);
  }

  /**
   * 단어/토큰 단위로 분할 (이진 탐색 적용)
   * @protected
   */
  _splitByWords(element, measureContainer, availableHeight) {
    const tagName = element.tagName.toLowerCase();
    const fullText = this._getElementText(element);
    const tokens = this._tokenize(fullText);

    if (tokens.length === 0) {
      return [element.cloneNode(true)];
    }

    const results = [];
    let startIndex = 0;
    const maxIterations = tokens.length * 2; // 무한루프 방지
    let iterations = 0;

    while (startIndex < tokens.length && iterations < maxIterations) {
      iterations++;

      // 이진 탐색으로 최적의 분할점 찾기
      const bestFit = this._findBestFitBinary(
        tokens,
        startIndex,
        tagName,
        element,
        measureContainer,
        availableHeight,
      );

      // 최소 1개 토큰은 포함 (무한루프 방지)
      const endIndex = Math.max(bestFit, startIndex + 1);

      const partText = tokens.slice(startIndex, endIndex).join('');
      const partElement = this._createPartElement(element, tagName, partText);
      results.push(partElement);

      startIndex = endIndex;
    }

    return results.length > 0 ? results : [element.cloneNode(true)];
  }

  /**
   * 이진 탐색으로 최적의 분할점 찾기
   * @private
   */
  _findBestFitBinary(
    tokens,
    startIndex,
    tagName,
    element,
    measureContainer,
    availableHeight,
  ) {
    let low = startIndex + 1;
    let high = tokens.length;
    let bestFit = startIndex + 1; // 최소 1개는 포함

    // 먼저 1개도 안 맞는지 확인
    const singleToken = tokens.slice(startIndex, startIndex + 1).join('');
    const singleElement = this._createPartElement(
      element,
      tagName,
      singleToken,
    );
    measureContainer.innerHTML = '';
    measureContainer.appendChild(singleElement);

    // 마지막 요소의 margin-bottom을 제외하고 측정
    if (this._getContentHeight(measureContainer) > availableHeight) {
      // 1개도 안 맞으면 강제로 1개 반환
      return startIndex + 1;
    }

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const testText = tokens.slice(startIndex, mid).join('');
      const testElement = this._createPartElement(element, tagName, testText);

      measureContainer.innerHTML = '';
      measureContainer.appendChild(testElement);

      // 마지막 요소의 margin-bottom을 제외하고 측정
      if (this._getContentHeight(measureContainer) <= availableHeight) {
        bestFit = mid;
        low = mid + 1; // 더 많이 넣어보기
      } else {
        high = mid - 1; // 줄이기
      }
    }

    return bestFit;
  }

  /**
   * 텍스트를 토큰으로 분할 (서브클래스에서 오버라이드 가능)
   * 기본: 공백 기준 분할
   * @protected
   */
  _tokenize(text) {
    return text.split(/(\s+)/).filter(p => p.length > 0);
  }

  /**
   * 요소의 텍스트 추출
   * @protected
   */
  _getElementText(element) {
    return element.innerText || element.textContent || '';
  }

  /**
   * 분할된 부분 요소 생성 (중복 코드 제거)
   * @protected
   */
  _createPartElement(originalElement, tagName, textContent) {
    const partElement = document.createElement(tagName);
    const attributes = originalElement.attributes;

    for (let i = 0; i < attributes.length; i++) {
      const attr = attributes[i];
      partElement.setAttribute(attr.name, attr.value);
    }

    partElement.textContent = textContent;
    return partElement;
  }

  /**
   * 측정용 컨테이너 생성 (서브클래스에서 구현)
   * @param {HTMLElement} referenceElement
   * @returns {HTMLElement}
   */
  static createMeasureContainer(referenceElement) {
    throw new Error('createMeasureContainer must be implemented by subclass');
  }
}
