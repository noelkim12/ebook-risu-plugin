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
    const risuAPI = RisuAPI.getInstance(globalThis.__pluginApis__);
    const initialized = await risuAPI.initialize();

    if (!initialized) {
      console.error(`[${PLUGIN_NAME}] Failed to initialize RisuAPI`);
      return;
    }

    checkForUpdates({ silent: true }).catch(err => {
      console.warn('[App] Update check failed:', err);
    });

    // Svelte 앱 마운트를 위한 컨테이너 생성
    const container = document.createElement('div');
    container.id = `${PLUGIN_NAME}-root`;
    document.body.appendChild(container);

    // Svelte 5 방식으로 앱 마운트
    const app = mount(App, {
      target: container,
    });

    console.log(`${PLUGIN_NAME} v${PLUGIN_VERSION} loaded`);

    risuAPI.onUnload(() => {
      unmount(app);
      container.remove();
    });
  } catch (error) {
    console.error(`[${PLUGIN_NAME}] Initialization failed:`, error);
  }
})();
