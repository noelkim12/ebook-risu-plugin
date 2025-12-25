<script>
  import { BookOpen } from 'lucide-svelte';
  import { isMobile, openViewer } from './viewer/pc/viewerHelpers.js';
  import { openMobileViewer } from './viewer/mobile/viewerHelpers.js';

  let { chatIndex } = $props();

  async function handleClick(event) {
    event.stopPropagation();
    if (isMobile()) {
      await openMobileViewer();
    } else {
      await openViewer(chatIndex);
    }
  }
</script>

<button
  class="ml-2 hover:text-blue-500 transition-colors button-small-book"
  onclick={handleClick}
  title="이북 뷰어로 보기"
>
  <BookOpen size={20} />
</button>
