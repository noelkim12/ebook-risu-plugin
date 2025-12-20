<script>
  import { onDestroy, onMount } from 'svelte';
  import styles from '../styles/update-dialog.module.css';

  let { message = '', confirmText = '확인' } = $props();

  let confirmBtn = $state(null);

  onMount(() => {
    document.addEventListener('keydown', handleKeydown);
    setTimeout(() => confirmBtn?.focus(), 0);
  });

  onDestroy(() => {
    document.removeEventListener('keydown', handleKeydown);
  });

  function handleKeydown(e) {
    if (e.key === 'Enter' || e.key === 'Escape') {
      dispatchConfirm();
    }
  }

  function dispatchConfirm() {
    confirmBtn?.dispatchEvent(
      new CustomEvent('confirm', {
        bubbles: true,
        composed: true,
      }),
    );
  }
</script>

<div class={styles.udRoot} role="dialog" aria-modal="true" tabindex="-1">
  <div class="{styles.udCard} {styles.udAlert}">
    <div class={styles.udAlertMessage}>
      {message}
    </div>
    <div class={styles.udActions}>
      <button bind:this={confirmBtn} class={styles.udBtnPrimary} onclick={dispatchConfirm}>
        {confirmText}
      </button>
    </div>
  </div>
</div>
