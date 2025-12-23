/**
 * touch-handler.js - 모바일 터치/스와이프 핸들러
 * 스와이프 감지, 탭 영역 처리
 */

/**
 * 스와이프 핸들러 생성
 * @param {Object} options
 * @param {Function} options.onSwipeLeft - 왼쪽 스와이프 콜백 (다음 페이지)
 * @param {Function} options.onSwipeRight - 오른쪽 스와이프 콜백 (이전 페이지)
 * @param {number} options.threshold - 스와이프 임계값 (기본: 50px)
 * @param {number} options.velocityThreshold - 속도 기반 스와이프 임계값 (기본: 0.3)
 * @param {number} options.maxVerticalRatio - 최대 수직 이동 비율 (기본: 0.75)
 * @returns {Object} 터치 이벤트 핸들러들
 */
export function createSwipeHandler(options = {}) {
  const {
    onSwipeLeft = () => {},
    onSwipeRight = () => {},
    threshold = 50,
    velocityThreshold = 0.3,
    maxVerticalRatio = 0.75,
  } = options;

  let startX = 0;
  let startY = 0;
  let startTime = 0;
  let isSwiping = false;

  function touchStart(e) {
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    startTime = Date.now();
    isSwiping = true;
  }

  function touchMove(e) {
    if (!isSwiping || e.touches.length !== 1) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    // 수평 스와이프가 수직보다 큰 경우에만 스크롤 방지
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      // 스와이프 중에는 스크롤 방지하지 않음 (touch-action으로 처리)
    }
  }

  function touchEnd(e) {
    if (!isSwiping) return;
    isSwiping = false;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    const duration = Date.now() - startTime;

    // 수직 이동이 수평 이동보다 크면 스와이프 무시
    if (Math.abs(deltaY) > Math.abs(deltaX) * maxVerticalRatio) {
      return;
    }

    // 속도 계산 (px/ms)
    const velocity = Math.abs(deltaX) / duration;

    // 스와이프 감지: 임계값 초과 또는 빠른 스와이프
    const isSwipe =
      Math.abs(deltaX) > threshold ||
      (velocity > velocityThreshold && Math.abs(deltaX) > 30);

    if (isSwipe) {
      if (deltaX > 0) {
        onSwipeRight();
      } else {
        onSwipeLeft();
      }
    }
  }

  function touchCancel() {
    isSwiping = false;
  }

  return {
    touchStart,
    touchMove,
    touchEnd,
    touchCancel,
  };
}

/**
 * 탭 핸들러 생성 (터치 영역용)
 * @param {Object} options
 * @param {Function} options.onTapLeft - 왼쪽 영역 탭 콜백
 * @param {Function} options.onTapRight - 오른쪽 영역 탭 콜백
 * @param {number} options.tapThreshold - 탭으로 인정하는 최대 이동 거리 (기본: 10px)
 * @param {number} options.tapDuration - 탭으로 인정하는 최대 시간 (기본: 300ms)
 * @returns {Object} 터치 이벤트 핸들러들
 */
export function createTapHandler(options = {}) {
  const {
    onTapLeft = () => {},
    onTapRight = () => {},
    tapThreshold = 10,
    tapDuration = 300,
  } = options;

  let startX = 0;
  let startY = 0;
  let startTime = 0;

  function handleTouchStart(e) {
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    startTime = Date.now();
  }

  function handleTouchEnd(e, containerWidth) {
    const touch = e.changedTouches[0];
    const deltaX = Math.abs(touch.clientX - startX);
    const deltaY = Math.abs(touch.clientY - startY);
    const duration = Date.now() - startTime;

    // 탭 조건: 작은 이동, 짧은 시간
    if (deltaX < tapThreshold && deltaY < tapThreshold && duration < tapDuration) {
      const tapX = touch.clientX;
      const leftBoundary = containerWidth * 0.28;
      const rightBoundary = containerWidth * 0.72;

      if (tapX < leftBoundary) {
        onTapLeft();
      } else if (tapX > rightBoundary) {
        onTapRight();
      }
      // 중앙 영역 탭은 무시 (메뉴 토글 등에 사용 가능)
    }
  }

  return {
    handleTouchStart,
    handleTouchEnd,
  };
}

/**
 * 터치 영역 컴포넌트용 핸들러
 * @param {HTMLElement} element - 터치 영역 요소
 * @param {Object} options
 * @param {Function} options.onClick - 클릭/탭 콜백
 * @param {number} options.tapThreshold - 탭 임계값 (기본: 10px)
 */
export function setupTouchArea(element, options = {}) {
  const { onClick = () => {}, tapThreshold = 10 } = options;

  let startX = 0;
  let startY = 0;

  function handleTouchStart(e) {
    if (e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }

  function handleTouchEnd(e) {
    const touch = e.changedTouches[0];
    const deltaX = Math.abs(touch.clientX - startX);
    const deltaY = Math.abs(touch.clientY - startY);

    if (deltaX < tapThreshold && deltaY < tapThreshold) {
      onClick();
    }
  }

  element.addEventListener('touchstart', handleTouchStart, { passive: true });
  element.addEventListener('touchend', handleTouchEnd, { passive: true });

  // cleanup 함수 반환
  return () => {
    element.removeEventListener('touchstart', handleTouchStart);
    element.removeEventListener('touchend', handleTouchEnd);
  };
}

/**
 * 스와이프 방지 (특정 요소에서 스와이프 비활성화)
 * @param {HTMLElement} element
 */
export function preventSwipe(element) {
  element.style.touchAction = 'pan-y';
}

/**
 * 스와이프 허용 (기본 상태로 복원)
 * @param {HTMLElement} element
 */
export function allowSwipe(element) {
  element.style.touchAction = '';
}
