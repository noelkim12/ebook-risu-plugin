/**
 * TextSplitterPC - PC 환경용 텍스트 분할 유틸리티
 * PC는 화면이 넓어서 분할을 최소화하고, 요소 단위로만 페이지 나눔
 */
export class TextSplitterPC {
  /**
   * @param {Object} options - 설정 옵션
   * @param {string[]} options.splittableTags - 분할 가능한 태그 목록 (기본: ['p'])
   * @param {number} options.minHeightRatio - 최소 높이 비율 (이 비율 이상 차면 분할, 기본: 0.85)
   */
  constructor(options = {}) {
    this.splittableTags = options.splittableTags || ['p'];
    this.minHeightRatio = options.minHeightRatio || 0.85;
  }

  /**
   * 분할 가능한 태그인지 확인
   * PC에서는 거의 분할하지 않음 - 매우 긴 단락만 분할
   */
  isSplittable(element) {
    const tagName = element.tagName?.toLowerCase();

    if (!this.splittableTags.includes(tagName)) {
      return false;
    }

    // 인라인 요소를 포함한 복잡한 구조는 분할하지 않음
    const hasComplexChildren = element.querySelector('mark, strong, em, a, span[class], code');
    if (hasComplexChildren) {
      return false;
    }

    return true;
  }

  /**
   * 요소를 높이에 맞게 분할 (PC용 - 최소 분할)
   */
  splitElement(element, measureContainer, availableHeight) {
    if (!this.isSplittable(element)) {
      return [element.cloneNode(true)];
    }

    const cloned = element.cloneNode(true);
    measureContainer.innerHTML = '';
    measureContainer.appendChild(cloned);

    const elementHeight = measureContainer.scrollHeight;

    if (elementHeight <= availableHeight) {
      return [element.cloneNode(true)];
    }

    return this._splitBySentence(element, measureContainer, availableHeight);
  }

  /**
   * 문장 단위로 분할 (PC용)
   * @private
   */
  _splitBySentence(element, measureContainer, availableHeight) {
    const tagName = element.tagName.toLowerCase();
    const fullText = element.innerText || element.textContent || '';

    const sentences = this._splitIntoSentences(fullText);

    if (sentences.length <= 1) {
      return this._splitByWords(element, measureContainer, availableHeight);
    }

    const results = [];
    let currentSentences = [];

    for (const sentence of sentences) {
      const testSentences = [...currentSentences, sentence];
      const testText = testSentences.join('');

      const testElement = document.createElement(tagName);
      Array.from(element.attributes).forEach(attr => {
        testElement.setAttribute(attr.name, attr.value);
      });
      testElement.textContent = testText;

      measureContainer.innerHTML = '';
      measureContainer.appendChild(testElement);

      if (measureContainer.scrollHeight <= availableHeight) {
        currentSentences.push(sentence);
      } else {
        if (currentSentences.length > 0) {
          const partElement = document.createElement(tagName);
          Array.from(element.attributes).forEach(attr => {
            partElement.setAttribute(attr.name, attr.value);
          });
          partElement.textContent = currentSentences.join('');
          results.push(partElement);
        }
        currentSentences = [sentence];
      }
    }

    if (currentSentences.length > 0) {
      const partElement = document.createElement(tagName);
      Array.from(element.attributes).forEach(attr => {
        partElement.setAttribute(attr.name, attr.value);
      });
      partElement.textContent = currentSentences.join('');
      results.push(partElement);
    }

    return results.length > 0 ? results : [element.cloneNode(true)];
  }

  /**
   * 문장 단위로 텍스트 분할
   * @private
   */
  _splitIntoSentences(text) {
    const parts = text.split(/(?<=[.!?。！？])\s*/);
    return parts.filter(p => p.length > 0);
  }

  /**
   * 단어 단위로 분할 (문장 분할이 불가능한 경우 폴백)
   * @private
   */
  _splitByWords(element, measureContainer, availableHeight) {
    const tagName = element.tagName.toLowerCase();
    const fullText = element.innerText || element.textContent || '';
    const words = fullText.split(/(\s+)/).filter(p => p.length > 0);

    if (words.length === 0) {
      return [element.cloneNode(true)];
    }

    const results = [];
    let startIndex = 0;

    while (startIndex < words.length) {
      let endIndex = startIndex + 1;
      let lastFit = startIndex + 1;

      while (endIndex <= words.length) {
        const testText = words.slice(startIndex, endIndex).join('');

        const testElement = document.createElement(tagName);
        Array.from(element.attributes).forEach(attr => {
          testElement.setAttribute(attr.name, attr.value);
        });
        testElement.textContent = testText;

        measureContainer.innerHTML = '';
        measureContainer.appendChild(testElement);

        if (measureContainer.scrollHeight <= availableHeight) {
          lastFit = endIndex;
          endIndex++;
        } else {
          break;
        }
      }

      const partElement = document.createElement(tagName);
      Array.from(element.attributes).forEach(attr => {
        partElement.setAttribute(attr.name, attr.value);
      });
      partElement.textContent = words.slice(startIndex, lastFit).join('');
      results.push(partElement);

      startIndex = lastFit;
    }

    return results;
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
