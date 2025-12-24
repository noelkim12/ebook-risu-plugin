<script>
  /**
   * ViewerToast - 뷰어 내 재사용 가능한 토스트 알림 컴포넌트
   * PC/Mobile 공유
   */
  import { onMount } from 'svelte';

  let {
    message = '',
    duration = 2000,
    visible = false,
    clickable = false,
    onClick = null,
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

  function handleClick() {
    if (clickable && onClick) {
      // 타이머 정리 후 즉시 숨김
      if (hideTimer) clearTimeout(hideTimer);
      isShowing = false;
      onClick();
      setTimeout(() => {
        onHide();
      }, 100);
    }
  }

  onMount(() => {
    return () => {
      if (hideTimer) clearTimeout(hideTimer);
    };
  });
</script>

{#if visible}
  <div
    class="viewer-toast"
    class:showing={isShowing}
    class:clickable
    onclick={handleClick}
    role={clickable ? 'button' : 'status'}
    tabindex={clickable ? 0 : -1}
  >
    <div class="toast-content">
      {message}
    </div>
  </div>
{/if}

