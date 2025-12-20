/**
 * Style Registry
 * 모든 CSS 스타일을 여기서 중앙 관리합니다.
 */

// 전역 스타일 (폰트 CDN)
import './global.css';

// CSS Modules (자동으로 스코프 적용됨)
import baseStyles from './base.module.css';
import updateDialogStyles from './update-dialog.module.css';

// CSS Modules를 사용하는 컴포넌트에서 import 가능하도록 export
export { baseStyles, updateDialogStyles };
