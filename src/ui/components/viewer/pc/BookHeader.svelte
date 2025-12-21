<script>
  /**
   * BookHeader - 뷰어 헤더 컴포넌트
   */
  import { X } from 'lucide-svelte';

  let {
    thumbnailUrl = '',
    name = '',
    chatIndex = 0,
    buttons = [],
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
    <span class="header-chat-index">#{displayIndex}</span>
    <button class="close-btn" onclick={onClose} title="닫기">
      <X size={20} />
    </button>
  </div>
</header>
