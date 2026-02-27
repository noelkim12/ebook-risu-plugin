<script>
  /**
   * BookHeader - 뷰어 헤더 컴포넌트
   */
  import { X, ChevronLeft, ChevronRight } from 'lucide-svelte';
  import { RisuAPI } from '../../../../core/risu-api.js';

  const risuAPI = RisuAPI.getInstance();
  let {
    thumbnailUrl = '',
    name = '',
    chatIndex = 0,
    chatIndexPosition = { position: 0, total: 0, isFirst: true, isLast: true },
    onPrevChat,
    onNextChat,
    onClose,
  } = $props();

  let displayName = $state('Unknown');
  let displayIndex = $derived(chatIndex + 1);

  $effect(() => {
    if (name) {
      displayName = name;
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const char = await risuAPI.getChar();
        if (!cancelled) {
          displayName = char?.name || 'Unknown';
        }
      } catch (error) {
        if (!cancelled) {
          displayName = 'Unknown';
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  });
</script>

<header class="book-header">
  <div class="header-left">
    <div
      class="header-thumbnail"
      style:background-image={thumbnailUrl ? `url('${thumbnailUrl}')` : 'none'}
    ></div>

    <div class="header-info">
      <span class="header-name">{displayName}</span>
    </div>
  </div>

  <div class="header-right">
    <div class="chat-index-nav">
      <button
        class="chat-nav-btn"
        onclick={onPrevChat}
        disabled={chatIndexPosition.isFirst}
        title="이전 채팅"
      >
        <ChevronLeft size={16} />
      </button>
      <span class="header-chat-index">
        #{displayIndex}
        {#if chatIndexPosition.total > 0}
          <span class="chat-index-total"
            >({chatIndexPosition.currentIndex}/{chatIndexPosition.lastIndex})</span
          >
        {/if}
      </span>
      <button
        class="chat-nav-btn"
        onclick={onNextChat}
        disabled={chatIndexPosition.isLast}
        title="다음 채팅"
      >
        <ChevronRight size={16} />
      </button>
    </div>
    <button class="close-btn" onclick={onClose} title="닫기">
      <X size={20} />
    </button>
  </div>
</header>
