<script>
  /**
   * BookHeader - 뷰어 헤더 컴포넌트
   */
  import { X, ChevronLeft, ChevronRight } from 'lucide-svelte';

  let {
    thumbnailUrl = '',
    name = '',
    chatIndex = 0,
    buttons = [],
    chatIndexPosition = { position: 0, total: 0, isFirst: true, isLast: true },
    onPrevChat,
    onNextChat,
    onClose
  } = $props();

  let buttonsContainer = $state(null);

  // 버튼들을 DOM에 추가
  $effect(() => {
    if (buttonsContainer && buttons.length > 0) {
      buttonsContainer.innerHTML = '';
      buttons.forEach(btn => {
        const cloned = btn.cloneNode(true);
        buttonsContainer.appendChild(cloned);
      });
    }
  });

  let displayIndex = $derived(chatIndex + 1);
</script>

<header class="book-header">
  <div class="header-left">
    <div
      class="header-thumbnail"
      style:background-image={thumbnailUrl ? `url('${thumbnailUrl}')` : 'none'}
    ></div>

    <div class="header-info">
      <span class="header-name">{name || 'Unknown'}</span>
      <div class="header-buttons" bind:this={buttonsContainer}></div>
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
          <span class="chat-index-total">({chatIndexPosition.position}/{chatIndexPosition.total})</span>
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
