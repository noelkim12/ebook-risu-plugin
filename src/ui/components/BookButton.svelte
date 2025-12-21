<script>
  import { onMount } from 'svelte';
  import { Book } from 'lucide-svelte';
  import { LOCATOR, risuSelector } from '../../utils/selector.js';
  import { openPCViewer } from './viewer/pc/viewerHelpers.js';

  let inputHeight = $state('44px');

  onMount(() => {
    const inputTextarea = risuSelector(LOCATOR.chatScreen.textarea);
    if (inputTextarea) {
      inputHeight = `${inputTextarea.scrollHeight}px`;
    }
  });

  function handleClick(event) {
    event.stopPropagation();
    openPCViewer();
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
