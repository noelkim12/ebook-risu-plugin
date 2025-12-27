<script>
  import { BookOpen } from 'lucide-svelte';
  import { isMobile, openViewer } from './viewer/pc/viewerHelpers.js';
  import { openMobileViewer } from './viewer/mobile/viewerHelpers.js';
  import { LOCATOR, risuSelector, getChatIndexFromNode } from '../../utils/selector.js';

  let { chatIndex } = $props();

  async function handleClick(event) {
    event.stopPropagation();

    chatIndex = chatIndex || getChatIndexFromNode({ node: event.target });
    let chatScreen = risuSelector(LOCATOR.chatScreen.root);
    chatScreen.scrollTo({ top: 0, behavior: 'smooth' });

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
