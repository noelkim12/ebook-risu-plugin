<script>
  /**
   * MobileNavFooter - 모바일용 하단 네비게이션 컴포넌트
   * 이전/다음 버튼, 페이지 표시, 프로그레스 바
   */
  let {
    currentPage = 0,
    totalPages = 0,
    onPrev = () => {},
    onNext = () => {},
    prevDisabled = false,
    nextDisabled = false,
  } = $props();

  // 프로그레스 퍼센트 계산
  let progress = $derived(
    totalPages > 0 ? ((currentPage + 1) / totalPages) * 100 : 0,
  );
</script>

<footer class="reader-footer">
  <button
    class="nav-btn prev-btn"
    onclick={onPrev}
    disabled={prevDisabled}
    title="이전"
  >
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
    >
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
    <span class="btn-label">이전</span>
  </button>

  <div class="page-info">
    <div class="progress-bar">
      <div class="progress-fill" style="width: {progress}%"></div>
    </div>
    <span class="page-indicator">
      {currentPage + 1} / {totalPages}
    </span>
  </div>

  <button
    class="nav-btn next-btn"
    onclick={onNext}
    disabled={nextDisabled}
    title="다음"
  >
    <span class="btn-label">다음</span>
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
    >
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  </button>
</footer>
