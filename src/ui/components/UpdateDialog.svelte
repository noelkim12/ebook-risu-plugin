<script>
  import { onDestroy, onMount } from 'svelte';
  import styles from '../styles/update-dialog.module.css';

  let {
    name = '',
    currentVersion = '0.0.0',
    version = '0.0.0',
    releasedAt = new Date().toISOString(),
    mandatory = false,
    notes = [],
    i18n = {
      title: '플러그인 업데이트 준비 완료',
      primary: '지금 업데이트',
      later: '나중에',
      skip: '이번 버전 건너뛰기',
    },
  } = $props();

  let updateBtn = $state(null);
  let releasedDate = $derived(new Date(releasedAt).toLocaleDateString());
  let updateType = $derived(mandatory ? '필수 업데이트' : '선택 업데이트');

  onMount(() => {
    document.addEventListener('keydown', handleKeydown);
    setTimeout(() => updateBtn?.focus(), 0);
  });

  onDestroy(() => {
    document.removeEventListener('keydown', handleKeydown);
  });

  function handleKeydown(e) {
    if (e.key === 'Escape' && !mandatory) {
      dispatchAction('later');
    }
    if (e.key === 'Enter') {
      dispatchAction('update');
    }
  }

  function handleBackdropClick(e) {
    if (!mandatory && e.target === e.currentTarget) {
      dispatchAction('later');
    }
  }

  function handleBackdropKeydown(e) {
    if (!mandatory && (e.key === 'Escape' || e.key === 'Enter')) {
      if (e.target === e.currentTarget) {
        dispatchAction('later');
      }
    }
  }

  function dispatchAction(action) {
    const detail = { action };
    if (action === 'skip') {
      detail.skipVersion = version;
    }
    // Svelte 5에서는 부모 컨테이너로 이벤트를 버블링
    updateBtn?.dispatchEvent(new CustomEvent('update-action', {
      detail,
      bubbles: true,
      composed: true,
    }));
  }

  function getNoteTypeClass(type) {
    const typeName = (type || '').trim();
    const capitalized = typeName.charAt(0).toUpperCase() + typeName.slice(1);
    return styles[`ud${capitalized}`] || '';
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  class={styles.udRoot}
  role="dialog"
  aria-modal="true"
  tabindex="-1"
  onclick={handleBackdropClick}
  onkeydown={handleBackdropKeydown}
>
  <div class={styles.udCard}>
    <div class={styles.udTitle}>
      <h3>{i18n.title}{name ? ` · ${name}` : ''}</h3>
      <span class={styles.udPill}>v{currentVersion} → v{version}</span>
    </div>
    <div class={styles.udSub}>
      {releasedDate} · {updateType}
    </div>
    <ul class={styles.udList} aria-label="변경사항">
      {#if notes.length > 0}
        {#each notes.slice(0, 8) as note}
          <li class={getNoteTypeClass(note.type)}>{note.text || ''}</li>
        {/each}
      {:else}
        <li>세부 변경사항은 릴리스 노트를 참고해주세요</li>
      {/if}
    </ul>
    <div class={styles.udActions}>
      {#if !mandatory}
        <button class={styles.udBtnGhost} onclick={() => dispatchAction('later')}>
          {i18n.later}
        </button>
        <button class={styles.udBtnGhost} onclick={() => dispatchAction('skip')}>
          {i18n.skip}
        </button>
      {/if}
      <button
        bind:this={updateBtn}
        class={styles.udBtnPrimary}
        onclick={() => dispatchAction('update')}
      >
        {i18n.primary}
      </button>
    </div>
  </div>
</div>
