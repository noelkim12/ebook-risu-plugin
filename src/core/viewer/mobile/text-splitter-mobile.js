/**
 * TextSplitterMobile - 모바일 환경용 텍스트 분할 유틸리티
 * 모바일은 화면이 작아서 더 적극적인 분할 필요
 */
import { TextSplitterBase } from '../text-splitter-base.js';

export class TextSplitterMobile extends TextSplitterBase {
  /**
   * @param {Object} options - 설정 옵션
   * @param {string[]} options.splittableTags - 분할 가능한 태그 목록 (기본: ['p', 'div'])
   */
  constructor(options = {}) {
    super({
      splittableTags: options.splittableTags || ['p'],
    });
  }

  /**
   * 분할 가능한 태그인지 확인
   * 모바일에서는 더 많은 요소를 분할 허용
   * @override
   */
  isSplittable(element) {
    const tagName = element.tagName?.toLowerCase();

    if (!this.splittableTags.includes(tagName)) {
      return false;
    }

    // 인라인 요소를 포함한 복잡한 구조는 분할하지 않음
    // 단, 모바일에서는 span은 허용 (mark, strong 등만 제외)
    const hasComplexChildren = element.querySelector(
      'mark, strong, em, a, code',
    );
    if (hasComplexChildren) {
      return false;
    }

    return true;
  }

  /**
   * 텍스트를 토큰으로 분할
   * 한글은 문자 단위, 영어/숫자는 단어 단위
   * @override
   */
  _tokenize(text) {
    const tokens = [];
    let currentToken = '';
    let lastCharType = null;

    for (const char of text) {
      const charType = this._getCharType(char);

      if (charType === 'space') {
        if (currentToken) {
          tokens.push(currentToken);
          currentToken = '';
        }
        tokens.push(char);
      } else if (charType === 'korean') {
        // 한글은 글자 단위
        if (currentToken && lastCharType !== 'korean') {
          tokens.push(currentToken);
          currentToken = '';
        }
        if (currentToken) {
          tokens.push(currentToken);
        }
        tokens.push(char);
        currentToken = '';
      } else {
        // 영어/숫자/기타는 연속된 것끼리 묶음
        if (
          lastCharType &&
          lastCharType !== charType &&
          lastCharType !== 'space'
        ) {
          tokens.push(currentToken);
          currentToken = '';
        }
        currentToken += char;
      }

      lastCharType = charType;
    }

    if (currentToken) {
      tokens.push(currentToken);
    }

    return tokens;
  }

  /**
   * 문자 타입 판별
   * @private
   */
  _getCharType(char) {
    if (/\s/.test(char)) return 'space';
    if (/[\u3131-\uD79D]/.test(char)) return 'korean'; // 한글
    if (/[\u3040-\u30FF]/.test(char)) return 'japanese'; // 일본어
    if (/[\u4E00-\u9FFF]/.test(char)) return 'chinese'; // 중국어
    if (/[a-zA-Z]/.test(char)) return 'english';
    if (/[0-9]/.test(char)) return 'number';
    return 'other';
  }

  /**
   * 측정용 컨테이너 생성 헬퍼
   * @param {HTMLElement} referenceElement
   * @returns {HTMLElement}
   */
  static createMeasureContainer(referenceElement) {
    // 뷰어 루트 컨테이너 찾기
    const viewerRoot = referenceElement.closest('.mobile-reader');
    if (!viewerRoot) {
      throw new Error('Mobile viewer root not found');
    }

    // 실제 요소들의 참조 및 크기 가져오기
    const actualPageContainer = viewerRoot.querySelector('.page-container');
    const actualPageContent = viewerRoot.querySelector('.page-content');
    const actualTextContent = viewerRoot.querySelector('.text-content');

    if (!actualPageContainer || !actualPageContent) {
      throw new Error('Required elements not found');
    }

    // 각 요소의 실제 크기 계산
    const pageContainerRect = actualPageContainer.getBoundingClientRect();
    const pageContentRect = actualPageContent.getBoundingClientRect();
    const textContentRect = actualTextContent?.getBoundingClientRect();

    const pageContentStyles = getComputedStyle(actualPageContent);

    // .page-content의 padding 계산
    const paddingTop = parseFloat(pageContentStyles.paddingTop) || 0;
    const paddingBottom = parseFloat(pageContentStyles.paddingBottom) || 0;
    const paddingLeft = parseFloat(pageContentStyles.paddingLeft) || 0;
    const paddingRight = parseFloat(pageContentStyles.paddingRight) || 0;

    // 사용 가능한 영역 계산
    const safetyMargin = 2;
    const availableHeight =
      pageContentRect.height - paddingTop - paddingBottom - safetyMargin;
    const availableWidth = pageContentRect.width - paddingLeft - paddingRight;

    // 실제 뷰어 구조 그대로 생성:
    // .page-container > .page-content > .text-content.chattext
    const pageContainer = document.createElement('div');
    pageContainer.className = 'page-container';
    pageContainer.setAttribute('data-measure-container', 'true');
    pageContainer.style.cssText = `
      position: absolute;
      visibility: hidden;
      pointer-events: none;
      width: ${pageContainerRect.width}px;
      height: ${pageContainerRect.height}px;
    `;

    const pageContentClone = document.createElement('div');
    pageContentClone.className = 'page-content';
    pageContentClone.style.cssText = `
      width: ${pageContentRect.width}px;
      height: ${pageContentRect.height}px;
      padding: ${pageContentStyles.padding};
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
    `;

    const textContent = document.createElement('div');
    textContent.className = 'text-content chattext';
    textContent.style.cssText = `
      width: ${availableWidth}px;
      height: ${availableHeight}px;
      overflow: hidden;
    `;

    pageContentClone.appendChild(textContent);
    pageContainer.appendChild(pageContentClone);
    viewerRoot.appendChild(pageContainer);

    // 반환되는 컨테이너는 실제 콘텐츠가 들어갈 .text-content
    return textContent;
  }
}
