<script>
  import { BookOpen } from 'lucide-svelte';
  import { openPCViewer } from './viewer/pc/viewerHelpers.js';

  let { chatIndex } = $props();

  function handleClick(event) {
    event.stopPropagation();
    openPCViewer(chatIndex);
  }
</script>

<button
  class="ml-2 hover:text-blue-500 transition-colors button-small-book"
  onclick={handleClick}
  title="이북 뷰어로 보기"
>
  <BookOpen size={20} />
</button>
