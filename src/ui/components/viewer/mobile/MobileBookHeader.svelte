<script>
  /**
   * MobileBookHeader - 모바일용 2줄 헤더 컴포넌트
   * Row 1: 썸네일+이름, 채팅 인덱스, 닫기 버튼
   * Row 2: 액션버튼들, LB 토글, 설정 토글
   */
  import { cloneButtonsWithEventDelegation } from '../../../../utils/dom-helper.js';
  import { RisuAPI } from '../../../../core/risu-api.js';
  import { onMount } from 'svelte';
  const risuAPI = RisuAPI.getInstance();
  let {
    thumbnailUrl = '',
    name = '',
    chatIndex = 0,
    buttons = [],
    chatIndexPosition = { position: 0, total: 0, isFirst: true, isLast: true },
    showLBButton = false,
    isFullscreen = false,
    onBack = () => {},
    onPrevChat = () => {},
    onNextChat = () => {},
    onFullscreenToggle = () => {},
    onLBToggle = () => {},
    onSettingsToggle = () => {},
  } = $props();

  let actionButtonsRef = $state(null);

  // iOS 감지
  const isIOS = $derived(
    typeof navigator !== 'undefined' &&
      (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)),
  );

  // 버튼 복제 및 이벤트 위임
  $effect(() => {
    if (actionButtonsRef && buttons.length > 0) {
      cloneButtonsWithEventDelegation(buttons, actionButtonsRef, {
        clearContainer: true,
        additionalClasses: ['header-action-btn'],
      });
    }
  });
</script>

