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

<style>
  .reader-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: var(--mv-footer-bg, rgba(253, 251, 247, 0.98));
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-top: 1px solid rgba(201, 166, 107, 0.12);
    gap: 12px;
    flex-shrink: 0;
  }

  .nav-btn {
    background: rgba(201, 166, 107, 0.08);
    border: 1px solid rgba(201, 166, 107, 0.25);
    color: var(--mv-accent-color, #c9a66b);
    padding: 6px 14px;
    cursor: pointer;
    border-radius: 20px;
    transition: all var(--mv-transition-fast, 0.15s cubic-bezier(0.4, 0, 0.2, 1));
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-height: 32px;
    font-size: 12px;
    font-weight: 600;
  }

  .nav-btn svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    transition: transform var(--mv-transition-fast, 0.15s cubic-bezier(0.4, 0, 0.2, 1));
  }

  .btn-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  .nav-btn:active:not(:disabled) {
    background: var(--mv-accent-color, #c9a66b);
    border-color: var(--mv-accent-color, #c9a66b);
    color: white;
    transform: scale(0.97);
  }

  .nav-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .page-info {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .page-indicator {
    font-size: 11px;
    font-weight: 600;
    color: var(--mv-text-secondary, #6b6b6b);
    white-space: nowrap;
    letter-spacing: 0.02em;
  }

  .progress-bar {
    flex: 1;
    height: 3px;
    background: rgba(201, 166, 107, 0.15);
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--mv-accent-color, #c9a66b) 0%, #d4b87a 100%);
    border-radius: 2px;
    transition: width var(--mv-transition-smooth, 0.3s cubic-bezier(0.4, 0, 0.2, 1));
  }

  /* Safe Area */
  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    .reader-footer {
      padding-bottom: max(8px, env(safe-area-inset-bottom));
    }
  }
</style>
