<script>
  import { onMount } from 'svelte';

  import PCBookViewer from './ui/components/viewer/pc/PCBookViewer.svelte';
  import MobileBookViewer from './ui/components/viewer/mobile/MobileBookViewer.svelte';

  const DEFAULT_CHAT_DATA = {
    chatHtml: '',
    chatIndex: 0,
    chatPage: 0,
    chaId: null,
    initialLoading: false,
    initialPage: null,
  };

  const props = $props();

  let visible = $state(false);
  let payload = $state({
    ...DEFAULT_CHAT_DATA,
    ...(props.chatData ?? {}),
  });
  let isMobileView = $state(false);

  function detectMobile() {
    const isSmallScreen = window.innerWidth <= 680;
    const isMobileUA =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );
    return isSmallScreen && isMobileUA;
  }

  function syncDeviceMode() {
    isMobileView = detectMobile();
  }

  onMount(() => {
    syncDeviceMode();
  });

  function normalizeIncomingChatData(newData = {}) {
    return {
      ...DEFAULT_CHAT_DATA,
      ...newData,
    };
  }

  function normalizeUpdatedChatData(newData = {}) {
    return {
      ...payload,
      ...newData,
    };
  }

  export function showViewer(chatData = {}) {
    payload = normalizeIncomingChatData(chatData);
    visible = true;
  }

  export function hideViewer() {
    visible = false;
  }

  export function updateContent(chatData = {}) {
    payload = normalizeUpdatedChatData(chatData);
  }
</script>

<svelte:window onresize={syncDeviceMode} />

{#if visible}
  {#if isMobileView}
    <MobileBookViewer {...payload} onClose={hideViewer} />
  {:else}
    <PCBookViewer {...payload} onClose={hideViewer} />
  {/if}
{/if}
