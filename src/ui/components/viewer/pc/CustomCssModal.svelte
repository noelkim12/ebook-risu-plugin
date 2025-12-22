<script>
  /**
   * CustomCssModal - 사용자 CSS 편집 모달
   */
  import defaultCss from '../../../styles/pc-viewer.css?raw';

  let { isOpen = false, initialCss = '', onApply, onReset, onClose } = $props();

  let cssValue = $state('');

  // initialCss가 변경되거나 모달이 열릴 때 cssValue 업데이트
  $effect(() => {
    if (isOpen) {
      cssValue = initialCss || defaultCss;
    }
  });

  function handleApply() {
    onApply?.(cssValue);
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

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      onClose?.();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="modal-overlay" class:active={isOpen} onclick={handleBackdropClick}>
  <div class="modal-content">
    <div class="modal-header">
      <h3>사용자 CSS</h3>
      <button class="modal-close" onclick={onClose}>&times;</button>
    </div>

    <div class="modal-body">
      <textarea
        bind:value={cssValue}
        placeholder="/* 사용자 정의 CSS를 입력하세요 */"
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
