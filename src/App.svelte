<script>
  import { onDestroy, onMount } from 'svelte';
  import { debounce, isNil } from 'lodash';
  import { RisuAPI } from './core/risu-api.js';
  import { PLUGIN_NAME } from './constants.js';
  import {
    LOCATOR,
    risuSelector,
    getChatIndexFromNode,
    risuSelectorAll,
  } from './utils/selector.js';
  import { safeMount, safeUnmount } from './utils/svelte-helper.js';
  import BookButton from './ui/components/BookButton.svelte';
  import SmallBookButton from './ui/components/SmallBookButton.svelte';

  let risuAPI = $state(null);
  let observer = $state(null);

  // debounced 함수 생성
  const debouncedAttachButton = debounce(attachButton, 100);

  onMount(() => {
    risuAPI = RisuAPI.getInstance();

    if (isNil(risuAPI)) {
      console.log(`[${PLUGIN_NAME}] RisuAPI is not initialized`);
      return;
    }
    startObserver();
    console.log(`[${PLUGIN_NAME}] plugin loaded`);
  });

  onDestroy(() => {
    if (!isNil(observer)) {
      observer.disconnect();
    }
    safeUnmount('book-button');
    debouncedAttachButton.cancel();
    console.log(`${PLUGIN_NAME} 언로드`);
  });

  function startObserver() {
    if (!isNil(observer)) {
      observer.disconnect();
    }

    observer = new MutationObserver(() => {
      debouncedAttachButton();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    debouncedAttachButton();
  }

  function attachButton() {
    // 채팅 입력창 컨테이너에 버튼 추가
    const inputContainer = risuSelector(LOCATOR.chatScreen.inputContainer);
    const sendButton = risuSelector(LOCATOR.chatScreen.sendButton);

    if (!isNil(inputContainer)) {
      safeMount({
        id: 'book-button',
        component: BookButton,
        target: inputContainer,
        anchor: sendButton,
      });
    }
    // 봇 버튼 컨테이너에 버튼 추가
    const botButtonDivList = risuSelectorAll(LOCATOR.chatMessage.botButtonDiv);

    if (!isNil(botButtonDivList)) {
      botButtonDivList.forEach(botButtonDiv => {
        const copyButton = risuSelector(
          LOCATOR.chatMessage.copyButton,
          botButtonDiv,
        );
        let chatIndex = getChatIndexFromNode({ node: botButtonDiv });
        safeMount({
          id: 'small-book-button',
          component: SmallBookButton,
          target: botButtonDiv,
          anchor: copyButton,
          props: {
            chatIndex,
          },
        });
      });
    }

    risuSelector(LOCATOR.chatScreen.burgerMenu);
  }
</script>

<!-- 메인 앱 컴포넌트 -->
<!-- 필요한 UI를 여기에 추가하세요 -->
