<script>
  import { onMount, onDestroy } from 'svelte';
  import { Book } from 'lucide-svelte';
  import { LOCATOR, risuSelector } from '../../utils/selector.js';
  import { isMobile, openViewer } from './viewer/pc/viewerHelpers.js';
  import { openMobileViewer } from './viewer/mobile/viewerHelpers.js';

  let inputHeight = $state('44px');
  let resizeObserver = null;

  onMount(() => {
    const inputTextarea = risuSelector(LOCATOR.chatScreen.textarea);
    if (inputTextarea) {
      // 초기 높이 설정
      inputHeight = `${inputTextarea.scrollHeight}px`;

      // ResizeObserver로 높이 변화 감지
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const newHeight = entry.target.scrollHeight;
          inputHeight = `${newHeight}px`;
        }
      });
      resizeObserver.observe(inputTextarea);
    }
  });

  onDestroy(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
  });

  async function handleClick(event) {
    event.stopPropagation();
    if (isMobile()) {
      await openMobileViewer();
    } else {
      await openViewer();
    }
  }
</script>

<button
  class="flex justify-center border-y border-darkborderc items-center text-gray-100 p-3 peer-focus:border-textcolor hover:bg-blue-500 transition-colors button-icon-ebook"
  onclick={handleClick}
  style:height={inputHeight}
  title="이북 리수 기립하시오"
>
  <Book />
</button>
