/**
 * TextSplitterPC - PC 환경용 텍스트 분할 유틸리티
 * PC는 화면이 넓어서 분할을 최소화하고, 요소 단위로만 페이지 나눔
 */
import { TextSplitterBase } from '../text-splitter-base.js';

export class TextSplitterPC extends TextSplitterBase {
  /**
   * @param {Object} options - 설정 옵션
   * @param {string[]} options.splittableTags - 분할 가능한 태그 목록 (기본: ['p'])
   */
  constructor(options = {}) {
    super({
      splittableTags: options.splittableTags || ['p'],
    });
  }

  /**
   * 분할 가능한 태그인지 확인
   * PC에서는 거의 분할하지 않음 - 매우 긴 단락만 분할
   * @override
   */
  isSplittable(element) {
    const tagName = element.tagName?.toLowerCase();

    if (!this.splittableTags.includes(tagName)) {
      return false;
    }

    // 인라인 요소를 포함한 복잡한 구조는 분할하지 않음
    // PC에서는 span[class]도 포함하여 더 엄격하게 체크
    const hasComplexChildren = element.querySelector(
      'mark, strong, em, a, span[class], code',
    );
    if (hasComplexChildren) {
      return false;
    }

    return true;
  }

  /**
   * 측정용 컨테이너 생성 헬퍼
   * @param {HTMLElement} referenceElement
   * @returns {HTMLElement}
   */
  static createMeasureContainer(referenceElement) {
    // 최상위 컨테이너 찾기 (.risu-ebooklike-viewer-chat-message-root)
    const chatMessageRoot = referenceElement.closest(
      '.risu-ebooklike-viewer-chat-message-root',
    );
    if (!chatMessageRoot) {
      throw new Error('PC chat message root not found');
    }

    // 뷰어 루트 컨테이너 찾기
    const viewerRoot = chatMessageRoot.querySelector('.book-viewer-root');
    if (!viewerRoot) {
      throw new Error('PC viewer root not found');
    }

    // 실제 요소들의 참조 및 크기 가져오기
    const actualBookPages = viewerRoot.querySelector('.book-pages');
    const actualPage = viewerRoot.querySelector('.page');
    const actualPageContent = viewerRoot.querySelector('.page .page-content');
    const actualTextContent = viewerRoot.querySelector(
      '.page .page-content .text-content',
    );

    if (
      !actualBookPages ||
      !actualPage ||
      !actualPageContent ||
      !actualTextContent
    ) {
      throw new Error('Required elements not found');
    }

    // 각 요소의 실제 크기 계산 (브라우저가 flex 레이아웃 계산한 결과 사용)
    const chatMessageRootRect = chatMessageRoot.getBoundingClientRect();
    const viewerRootRect = viewerRoot.getBoundingClientRect();
    const bookPagesRect = actualBookPages.getBoundingClientRect();
    const pageRect = actualPage.getBoundingClientRect();
    const pageContentRect = actualPageContent.getBoundingClientRect();
    const textContentRect = actualTextContent.getBoundingClientRect();

    const pageContentStyles = getComputedStyle(actualPageContent);

    // 사용 가능한 영역 계산 - 실제 .text-content 크기 직접 사용
    const safetyMargin = 10;
    const availableHeight = textContentRect.height - safetyMargin;
    const availableWidth = textContentRect.width;

    // 전체 구조 생성 (CSS cascading을 위해 상위 컨테이너 포함):
    // .risu-ebooklike-viewer-chat-message-root > .book-viewer-root > .book-pages > .page > .page-content > .text-content

    // 최상위 wrapper (측정용 마커)
    const measureWrapper = document.createElement('div');
    measureWrapper.className = chatMessageRoot.className;
    measureWrapper.setAttribute('data-measure-container', 'true');
    measureWrapper.style.cssText = `
      position: absolute;
      visibility: hidden;
      pointer-events: none;
      width: ${chatMessageRootRect.width}px;
      height: ${chatMessageRootRect.height}px;
    `;

    // .book-viewer-root 복제 (클래스, data-theme, CSS 변수 포함)
    const viewerRootClone = document.createElement('div');
    viewerRootClone.className = viewerRoot.className;
    // data-theme 복사
    const theme = viewerRoot.getAttribute('data-theme');
    if (theme) {
      viewerRootClone.setAttribute('data-theme', theme);
    }
    // CSS 변수 복사
    viewerRootClone.style.cssText = `
      width: ${viewerRootRect.width}px;
      height: ${viewerRootRect.height}px; 
      ${viewerRoot.style.cssText}
    `;

    const bookPages = document.createElement('div');
    bookPages.className = 'book-pages';
    bookPages.style.cssText = `
      width: ${bookPagesRect.width}px;
      height: ${bookPagesRect.height}px;
      display: flex;
    `;

    const page = document.createElement('div');
    page.className = 'page page-left';
    page.style.cssText = `
      width: ${pageRect.width}px;
      height: ${pageRect.height}px;
      overflow: hidden;
    `;

    // 디버깅: 실제 요소와 비교를 위한 스타일 정보
    const actualTextContentStyles = getComputedStyle(actualTextContent);

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

    // 구조 조립
    pageContentClone.appendChild(textContent);
    page.appendChild(pageContentClone);
    bookPages.appendChild(page);
    viewerRootClone.appendChild(bookPages);
    measureWrapper.appendChild(viewerRootClone);

    // chatMessageRoot의 부모에 추가 (같은 레벨에서 CSS 상속)
    chatMessageRoot.parentNode.appendChild(measureWrapper);

    // 디버깅: 측정 컨테이너 스타일 확인
    const measureTextContentStyles = getComputedStyle(textContent);

    // 반환되는 컨테이너는 실제 콘텐츠가 들어갈 .text-content
    return textContent;
  }
}
