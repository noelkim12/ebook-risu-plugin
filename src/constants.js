/**
 * 빌드 타임 상수 (webpack DefinePlugin으로 주입)
 * 개발 환경(webpack 없이 직접 실행)을 위한 fallback 제공
 */
export const PLUGIN_NAME = typeof __PLUGIN_NAME__ !== 'undefined' ? __PLUGIN_NAME__ : `z-lint-test`;

export const PLUGIN_VERSION =
  typeof __PLUGIN_VERSION__ !== 'undefined' ? __PLUGIN_VERSION__ : '0.0.1';

export const PLUGIN_DESCRIPTION =
  typeof __PLUGIN_DESCRIPTION__ !== 'undefined'
    ? __PLUGIN_DESCRIPTION__
    : `z-lint-test for RISU AI`;

export const RANDOM_HASH = '';

/**
 * 외부 스크립트 목록
 * NPM에 등록되지 않은 스크립트를 별도로 등록할 때 사용
 * 외부 스크립트를 사용하기 위해서는 모듈 로드 후 해당 모듈을 사용하는 파일에서 사용할 수 있도록 설정해야 함
 * @type {Array<{src: string, global: string}>}
 * @param {string} src - 스크립트 URL
 * @param {string} global - 스크립트를 사용할 수 있도록 설정할 전역 변수 이름
 */
export const EXTERNAL_SCRIPTS = [
  /* 
  {
    src: "https://cdn.jsdelivr.net/npm/idb@8/build/umd.js",
    global: "idb"
  },
  {
    src: "https://cdn.jsdelivr.net/npm/winbox@0.2.82/dist/winbox.bundle.min.js",
    global: "WinBox"
  }
   */
];
