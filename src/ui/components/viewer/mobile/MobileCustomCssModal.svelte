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
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="modal-overlay" onclick={handleOverlayClick}>
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div class="modal-content" onclick={handleContentClick}>
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
        <button class="modal-btn primary" onclick={handleApply}>
          적용
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 300;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    animation: fadeIn 0.25s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal-content {
    background: var(--mv-page-color, #fdfbf7);
    border-radius: 16px;
    width: 100%;
    max-width: 500px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    animation: modalSlideIn 0.25s ease-out;
  }

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  .modal-header h3 {
    font-size: 16px;
    font-weight: 700;
    color: var(--mv-text-color, #2c2c2c);
    margin: 0;
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 24px;
    color: var(--mv-text-secondary, #6b6b6b);
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
    transition: all var(--mv-transition-fast, 0.15s);
    line-height: 1;
  }

  .modal-close:active {
    background: rgba(0, 0, 0, 0.1);
  }

  .modal-body {
    flex: 1;
    padding: 16px 20px;
    overflow: auto;
  }

  .modal-body textarea {
    width: 100%;
    height: 200px;
    padding: 14px;
    border: 2px solid rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 13px;
    line-height: 1.5;
    resize: vertical;
    background: rgba(0, 0, 0, 0.02);
    color: var(--mv-text-color, #2c2c2c);
  }

  .modal-body textarea:focus {
    outline: none;
    border-color: var(--mv-accent-color, #c9a66b);
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 14px 20px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }

  .modal-btn {
    padding: 10px 18px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--mv-transition-fast, 0.15s);
  }

  .modal-btn.primary {
    background: var(--mv-accent-color, #c9a66b);
    color: white;
    border: none;
  }

  .modal-btn.primary:active {
    opacity: 0.9;
    transform: scale(0.98);
  }

  .modal-btn.secondary {
    background: transparent;
    color: var(--mv-text-secondary, #6b6b6b);
    border: 2px solid rgba(0, 0, 0, 0.15);
  }

  .modal-btn.secondary:active {
    background: rgba(0, 0, 0, 0.05);
  }
</style>
