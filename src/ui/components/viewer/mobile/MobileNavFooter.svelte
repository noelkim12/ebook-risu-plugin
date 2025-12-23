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
    totalPages > 0 ? ((currentPage + 1) / totalPages) * 100 : 0
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
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  </button>

  <div class="page-info">
    <span class="page-indicator">
      {currentPage + 1} / {totalPages}
    </span>
    <div class="progress-bar">
      <div class="progress-fill" style="width: {progress}%"></div>
    </div>
  </div>

  <button
    class="nav-btn next-btn"
    onclick={onNext}
    disabled={nextDisabled}
    title="다음"
  >
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  </button>
</footer>

<style>
  .reader-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    background: var(--mv-footer-bg, rgba(253, 251, 247, 0.98));
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-top: 1px solid rgba(201, 166, 107, 0.15);
    gap: 16px;
    flex-shrink: 0;
  }

  .nav-btn {
    background: none;
    border: 2px solid var(--mv-accent-color, #c9a66b);
    color: var(--mv-accent-color, #c9a66b);
    padding: 12px;
    cursor: pointer;
    border-radius: 50%;
    transition: all var(--mv-transition-fast, 0.15s cubic-bezier(0.4, 0, 0.2, 1));
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 50px;
    min-height: 50px;
  }

  .nav-btn svg {
    width: 22px;
    height: 22px;
    transition: transform var(--mv-transition-fast, 0.15s cubic-bezier(0.4, 0, 0.2, 1));
  }

  .nav-btn:active:not(:disabled) {
    background: var(--mv-accent-color, #c9a66b);
    color: white;
    transform: scale(0.95);
  }

  .nav-btn:active:not(:disabled) svg {
    transform: scale(0.9);
  }

  .nav-btn:disabled {
    opacity: 0.25;
    border-color: #ccc;
    color: #999;
    cursor: not-allowed;
  }

  .page-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .page-indicator {
    font-size: 14px;
    font-weight: 600;
    color: var(--mv-text-color, #2c2c2c);
    text-align: center;
    letter-spacing: 0.03em;
  }

  .progress-bar {
    width: 100%;
    height: 5px;
    background: rgba(201, 166, 107, 0.2);
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--mv-accent-color, #c9a66b) 0%, #d4b87a 100%);
    border-radius: 3px;
    transition: width var(--mv-transition-smooth, 0.3s cubic-bezier(0.4, 0, 0.2, 1));
    box-shadow: 0 0 8px rgba(201, 166, 107, 0.5);
  }

  /* Safe Area */
  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    .reader-footer {
      padding-bottom: max(14px, env(safe-area-inset-bottom));
    }
  }
</style>
