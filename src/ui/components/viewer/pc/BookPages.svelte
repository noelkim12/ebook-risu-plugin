<script>
  /**
   * BookPages - 2페이지 스프레드 레이아웃
   */
  import LoadingOverlay from '../LoadingOverlay.svelte';
  import { delegateButtonEvents } from '../../../../utils/dom-helper.js';

  let {
    leftContent = '',
    rightContent = '',
    leftPageNum = 0,
    rightPageNum = 0,
    onPrevPage,
    onNextPage,
    leftContentRef = null,
    rightContentRef = null,
    isLoading = false,
    loadingMessage = '',
    liveContentButtons = [],
  } = $props();

  let leftTextContent = $state(null);
  let rightTextContent = $state(null);

  // leftContent가 변경되면 DOM에 적용 후 이벤트 위임 설정
  $effect(() => {
    if (leftTextContent) {
      leftTextContent.innerHTML = leftContent;
      // 라이브 버튼과 이벤트 위임 연결
      if (liveContentButtons.length > 0) {
        delegateButtonEvents(leftTextContent, liveContentButtons);
      }
    }
  });

  // rightContent가 변경되면 DOM에 적용 후 이벤트 위임 설정
  $effect(() => {
    if (rightTextContent) {
      rightTextContent.innerHTML = rightContent;
      // 라이브 버튼과 이벤트 위임 연결
      if (liveContentButtons.length > 0) {
        delegateButtonEvents(rightTextContent, liveContentButtons);
      }
    }
  });

  // contentRef 바인딩 노출
  $effect(() => {
    if (leftTextContent && leftContentRef !== leftTextContent) {
      leftContentRef = leftTextContent;
    }
  });
</script>

<div class="book-pages">
  <!-- 클릭 영역 -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="click-area click-left" onclick={onPrevPage}></div>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="click-area click-right" onclick={onNextPage}></div>

  <!-- 왼쪽 페이지 -->
  <div class="page page-left">
    <div class="page-content">
      <div class="text-content chattext" bind:this={leftTextContent}></div>
      {#if leftPageNum > 0}
        <div class="page-number left-page-num">{leftPageNum}</div>
      {/if}
    </div>
  </div>

  <!-- 책등 -->
  <div class="book-spine"></div>

  <!-- 오른쪽 페이지 -->
  <div class="page page-right">
    <div class="page-content">
      <div class="text-content chattext" bind:this={rightTextContent}></div>
      {#if rightPageNum > 0}
        <div class="page-number right-page-num">{rightPageNum}</div>
      {/if}
    </div>
  </div>

  <!-- 로딩 오버레이 -->
  <LoadingOverlay visible={isLoading} message={loadingMessage} />
</div>
