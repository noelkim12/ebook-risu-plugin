<script>
  /**
   * ViewerToast - 뷰어 내 재사용 가능한 토스트 알림 컴포넌트
   */
  import { onMount } from 'svelte';

  let {
    message = '',
    duration = 2000,
    visible = false,
    onHide = () => {},
  } = $props();

  let isShowing = $state(false);
  let hideTimer = null;

  $effect(() => {
    if (visible) {
      isShowing = true;

      // 기존 타이머 정리
      if (hideTimer) clearTimeout(hideTimer);

      // duration 후 자동 숨김
      hideTimer = setTimeout(() => {
        isShowing = false;
        setTimeout(() => {
          onHide();
        }, 300); // fade out 애니메이션 시간
      }, duration);
    }
  });

  onMount(() => {
    return () => {
      if (hideTimer) clearTimeout(hideTimer);
    };
  });
</script>

{#if visible}
  <div class="viewer-toast" class:showing={isShowing}>
    <div class="toast-content">
      {message}
    </div>
  </div>
{/if}

<style>
  .viewer-toast {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .viewer-toast.showing {
    opacity: 1;
  }

  .toast-content {
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 16px 32px;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 500;
    text-align: center;
    backdrop-filter: blur(8px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    max-width: 400px;
  }

  :global(.book-viewer-root[data-theme='light']) .toast-content {
    background: rgba(50, 50, 50, 0.9);
  }
</style>
