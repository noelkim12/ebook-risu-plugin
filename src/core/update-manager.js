import { mount, unmount } from 'svelte';
import { safeMount, safeUnmount } from '../utils/svelte-helper.js';
import { parsePluginScript, scriptUpdater } from './script-updater.js';
import { PLUGIN_NAME, PLUGIN_VERSION } from '../constants.js';
import { showAlert, showLoading } from '../ui/components/dialogHelpers.js';
import UpdateDialog from '../ui/components/UpdateDialog.svelte';
/**
 * unpkg에서 최신 버전의 메타데이터를 파싱
 * @returns {Promise<Object|null>} manifest 객체 또는 null
 */
async function fetchLatestManifest() {
  try {
    const url = `https://unpkg.com/${PLUGIN_NAME}@latest/dist/${PLUGIN_NAME}.js`;

    // HEAD 요청으로 redirect된 최종 URL 확인
    const headResponse = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
    });

    // 실제 resolved 버전 확인 (예: https://unpkg.com/cdn-test1@0.2.0/dist/cdn_test1.js)
    const resolvedUrl = headResponse.url;
    const versionMatch = resolvedUrl.match(/@([\d.]+)\//);

    if (!versionMatch) {
      throw new Error('Version not found in resolved URL');
    }

    const latestVersion = versionMatch[1];

    // 실제 파일 내용에서 배너 메타데이터 추출 (옵션)
    const content = await fetch(resolvedUrl).then(r => r.text());
    const bannerRegex =
      /\/\/@name (.+?)\n\/\/@display-name (.+?)\n\/\/@version (.+?)\n\/\/@description (.+?)(?:\n|$)/;
    const bannerMatch = content.match(bannerRegex);

    // 릴리즈 노트 가져오기
    const notesUrl = `https://unpkg.com/${PLUGIN_NAME}@${latestVersion}/dist/release-notes.json`;
    let releaseData = {};

    try {
      const notesResponse = await fetch(notesUrl);
      if (notesResponse.ok) {
        const allNotes = await notesResponse.json();
        releaseData = allNotes[latestVersion] || {};
      }
    } catch (error) {
      console.warn('[UpdateManager] Failed to fetch release notes:', error);
    }

    return {
      version: latestVersion,
      url: resolvedUrl,
      name: bannerMatch?.[1]?.trim() || PLUGIN_NAME,
      displayName:
        bannerMatch?.[2]?.trim() || `${PLUGIN_NAME}_v${latestVersion}`,
      description: bannerMatch?.[4]?.trim() || '',
      mandatory: releaseData.mandatory || false,
      notes: releaseData.notes || [],
      released_at: releaseData.released_at || new Date().toISOString(),
    };
  } catch (error) {
    // npm에 publish되지 않은 경우 정상적으로 fetch 실패할 수 있음
    console.log(
      `[${PLUGIN_NAME}] Update check skipped: Plugin not published to npm yet`,
    );
    return null;
  }
}

/**
 * 버전 비교 (semver 기반)
 * @param {string} v1 - 비교할 버전 1
 * @param {string} v2 - 비교할 버전 2
 * @returns {number} v1 > v2: 1, v1 < v2: -1, v1 === v2: 0
 */
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}

/**
 * 플러그인 스크립트 업데이트
 * @param {Object} manifest - fetchLatestManifest()로 가져온 매니페스트
 * @returns {Promise<Object>} {success: boolean, error?: Error}
 */
async function updatePluginScript(manifest) {
  try {
    // 1. unpkg에서 최신 스크립트 fetch
    console.log(
      '[UpdateManager] Fetching latest script from unpkg:',
      manifest.url,
    );
    const scriptContent = await fetch(manifest.url).then(r => r.text());

    // 2. 스크립트 파싱
    console.log('[UpdateManager] Parsing plugin script...');
    const parsed = parsePluginScript(scriptContent);

    return scriptUpdater(parsed);
  } catch (error) {
    console.error('[UpdateManager] Plugin update failed:', error);
    return { success: false, error };
  }
}

/**
 * 업데이트 확인 UI (Svelte 컴포넌트 사용)
 */
function confirmUpdate(opts) {
  const {
    name,
    currentVersion,
    manifest,
    i18n = {},
    mandatory = manifest.mandatory === true,
  } = opts;

  const t = Object.assign(
    {
      title: '플러그인 업데이트 준비 완료',
      primary: '지금 업데이트',
      later: '나중에',
      skip: '이번 버전 건너뛰기',
    },
    i18n,
  );

  return new Promise(resolve => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const component = mount(UpdateDialog, {
      target: container,
      props: {
        name: name || '',
        currentVersion,
        version: manifest.version,
        releasedAt: manifest.released_at || new Date().toISOString(),
        mandatory,
        notes: manifest.notes || [],
        i18n: t,
      },
    });

    // 이벤트 리스너 설정
    container.addEventListener('update-action', event => {
      const { action, skipVersion } = event.detail;

      // 결과 구성
      const result = { action };
      if (action === 'update') {
        result.url = manifest.url;
      } else if (action === 'skip') {
        result.skipVersion = skipVersion;
      }

      // 정리 및 resolve
      unmount(component);
      container.remove();
      resolve(result);
    });
  });
}

