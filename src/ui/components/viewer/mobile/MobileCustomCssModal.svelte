<script>
  /**
   * MobileCustomCssModal - 모바일용 사용자 CSS 편집 모달
   */
  import { onMount } from 'svelte';

  let {
    isOpen = false,
    initialCss = '',
    onApply = () => {},
    onReset = () => {},
    onClose = () => {},
  } = $props();

  let cssValue = $state('');

  // isOpen이 true가 될 때 initialCss로 초기화
  $effect(() => {
    if (isOpen) {
      cssValue = initialCss;
    }
  });

  function handleApply() {
    onApply(cssValue);
    onClose();
  }

  function handleReset() {
    cssValue = '';
    onReset();
  }

  function handleOverlayClick() {
    onClose();
  }

  function handleContentClick(e) {
    e.stopPropagation();
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      onClose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
  <div
    class="modal-overlay"
    role="button"
    tabindex="0"
    onclick={handleOverlayClick}
    onkeydown={e => e.key === 'Enter' && handleOverlayClick()}
  >
    <div
      class="modal-content"
      role="dialog"
      tabindex="-1"
      onclick={handleContentClick}
      onkeydown={e => e.stopPropagation()}
    >
      <div class="modal-header">
        <h3>사용자 CSS 편집</h3>
        <button class="modal-close" onclick={onClose}>&times;</button>
      </div>

      <div class="modal-body">
        <textarea
          bind:value={cssValue}
          placeholder="여기에 CSS를 입력하세요..."
          spellcheck="false"
        ></textarea>
      </div>

      <div class="modal-footer">
        <button class="modal-btn secondary" onclick={handleReset}>
          초기화
        </button>
        <button class="modal-btn primary" onclick={handleApply}> 적용 </button>
      </div>
    </div>
  </div>
{/if}
