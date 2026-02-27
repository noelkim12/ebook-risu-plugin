<script>
  /**
   * MobileCustomCssModal - 모바일용 사용자 CSS 편집 모달
   */
  import defaultCss from '../../../styles/mobile-viewer.css?raw';

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
      cssValue = initialCss || defaultCss;
    }
  });

  function handleApply() {
    onApply?.(cssValue);
    onClose?.();
  }

  function handleReset() {
    cssValue = defaultCss;
    onReset?.();
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  }

  function handleContentClick(e) {
    e.stopPropagation();
  }

  function handleContentKeydown(e) {
    e.stopPropagation();
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      onClose?.();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
  <div
    role="button"
    tabindex="0"
    class="modal-overlay"
    class:active={isOpen}
    aria-label="사용자 CSS 편집 닫기"
    onclick={handleBackdropClick}
    onkeydown={e =>
      (e.key === 'Enter' || e.key === ' ') && handleBackdropClick(e)}
  >
    <div
      class="modal-content"
      role="dialog"
      tabindex="-1"
      onclick={handleContentClick}
      onkeydown={handleContentKeydown}
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