/**
 * Skip 버전 확인
 * @param {string} latestVersion - 최신 버전
 * @param {boolean} force - skip 버전 무시 여부
 * @param {boolean} silent - silent 모드
 * @returns {Object|null} skip된 경우 결과 객체, 아니면 null
 */
function checkSkippedVersion(latestVersion, force, silent) {
  if (force) return null;

  const skipKey = `${PLUGIN_NAME}_skip_version`;
  const skipVersion = localStorage.getItem(skipKey);

  if (skipVersion === latestVersion) {
    if (!silent) {
      console.log(
        `[UpdateManager] Version ${latestVersion} is skipped by user`,
      );
    }
    return { available: false, skipped: true, version: latestVersion };
  }

  return null;
}

/**
 * 버전 비교 및 업데이트 필요 여부 확인
 * @param {string} latestVersion - 최신 버전
 * @param {string} currentVersion - 현재 버전
 * @param {boolean} silent - silent 모드
 * @returns {Object|null} 업데이트 불필요한 경우 결과 객체, 필요하면 null
 */
function checkVersionUpdateNeeded(latestVersion, currentVersion, silent) {
  const comparison = compareVersions(latestVersion, currentVersion);

  if (comparison <= 0) {
    if (!silent) {
      console.log(`[UpdateManager] Already up to date (${currentVersion})`);
    }
    return {
      available: false,
      current: currentVersion,
      latest: latestVersion,
    };
  }

  return null;
}

/**
 * 업데이트 실행 및 처리
 * @param {Object} manifest - 매니페스트
 * @param {string} latestVersion - 최신 버전
 * @returns {Promise<Object>} 업데이트 결과
 */
async function executeUpdate(manifest, latestVersion) {
  console.log('[UpdateManager] Updating to version', latestVersion);

  // 업데이트 스크립트 실행
  const updateResult = await updatePluginScript(manifest);

  if (updateResult.success) {
    console.log('[UpdateManager] Plugin script updated successfully');

    // 3초간 로딩 다이얼로그 표시 (스크립트 적용 시간 확보)
    await showLoading('업데이트를 적용하고 있습니다...', 4000);

    // 업데이트 완료 알림 및 새로고침
    await showAlert(
      `업데이트가 완료되었습니다.\n\n업데이트된 스크립트를 적용하기 위해\n페이지를 새로고침해야합니다.
      \n안정적인 업데이트를 위해 충분한 시간을 두고\n수동으로 새로고침해 주세요.`,
    );
    return { available: true, action: 'updated', version: latestVersion };
  }

  console.error('[UpdateManager] Plugin update failed:', updateResult.error);
  alert(
    `업데이트 실패: ${updateResult.error?.message || '알 수 없는 오류'}\n\n페이지를 새로고침하여 다시 시도해주세요.`,
  );
  return {
    available: true,
    action: 'update_failed',
    error: updateResult.error,
  };
}

/**
 * 사용자 액션 결과 처리
 * @param {Object} result - confirmUpdate 결과
 * @param {Object} manifest - 매니페스트
 * @param {string} latestVersion - 최신 버전
 * @returns {Promise<Object>} 처리 결과
 */
async function handleUserAction(result, manifest, latestVersion) {
  if (result.action === 'update') {
    return await executeUpdate(manifest, latestVersion);
  }

  if (result.action === 'skip') {
    const skipKey = `${PLUGIN_NAME}_skip_version`;
    localStorage.setItem(skipKey, result.skipVersion);
    console.log('[UpdateManager] Skipped version', result.skipVersion);
    return {
      available: true,
      action: 'skipped',
      version: result.skipVersion,
    };
  }

  console.log('[UpdateManager] Update postponed');
  return { available: true, action: 'later', version: latestVersion };
}

/**
 * 업데이트 체크 및 사용자 확인
 * @param {Object} options - 옵션
 * @param {boolean} [options.silent=false] - silent 모드 (로그 최소화)
 * @param {boolean} [options.force=false] - skip 버전 무시
 * @param {Object} [options.i18n={}] - 다국어 텍스트
 * @returns {Promise<Object>} 업데이트 결과
 */
export async function checkForUpdates(options = {}) {
  const { silent = false, force = false, i18n = {} } = options;

  try {
    const manifest = await fetchLatestManifest();

    if (!manifest) {
      // npm에 publish되지 않은 경우 조용히 스킵
      return { available: false, skipped: true };
    }

    const currentVersion = PLUGIN_VERSION;
    const latestVersion = manifest.version;

    // Skip 버전 확인
    const skipResult = checkSkippedVersion(latestVersion, force, silent);
    if (skipResult) return skipResult;

    // 버전 비교
    const versionResult = checkVersionUpdateNeeded(
      latestVersion,
      currentVersion,
      silent,
    );
    if (versionResult) return versionResult;

    console.log(
      `[UpdateManager] New version available: ${currentVersion} → ${latestVersion}`,
    );

    // 사용자 확인 UI 표시
    const result = await confirmUpdate({
      name: PLUGIN_NAME,
      currentVersion,
      manifest,
      i18n,
    });

    // 결과 처리
    return await handleUserAction(result, manifest, latestVersion);
  } catch (error) {
    console.error('[UpdateManager] Check failed:', error);
    return { available: false, error: error.message };
  }
}

export { confirmUpdate };