<header class="reader-header">
  <!-- Row 1: 봇 정보, 채팅 인덱스, 닫기 버튼 -->
  <div class="header-row header-row-top">
    <div class="header-bot-info">
      {#if thumbnailUrl}
        <div
          class="header-thumbnail"
          style="background-image: url('{thumbnailUrl}')"
        ></div>
      {:else}
        <div class="header-thumbnail"></div>
      {/if}
      <span class="header-bot-name"
        >{name || risuAPI.getChar()?.name || 'Unknown'}</span
      >
    </div>

    <div class="header-chat-nav">
      <button
        class="nav-chat-btn"
        onclick={onPrevChat}
        disabled={chatIndexPosition.isFirst}
        title="이전 채팅"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <span class="header-chat-index">
        #{chatIndex + 1}
        {#if chatIndexPosition.total > 0}
          <span class="chat-position"
            >({chatIndexPosition.position}/{chatIndexPosition.total})</span
          >
        {/if}
      </span>
      <button
        class="nav-chat-btn"
        onclick={onNextChat}
        disabled={chatIndexPosition.isLast}
        title="다음 채팅"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>

    <button class="header-btn close-btn" onclick={onBack} title="닫기">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
      >
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
  </div>

  <!-- Row 2: 액션 버튼들, LB, 설정 -->
  <div class="header-row header-row-bottom">
    <div class="header-action-buttons" bind:this={actionButtonsRef}></div>

    <div class="header-right-group">
      {#if !isIOS}
        <button
          class="header-toggle-btn fullscreen-btn"
          class:active={isFullscreen}
          onclick={onFullscreenToggle}
          title={isFullscreen ? '전체화면 해제' : '전체화면'}
        >
          {#if isFullscreen}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"
              />
            </svg>
          {:else}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
              />
            </svg>
          {/if}
        </button>
      {/if}

      {#if showLBButton}
        <button
          class="header-toggle-btn lb-btn"
          onclick={onLBToggle}
          title="LB 모듈"
        >
          LB
        </button>
      {/if}

      <button
        class="header-toggle-btn settings-btn"
        onclick={onSettingsToggle}
        title="설정"
      >
        설정
      </button>
    </div>
  </div>
</header>

<style>
  .reader-header {
    display: flex;
    flex-direction: column;
    background: var(--mv-header-bg, rgba(26, 31, 53, 0.97));
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--mv-border-color, rgba(201, 166, 107, 0.2));
    z-index: 100;
    flex-shrink: 0;
  }

  .header-row {
    display: flex;
    align-items: center;
    padding: 0 12px;
  }

  .header-row-top {
    justify-content: space-between;
    padding-top: 10px;
    padding-bottom: 6px;
  }

  .header-row-bottom {
    justify-content: space-between;
    padding-top: 4px;
    padding-bottom: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  .header-btn {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.85);
    padding: 8px;
    cursor: pointer;
    border-radius: 10px;
    transition: all
      var(--mv-transition-fast, 0.15s cubic-bezier(0.4, 0, 0.2, 1));
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    min-width: 36px;
    min-height: 36px;
  }

  .header-btn:active {
    background: rgba(201, 166, 107, 0.2);
    color: var(--mv-accent-color, #c9a66b);
    transform: scale(0.95);
  }

  .header-btn svg {
    width: 18px;
    height: 18px;
  }

  /* 닫기 버튼 */
  .close-btn {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.7);
  }

  .close-btn:active {
    background: rgba(255, 100, 100, 0.3);
    color: #ff6b6b;
  }

  /* 봇 정보 */
  .header-bot-info {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    flex-shrink: 1;
  }

  .header-thumbnail {
    width: 32px;
    height: 32px;
    min-width: 32px;
    border-radius: 8px;
    background-size: cover;
    background-position: center;
    background-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }

  .header-bot-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--mv-accent-color, #c9a66b);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 150px;
  }

  /* 채팅 네비게이션 */
  .header-chat-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    flex: 1;
  }

  .nav-chat-btn {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    padding: 6px;
    cursor: pointer;
    border-radius: 6px;
    transition: all
      var(--mv-transition-fast, 0.15s cubic-bezier(0.4, 0, 0.2, 1));
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    min-height: 28px;
  }

  .nav-chat-btn:active:not(:disabled) {
    background: rgba(201, 166, 107, 0.2);
    color: var(--mv-accent-color, #c9a66b);
  }

  .nav-chat-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .header-chat-index {
    font-size: 12px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.08);
    padding: 4px 8px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .chat-position {
    font-size: 10px;
    opacity: 0.7;
  }

  /* 액션 버튼들 */
  .header-action-buttons {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .header-action-buttons :global(button),
  .header-action-buttons :global(.header-action-btn) {
    background: none;
    border: none;
    padding: 6px;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.6);
    border-radius: 8px;
    transition: all
      var(--mv-transition-fast, 0.15s cubic-bezier(0.4, 0, 0.2, 1));
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    min-height: 36px;
  }

  .header-action-buttons :global(button:active),
  .header-action-buttons :global(.header-action-btn:active) {
    background: rgba(201, 166, 107, 0.2);
    color: var(--mv-accent-color, #c9a66b);
  }

  .header-action-buttons :global(button svg),
  .header-action-buttons :global(.header-action-btn svg) {
    width: 18px;
    height: 18px;
  }

  /* 우측 그룹 */
  .header-right-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .header-toggle-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: var(--mv-accent-color, #c9a66b);
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 700;
    border-radius: 8px;
    cursor: pointer;
    transition: all
      var(--mv-transition-fast, 0.15s cubic-bezier(0.4, 0, 0.2, 1));
    min-height: 32px;
  }

  .header-toggle-btn:active {
    background: var(--mv-accent-color, #c9a66b);
    color: white;
    transform: scale(0.95);
  }

  .header-toggle-btn.active {
    background: var(--mv-accent-color, #c9a66b);
    color: white;
    border-color: var(--mv-accent-color, #c9a66b);
  }

  .fullscreen-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px 8px;
  }

  .fullscreen-btn svg {
    flex-shrink: 0;
  }

  /* Safe Area */
  @supports (padding-top: env(safe-area-inset-top)) {
    .header-row-top {
      padding-top: max(10px, env(safe-area-inset-top));
    }
  }
</style>
