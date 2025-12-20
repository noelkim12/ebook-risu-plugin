/**
 * Case 변환 유틸리티 함수 (ESM 버전)
 */

/**
 * kebab-case, snake_case 등을 camelCase로 변환
 * @param {string} str - 변환할 문자열
 * @returns {string} camelCase로 변환된 문자열
 * @example
 * toCamelCase('cdn-test1') => 'cdnTest1'
 * toCamelCase('cdn_test1') => 'cdnTest1'
 * toCamelCase('CdnTest1') => 'cdnTest1'
 */
export function toCamelCase(str) {
  if (!str) return str;

  return (
    str
      // kebab-case와 snake_case를 구분자로 분리
      .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
      // 첫 글자를 소문자로 (이미 대문자로 시작하는 경우 처리)
      .replace(/^[A-Z]/, char => char.toLowerCase())
  );
}

/**
 * camelCase, kebab-case 등을 snake_case로 변환
 * @param {string} str - 변환할 문자열
 * @returns {string} snake_case로 변환된 문자열
 * @example
 * toSnakeCase('cdnTest1') => 'cdn_test1'
 * toSnakeCase('cdn-test1') => 'cdn_test1'
 * toSnakeCase('CdnTest1') => 'cdn_test1'
 */
export function toSnakeCase(str) {
  if (!str) return str;

  return (
    str
      // 첫 글자를 소문자로 변환
      .replace(/^[A-Z]/, char => char.toLowerCase())
      // 대문자 앞에 언더스코어 추가하고 소문자로 변환
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      // kebab-case를 snake_case로 변환
      .replaceAll('-', '_')
  );
}

/**
 * camelCase, snake_case 등을 kebab-case로 변환
 * @param {string} str - 변환할 문자열
 * @returns {string} kebab-case로 변환된 문자열
 * @example
 * toKebabCase('cdnTest1') => 'cdn-test1'
 * toKebabCase('cdn_test1') => 'cdn-test1'
 * toKebabCase('CdnTest1') => 'cdn-test1'
 */
export function toKebabCase(str) {
  if (!str) return str;

  return (
    str
      // 첫 글자를 소문자로 변환
      .replace(/^[A-Z]/, char => char.toLowerCase())
      // 대문자 앞에 하이픈 추가하고 소문자로 변환
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      // snake_case를 kebab-case로 변환
      .replaceAll('_', '-')
  );
}
