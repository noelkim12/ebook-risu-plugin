const DEBUG_LOGS = [];

function debugLog(...args) {
  const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' ');
  console.log(`[E-Book Viewer] ${msg}`);
  DEBUG_LOGS.push(`[${new Date().toISOString()}] ${msg}`);
  // 최근 100개만 유지
  if (DEBUG_LOGS.length > 100) DEBUG_LOGS.shift();
  // window에 노출해서 개발자 도구에서 확인 가능
  globalThis.__ebookViewerLogs__ = DEBUG_LOGS;
}

// 전역으로 노출해서 다른 모듈에서도 사용 가능
globalThis.__debugLog__ = debugLog;

debugLog('Plugin script loading...');

import { mount, unmount } from 'svelte';

import { PLUGIN_NAME, PLUGIN_VERSION } from './constants.js';
import { RisuAPI } from './core/risu-api.js';
import App from './App.svelte';
import { readChatMessages } from './core/chat-reader.js';

// 애플리케이션 실행
(async () => {
  if (__DEV_MODE__) {
    import('./core/dev-reload.js')
      .then(({ initHotReload }) => {
        initHotReload();
        console.log(`[${PLUGIN_NAME}] 🔥 Hot Reload enabled`);
      })
      .catch(error => {
        console.warn('[App] Hot reload initialization failed:', error);
      });
  }

  try {
    const risuAPI = RisuAPI.getInstance();
    const initialized = await risuAPI.initialize();

    if (!initialized) {
      console.error(`[${PLUGIN_NAME}] Failed to initialize RisuAPI`);
      return;
    }

    const container = document.createElement('div');
    container.id = `${PLUGIN_NAME}-root`;
    let app = null;
    let observer = null;

    const mountApp = async () => {
      if (!app) {
        app = mount(App, {
          target: container,
        });
      }
      if (!container.isConnected) {
        document.body.appendChild(container);
      }
    };

    risuai.registerButton(
      {
        name: 'E-Book Viewer',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
        iconType: 'html',
        location: 'action',
      },
      async () => {
        debugLog('Button clicked!');
        risuai.showContainer('fullscreen');
        await mountApp();
        debugLog('App mounted');

        // Read chat data and show viewer
        const messages = await readChatMessages();
        debugLog('readChatMessages returned:', messages.length, 'messages');

        if (messages.length === 0) {
          debugLog('No messages found, aborting');
          return;
        }

        // Log first few messages for debugging
        messages.slice(0, 3).forEach((m, i) => {
          debugLog(`Message ${i}:`, 'role=', m.role, 'index=', m.index, 'html length=', m.html?.length || 0);
        });

        const lastMessage = messages[messages.length - 1];
        const chatData = {
          chatHtml: lastMessage.html,
          chatMessages: messages,
          chatIndex: lastMessage.index ?? messages.length - 1,
        };
        debugLog('chatData prepared:', 'chatHtml length=', chatData.chatHtml?.length || 0, 'chatIndex=', chatData.chatIndex);

        if (app && typeof app.showViewer === 'function') {
          debugLog('Calling showViewer');
          app.showViewer(chatData);
        } else {
          debugLog('ERROR: app or showViewer not available', 'app=', !!app, 'showViewer=', typeof app?.showViewer);
        }
      },
    );

    const rootDoc = await risuai.getRootDocument();
    const rootBody = await rootDoc.querySelector('body');
    if (rootBody) {
      observer = await risuai.createMutationObserver(async () => {});
      await observer.observe(rootBody, {
        childList: true,
        subtree: true,
      });
    }

    const cleanup = async () => {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      if (app) {
        unmount(app);
        app = null;
      }
      if (container.isConnected) {
        container.remove();
      }
    };

    if (typeof risuai.onUnload === 'function') {
      risuai.onUnload(cleanup);
    } else {
      risuAPI.onUnload(cleanup);
    }

    debugLog(`${PLUGIN_NAME} v${PLUGIN_VERSION} loaded successfully`);
    debugLog('Access logs via: window.__ebookViewerLogs__');
  } catch (error) {
    console.error(`[${PLUGIN_NAME}] Initialization failed:`, error);
  }
})();
