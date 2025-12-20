import { RisuAPI } from './risu-api.js';

import { PLUGIN_NAME } from '../constants.js';

/**
 * 플러그인 스크립트 파싱 (script-updater.js 로직 재사용)
 * @param {string} scriptContent - unpkg에서 fetch한 스크립트 내용
 * @returns {Object} 파싱된 플러그인 데이터
 */
export function parsePluginScript(scriptContent) {
  const splitedJs = scriptContent.split('\n');

  let name = '';
  let displayName = undefined;
  let arg = {};
  let realArg = {};
  let customLink = [];

  for (const line of splitedJs) {
    // V1 플러그인 체크 (지원하지 않음)
    if (line.startsWith('//@risu-name') || line.startsWith('//@risu-display-name')) {
      throw new Error('V1 plugin is not supported. Please use V2 plugin.');
    }

    // name 파싱
    if (line.startsWith('//@name')) {
      const provided = line.slice(7).trim();
      if (provided === '') {
        throw new Error('Plugin name must be longer than 0');
      }
      name = provided;
    }

    // display-name 파싱
    if (line.startsWith('//@display-name')) {
      const provided = line.slice('//@display-name'.length + 1).trim();
      if (provided === '') {
        throw new Error('Plugin display name must be longer than 0');
      }
      displayName = provided;
    }

    // link 파싱
    if (line.startsWith('//@link')) {
      const link = line.split(' ')[1];
      if (!link || link === '') {
        throw new Error('Plugin link is empty');
      }
      if (!link.startsWith('https')) {
        throw new Error('Plugin link must start with https');
      }
      const hoverText = line.split(' ').slice(2).join(' ').trim();
      customLink.push({
        link: link,
        hoverText: hoverText || undefined,
      });
    }

    // arg 파싱
    if (line.startsWith('//@risu-arg') || line.startsWith('//@arg')) {
      const provided = line.trim().split(' ');
      const provKey = provided[1];

      if (provided[2] !== 'int' && provided[2] !== 'string') {
        throw new Error(`Unknown argument type: ${provided[2]}`);
      }

      if (provided[2] === 'int') {
        arg[provKey] = 'int';
        realArg[provKey] = 0;
      } else if (provided[2] === 'string') {
        arg[provKey] = 'string';
        realArg[provKey] = '';
      }
    }
  }

  if (name.length === 0) {
    throw new Error('Plugin name not found');
  }

  return {
    name: name,
    script: scriptContent,
    realArg: realArg,
    arguments: arg,
    displayName: displayName,
    version: 2,
    customLink: customLink,
  };
}

export function scriptUpdater(parsed) {
  // 3. RisuAPI 싱글톤 인스턴스에서 getDatabase(), setDatabaseLite 가져오기
  const risuAPI = RisuAPI.getInstance();
  if (!risuAPI) {
    throw new Error('RisuAPI is not initialized. Please ensure the plugin is loaded.');
  }

  // 4. 기존 플러그인 찾기 및 백업
  const db = risuAPI.getDatabase();
  const oldPluginIndex = db.plugins.findIndex(p => p.name === PLUGIN_NAME);
  const backup = oldPluginIndex >= 0 ? { ...db.plugins[oldPluginIndex] } : null;

  console.log('[UpdateManager] Old plugin found:', oldPluginIndex >= 0, backup?.name);

  // 5. realArg 병합 (기존 값 보존 + 새 key 추가)
  const mergedRealArg = mergeRealArgs(backup?.realArg, parsed.arguments);

  // 6. 새 플러그인 데이터 생성
  const newPlugin = {
    ...parsed,
    realArg: mergedRealArg,
  };

  console.log('[UpdateManager] New plugin data prepared:', newPlugin.name, newPlugin.displayName);

  // 7. DB 업데이트
  if (oldPluginIndex >= 0) {
    db.plugins[oldPluginIndex] = newPlugin;
    console.log('[UpdateManager] Replaced existing plugin at index', oldPluginIndex);
  } else {
    db.plugins.push(newPlugin);
    console.log('[UpdateManager] Added new plugin');
  }

  // 8. 저장 및 오류 처리
  try {
    risuAPI.setDatabaseLite(db);
    console.log('[UpdateManager] Database saved successfully');
    return { success: true };
  } catch (saveError) {
    console.error('[UpdateManager] Database save failed:', saveError);
    // 롤백
    if (backup && oldPluginIndex >= 0) {
      db.plugins[oldPluginIndex] = backup;
      console.log('[UpdateManager] Rolled back to previous plugin');
    } else if (oldPluginIndex === -1) {
      db.plugins.pop();
      console.log('[UpdateManager] Removed newly added plugin');
    }
    return { success: false, error: saveError };
  }
}

/**
 * realArg 병합 (기존 값 보존 + 새 key 추가)
 * @param {Object} oldRealArg - 기존 플러그인의 realArg
 * @param {Object} newArguments - 새 플러그인의 arguments
 * @returns {Object} 병합된 realArg
 */
function mergeRealArgs(oldRealArg, newArguments) {
  const merged = {};

  // 새 arguments를 기준으로 순회
  for (const [key, type] of Object.entries(newArguments)) {
    // 기존 값이 있으면 보존, 없으면 기본값
    if (oldRealArg && key in oldRealArg) {
      merged[key] = oldRealArg[key]; // 기존 사용자 입력 값 보존
    } else {
      // 새로 추가된 arg는 기본값
      merged[key] = type === 'int' ? 0 : '';
    }
  }

  return merged;
}
