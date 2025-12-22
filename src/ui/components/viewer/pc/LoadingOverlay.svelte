<script>
  /**
   * LoadingOverlay - chat index 이동 시 표시되는 로딩 오버레이
   */
  import { fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  let { visible = false, message = '로딩 중...' } = $props();
</script>

{#if visible}
  <div
    class="loading-overlay"
    in:fade={{ duration: 200, easing: cubicOut }}
    out:fade={{ duration: 300, easing: cubicOut }}
  >
    <div class="loading-content">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      {#if message}
        <span class="loading-message">{message}</span>
      {/if}
    </div>
  </div>
{/if}

<style>
  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--bv-page-color) 85%, transparent);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    pointer-events: all;
    border-radius: inherit;
  }

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    animation: contentFadeIn 0.3s ease-out;
  }

  @keyframes contentFadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .loading-spinner {
    position: relative;
    width: 44px;
    height: 44px;
  }

  .spinner-ring {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 2.5px solid transparent;
    border-top-color: var(--bv-accent-color, #6366f1);
    border-radius: 50%;
    animation: spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  }

  .spinner-ring:nth-child(1) {
    animation-delay: -0.4s;
  }

  .spinner-ring:nth-child(2) {
    animation-delay: -0.25s;
    width: 75%;
    height: 75%;
    top: 12.5%;
    left: 12.5%;
  }

  .spinner-ring:nth-child(3) {
    animation-delay: -0.1s;
    width: 50%;
    height: 50%;
    top: 25%;
    left: 25%;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .loading-message {
    font-size: 13px;
    font-weight: 500;
    color: var(--bv-text-secondary, #666);
  }

  :global(.book-viewer-root[data-theme='dark']) .loading-message {
    color: var(--bv-text-secondary, #aaa);
  }
</style>
