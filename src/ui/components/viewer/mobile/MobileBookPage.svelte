<script>
  /**
   * MobileBookPage - 모바일용 단일 페이지 컴포넌트
   * 터치 영역, 스와이프 지원
   */
  import { onMount, onDestroy } from 'svelte';
  import LoadingOverlay from '../LoadingOverlay.svelte';
  import { delegateButtonEvents } from '../../../../utils/dom-helper.js';

  let {
    content = '',
    pageNum = 0,
    totalPages = 0,
    onPrevPage = () => {},
    onNextPage = () => {},
    isLoading = false,
    loadingMessage = '',
    liveContentButtons = [],
  } = $props();

  let contentRef = $state(null);

  // 콘텐츠가 변경될 때 이벤트 위임 설정
  $effect(() => {
    if (contentRef && content && liveContentButtons.length > 0) {
      // innerHTML이 설정된 후 이벤트 위임
      requestAnimationFrame(() => {
        delegateButtonEvents(contentRef, liveContentButtons);
      });
    }
  });

  // 터치 영역 클릭 핸들러
  function handleTouchLeftClick() {
    onPrevPage();
  }

  function handleTouchRightClick() {
    onNextPage();
  }
</script>

<div class="page-container">
  <div class="page-content">
    <div
      class="text-content chattext"
      bind:this={contentRef}
    >
      {@html content}
    </div>

    {#if pageNum > 0}
      <span class="page-number">{pageNum}</span>
    {/if}
  </div>

  <!-- 터치 영역 -->
  <button
    class="touch-area touch-left"
    onclick={handleTouchLeftClick}
    aria-label="이전 페이지"
  ></button>
  <button
    class="touch-area touch-right"
    onclick={handleTouchRightClick}
    aria-label="다음 페이지"
  ></button>

  <LoadingOverlay visible={isLoading} message={loadingMessage} />
</div>

<style>
  .page-container {
    flex: 1;
    overflow: hidden;
    position: relative;
    background: var(--mv-page-color, #fdfbf7);
    margin: 10px;
    border-radius: 12px;
    box-shadow: var(--mv-shadow-medium, 0 4px 24px rgba(0, 0, 0, 0.12)),
                var(--mv-shadow-glow, 0 0 20px rgba(201, 166, 107, 0.15));
    touch-action: pan-y;
  }

  /* 종이 질감 효과 */
  .page-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.02'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 1;
    border-radius: 12px;
  }

  .page-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 28px 24px;
    overflow: hidden;
    position: relative;
    z-index: 2;
  }

  .text-content {
    flex: 1;
    font-size: var(--mv-font-size, 17px);
    line-height: var(--mv-line-height, 1.85);
    font-family: var(--mv-font-family, 'Pretendard', sans-serif);
    color: var(--mv-text-color, #2c2c2c);
    word-break: keep-all;
    letter-spacing: -0.01em;
    overflow: hidden;
  }

  /* 텍스트 포맷팅 */
  .text-content :global(p) {
    margin-bottom: 1.3em;
  }

  .text-content :global(p:first-child) {
    text-indent: 0;
  }

  .text-content :global(h1),
  .text-content :global(h2),
  .text-content :global(h3) {
    margin: 1.8em 0 0.8em;
    text-indent: 0;
    font-weight: 600;
    color: #1a1a1a;
    letter-spacing: -0.02em;
  }

  .text-content :global(h1) {
    font-size: 1.6em;
    border-bottom: 2px solid var(--mv-accent-color, #c9a66b);
    padding-bottom: 0.4em;
  }

  .text-content :global(mark) {
    background: linear-gradient(
      120deg,
      rgba(201, 166, 107, 0.2) 0%,
      rgba(201, 166, 107, 0.3) 100%
    );
    color: inherit;
    padding: 0.1em 0.2em;
    border-radius: 3px;
  }

  .text-content :global(img) {
    max-width: 100%;
    height: auto;
    margin: 1.2em 0;
    border-radius: 8px;
    box-shadow: var(--mv-shadow-soft, 0 2px 12px rgba(0, 0, 0, 0.08));
  }

  /* 페이지 번호 */
  .page-number {
    position: absolute;
    bottom: 12px;
    right: 16px;
    font-size: 11px;
    color: var(--mv-text-secondary, #6b6b6b);
    opacity: 0.6;
    z-index: 3;
  }

  /* 터치 영역 */
  .touch-area {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 28%;
    z-index: 50;
    background: transparent;
    border: none;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .touch-left {
    left: 0;
  }

  .touch-right {
    right: 0;
  }

  /* 반응형 */
  @media (min-width: 600px) and (orientation: landscape) {
    .page-container {
      margin: 12px 20px;
    }

    .page-content {
      padding: 36px 48px;
    }

    .text-content {
      max-width: 720px;
      margin: 0 auto;
      font-size: 18px;
    }
  }

  @media (min-width: 768px) {
    .page-container {
      margin: 16px 24px;
      border-radius: 16px;
    }

    .page-content {
      padding: 40px 56px;
    }

    .text-content {
      max-width: 800px;
      font-size: 18px;
      line-height: 1.9;
    }
  }
</style>
