import {
  mountComponent,
  safeUnmount,
  isMounted,
  safeSetStyle,
  safeRestoreStyle,
} from '../../../../utils/svelte-helper.js';
import {
  risuSelector,
  LOCATOR,
  getChatElementByChatIndex,
} from '../../../../utils/selector.js';
import { RisuAPI } from '../../../../core/risu-api.js';
import MobileBookViewer from './MobileBookViewer.svelte';

import {
  isPCViewerOpen,
  closePCViewer,
  VIEWER_ID as PC_VIEWER_ID,
} from '../pc/viewerHelpers.js';

export const MOBILE_VIEWER_ID = 'mobile-book-viewer';
export const STYLE_NAMESPACE = 'mobile-viewer';
let mountTarget = null;

export async function openMobileViewer(
  chatIndex = null,
  toggleViewer = true,
  showLoading = false,
  initialPage = null,
) {
  try {
    if (toggleViewer && isMounted(MOBILE_VIEWER_ID)) {
      await closeMobileViewer();
      if (isPCViewerOpen()) {
        await closePCViewer();
      }
      return true;
    }

    if (isMounted(MOBILE_VIEWER_ID)) {
      await closeMobileViewer();
    }
    if (isMounted(PC_VIEWER_ID)) {
      safeUnmount(PC_VIEWER_ID);
    }

    const risuAPI = RisuAPI.getInstance();

    const resolvedChatIndex =
      chatIndex != null
        ? Number(chatIndex)
        : (await risuAPI.getLastChatIndex()) - 1;
    const targetIndex = Number.isFinite(resolvedChatIndex)
      ? resolvedChatIndex
      : 0;

    if (targetIndex < 0) {
      return false;
    }

    const chatElement = await getChatElementByChatIndex(targetIndex);
    if (!chatElement) {
      console.warn(
        '[MobileViewer] Chat element not found for index:',
        targetIndex,
      );
      return false;
    }

    const chatHtml =
      typeof chatElement.getOuterHTML === 'function'
        ? await chatElement.getOuterHTML()
        : chatElement.outerHTML;
    const [chatPage, chaId] = await Promise.all([
      risuAPI.getCurrentChatPage(),
      risuAPI.getChaId(),
    ]);

    const displayContainer = await risuSelector(
      LOCATOR.chatScreen.displayContainer,
    );
    const rootContainer = await risuSelector(LOCATOR.chatScreen.root);

    if (displayContainer) {
      safeSetStyle(displayContainer, { overflow: 'hidden' }, STYLE_NAMESPACE);
    }
    if (rootContainer) {
      safeSetStyle(rootContainer, { overflow: 'hidden' }, STYLE_NAMESPACE);
    }

    const target = displayContainer || document.body;
    if (!target) {
      console.warn('[MobileViewer] No mount target found');
      if (displayContainer) {
        safeRestoreStyle(displayContainer, STYLE_NAMESPACE);
      }
      if (rootContainer) {
        safeRestoreStyle(rootContainer, STYLE_NAMESPACE);
      }
      return false;
    }

    const result = mountComponent({
      id: MOBILE_VIEWER_ID,
      component: MobileBookViewer,
      target,
      props: {
        chatHtml,
        chatIndex: targetIndex,
        chatPage,
        chaId,
        onClose: closeMobileViewer,
        initialLoading: showLoading,
        initialPage: initialPage,
      },
    });

    if (result) {
      mountTarget = target;
      return true;
    }

    if (displayContainer) {
      safeRestoreStyle(displayContainer, STYLE_NAMESPACE);
    }
    if (rootContainer) {
      safeRestoreStyle(rootContainer, STYLE_NAMESPACE);
    }

    return false;
  } catch (error) {
    console.error('[MobileViewer] Failed to open:', error);
    return false;
  }
}

export async function closeMobileViewer() {
  if (mountTarget) {
    safeRestoreStyle(mountTarget, STYLE_NAMESPACE);
    mountTarget = null;
  }

  const displayContainer = await risuSelector(
    LOCATOR.chatScreen.displayContainer,
  );
  if (displayContainer) {
    safeRestoreStyle(displayContainer, STYLE_NAMESPACE);
  }

  const rootContainer = await risuSelector(LOCATOR.chatScreen.root);
  if (rootContainer) {
    safeRestoreStyle(rootContainer, STYLE_NAMESPACE);
  }

  if (document.fullscreenElement) {
    await document.exitFullscreen?.();
  }

  safeUnmount(MOBILE_VIEWER_ID);
}

export function isMobileViewerOpen() {
  return isMounted(MOBILE_VIEWER_ID);
}

export function toggleMobileViewer(chatIndex = null) {
  if (isMobileViewerOpen()) {
    void closeMobileViewer();
  } else {
    void openMobileViewer(chatIndex, false, false);
  }
}
