<script>
  /**
   * MobileBookPage - 모바일용 단일 페이지 컴포넌트
   * 스와이프로 페이지 이동
   */
  import LoadingOverlay from '../LoadingOverlay.svelte';
  import { delegateButtonEvents } from '../../../../utils/dom-helper.js';
  import {
    applyCensoredOverlay,
    removeCensoredOverlay,
  } from '../../../../core/viewer/page-manager.js';

  let {
    content = '',
    pageNum = 0,
    isLoading = false,
    loadingMessage = '',
    liveContentButtons = [],
    imageCensored = false,
    imageCensoredMinWidth = 100,
    imageCensoredMinHeight = 100,
  } = $props();

  let contentRef = $state(null);

  // 콘텐츠가 변경될 때 이벤트 위임 설정 및 스크롤 초기화
  $effect(() => {
    if (contentRef && content) {
      // DOM 업데이트 후 실행
      requestAnimationFrame(() => {
        // 스크롤 최상단으로
        contentRef.scrollTop = 0;

        // 이전 페이지의 검열 오버레이 제거 (혹시 남아있을 수 있음)
        removeCensoredOverlay(contentRef);

        // 이벤트 위임 설정
        if (liveContentButtons.length > 0) {
          delegateButtonEvents(contentRef, liveContentButtons);
        }

        // 이미지 검열 오버레이 적용
        if (imageCensored) {
          applyCensoredOverlay(
            contentRef,
            imageCensoredMinWidth,
            imageCensoredMinHeight,
          );
        }
      });
    }
  });
</script>

<div class="page-container">
  <div class="page-content">
    <div class="text-content chattext" bind:this={contentRef}>
      {@html content}
    </div>

    {#if pageNum > 0}
      <span class="page-number">{pageNum}</span>
    {/if}
  </div>

  <LoadingOverlay visible={isLoading} message={loadingMessage} />
</div>

<style>
</style>
