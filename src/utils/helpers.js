/**
 * HTML 이스케이프 함수
 * @param {string} s - 이스케이프할 문자열
 * @returns {string} 이스케이프된 문자열
 */
export const escapeHTML = (s = '') =>
  s.replace(
    /[&<>'"]/g,
    m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[m],
  );

/**
 * URL 파싱 함수
 * @returns {Object} { path: string, params: Object }
 */
export function parseHash() {
  const h = location.hash.replace(/^#/, '') || '/';
  const parts = h.split('/').filter(Boolean); // ["edit","3"] 또는 []
  if (parts.length === 0) return { path: '/', params: {} };
  if (parts[0] === 'edit' && parts[1])
    return { path: '/edit/:id', params: { id: Number(parts[1]) } };
  return { path: '/', params: {} };
}
