/**
 * TextSplitterPC - PC 환경용 텍스트 분할 유틸리티
 * PC는 화면이 넓어서 분할을 최소화하고, 요소 단위로만 페이지 나눔
 */
class TextSplitterPC {
  /**
   * @param {Object} options - 설정 옵션
   * @param {string[]} options.splittableTags - 분할 가능한 태그 목록 (기본: ['p'])
   * @param {number} options.minHeightRatio - 최소 높이 비율 (이 비율 이상 차면 분할, 기본: 0.85)
   */
  constructor(options = {}) {
    // PC에서는 분할 대상을 매우 제한적으로
    this.splittableTags = options.splittableTags || ['p'];
    // PC에서는 페이지가 85% 이상 찼을 때만 분할 고려
    this.minHeightRatio = options.minHeightRatio || 0.85;
  }

  /**
   * 분할 가능한 태그인지 확인
   * PC에서는 거의 분할하지 않음 - 매우 긴 단락만 분할
   */
  isSplittable(element) {
    const tagName = element.tagName?.toLowerCase();

    // 기본적으로 분할하지 않음, p 태그만 예외적으로 허용
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
   * 요소를 높이에 맞게 분할 (PC용 - 최소 분할)
   * PC에서는 가능하면 요소를 통째로 유지
   */
  splitElement(element, measureContainer, availableHeight) {
    const tagName = element.tagName?.toLowerCase();

    // 분할 불가능한 태그는 그대로 반환
    if (!this.isSplittable(element)) {
      return [element.cloneNode(true)];
    }

    // 요소 높이 측정
    const cloned = element.cloneNode(true);
    measureContainer.innerHTML = '';
    measureContainer.appendChild(cloned);

    const elementHeight = measureContainer.scrollHeight;

    // 요소가 페이지에 들어가면 분할하지 않음
    if (elementHeight <= availableHeight) {
      return [element.cloneNode(true)];
    }

    // 요소가 페이지보다 크면 문장 단위로 분할 시도
    return this._splitBySentence(element, measureContainer, availableHeight);
  }

  /**
   * 문장 단위로 분할 (PC용)
   * 단어 단위가 아닌 문장 단위로 분할하여 가독성 유지
   * @private
   */
  _splitBySentence(element, measureContainer, availableHeight) {
    const tagName = element.tagName.toLowerCase();
    const fullText = element.innerText || element.textContent || '';

    // 문장 단위로 분할 (마침표, 물음표, 느낌표 기준)
    const sentences = this._splitIntoSentences(fullText);

    if (sentences.length <= 1) {
      // 문장이 하나뿐이면 단어 단위로 분할
      return this._splitByWords(element, measureContainer, availableHeight);
    }

    const results = [];
    let currentSentences = [];

    for (const sentence of sentences) {
      // 현재까지의 문장 + 새 문장으로 테스트
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
        // 현재까지의 문장을 페이지로
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

    // 남은 문장 처리
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
    // 한국어/영어 문장 구분자로 분할 (구분자 포함)
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

      // 선형 탐색으로 맞는 단어 수 찾기
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

// 전역 또는 모듈로 내보내기
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TextSplitterPC;
}
