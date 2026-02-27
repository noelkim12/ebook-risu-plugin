<script>
  /**
   * MobileBookHeader - 모바일용 헤더 컴포넌트
   */
  import { RisuAPI } from '../../../../core/risu-api.js';

  const risuAPI = RisuAPI.getInstance();

  let {
    thumbnailUrl = '',
    name = '',
    chatIndex = null,
    chatIndexPosition = { position: 0, total: 0, isFirst: true, isLast: true },
    onBack = async () => {},
    onPrevChat = async () => {},
    onNextChat = async () => {},
    onSettingsToggle = async () => {},
  } = $props();

  let resolvedName = $state('Unknown');

  $effect(() => {
    resolvedName = name || 'Unknown';

    if (name) {
      return;
    }

    let mounted = true;
    const resolveName = async () => {
      try {
        const char = await risuAPI.getChar();
        if (mounted) {
          resolvedName = char?.name || 'Unknown';
        }
      } catch {
        if (mounted) {
          resolvedName = 'Unknown';
        }
      }
    };

    void resolveName();

    return () => {
      mounted = false;
    };
  });

  async function handlePrevChat() {
    await onPrevChat();
  }

  async function handleNextChat() {
    await onNextChat();
  }

  async function handleBack() {
    await onBack();
  }

  async function handleSettingsToggle() {
    await onSettingsToggle();
  }
</script>

<header class="reader-header">
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
      <span class="header-bot-name">{resolvedName}</span>
    </div>

    <div class="header-chat-nav">
      <button
        class="nav-chat-btn"
        onclick={handlePrevChat}
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
        #{chatIndex}
        {#if chatIndexPosition.total > 0}
          <span class="chat-position"
            >({chatIndexPosition.currentIndex}/{chatIndexPosition.lastIndex})</span
          >
        {/if}
      </span>
      <button
        class="nav-chat-btn"
        onclick={handleNextChat}
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

    <div class="header-right-group">
      <button
        class="header-btn settings-btn"
        onclick={handleSettingsToggle}
        title="설정"
      >
        설정
      </button>
      <button class="header-btn close-btn" onclick={handleBack} title="닫기">
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

  .close-btn {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.7);
  }

  .close-btn:active {
    background: rgba(255, 100, 100, 0.3);
    color: #ff6b6b;
  }

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

  .header-right-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .settings-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: var(--mv-accent-color, #c9a66b);
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 700;
    border-radius: 8px;
    min-height: 32px;
  }

  .settings-btn:active {
    background: var(--mv-accent-color, #c9a66b);
    color: white;
    border-color: var(--mv-accent-color, #c9a66b);
    transform: scale(0.95);
  }

  @supports (padding-top: env(safe-area-inset-top)) {
    .header-row-top {
      padding-top: max(10px, env(safe-area-inset-top));
    }
  }
</style>
