<script>
  import styles from '../styles/update-dialog.module.css';

  let { message = '업데이트를 처리하고 있습니다...' } = $props();
</script>

<div class={styles.udRoot} role="dialog" aria-modal="true" aria-busy="true" tabindex="-1">
  <div class="{styles.udCard} {styles.udLoading}">
    <div class={styles.udLoadingSpinner}>
      <svg class={styles.udLoadingSvg} viewBox="0 0 50 50">
        <circle
          class={styles.udLoadingCircle}
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke-width="4"
        />
      </svg>
    </div>
    <div class={styles.udLoadingMessage}>
      {message}
    </div>
  </div>
</div>
