import './ui/styles'; // Style Registry
import { mount, unmount } from 'svelte';

import { PLUGIN_NAME, PLUGIN_VERSION } from './constants.js';
import { RisuAPI } from './core/risu-api.js';
import { checkForUpdates } from './core/update-manager.js';
import App from './App.svelte';

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

    checkForUpdates({ silent: true }).catch(err => {
      console.warn('[App] Update check failed:', err);
    });

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
        risuai.showContainer('fullscreen');
        await mountApp();
      },
    );

    const rootDoc = risuai.getRootDocument();
    const rootBody = rootDoc.querySelector('body');
    if (rootBody) {
      observer = risuai.createMutationObserver(async () => {});
      observer.observe(rootBody, {
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

    console.log(`${PLUGIN_NAME} v${PLUGIN_VERSION} loaded`);
  } catch (error) {
    console.error(`[${PLUGIN_NAME}] Initialization failed:`, error);
  }
})();
