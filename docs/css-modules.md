# CSS Modules 가이드

이 문서는 CSS Modules를 사용하여 스타일 충돌을 방지하고 스코프를 격리하는 방법을 설명합니다.

## 📋 목차

- [CSS Modules란?](#css-modules란)
- [프로젝트의 CSS 구조](#프로젝트의-css-구조)
- [CSS Modules 사용하기](#css-modules-사용하기)
- [전역 스타일 작성하기](#전역-스타일-작성하기)
- [Webpack 설정](#webpack-설정)
- [Best Practices](#best-practices)

---

## CSS Modules란?

CSS Modules는 **CSS 클래스명을 자동으로 고유하게 만들어** 스타일 충돌을 방지하는 기술입니다.

### 기존 CSS의 문제점

```css
/* component-a.css */
.button {
  color: red;
}

/* component-b.css */
.button {
  color: blue;  /* 충돌 발생! */
}
```

### CSS Modules의 해결책

```css
/* component-a.module.css */
.button {
  color: red;
}
/* 실제 생성되는 클래스: component-a__button--a1b2c */

/* component-b.module.css */
.button {
  color: blue;
}
/* 실제 생성되는 클래스: component-b__button--d3e4f */
```

**결과**: 클래스명이 고유해져서 충돌이 발생하지 않습니다! ✅

---

## 프로젝트의 CSS 구조

```
src/ui/styles/
├── index.js                # 스타일 레지스트리 (중앙 관리)
├── global.css              # 전역 스타일 (CSS Modules 아님)
├── variables.css           # CSS 변수 정의
└── components/
    ├── button.module.css   # 버튼 컴포넌트 스타일
    ├── dialog.module.css   # 다이얼로그 스타일
    └── card.module.css     # 카드 스타일
```

### 스타일 레지스트리 시스템

모든 CSS 파일은 `src/ui/styles/index.js`에서 중앙 관리됩니다.

```javascript
// src/ui/styles/index.js
import "./global.css";                    // 전역 스타일
import "./variables.css";                 // CSS 변수
import buttonStyles from "./components/button.module.css";
import dialogStyles from "./components/dialog.module.css";

export { buttonStyles, dialogStyles };
```

### 메인 엔트리에서 로드

```javascript
// src/index.js
import "./ui/styles"; // 모든 스타일 자동 로드
```

---

## CSS Modules 사용하기

### 1단계: CSS Module 파일 생성

**파일명 규칙**: `*.module.css` (반드시 `.module.css`로 끝나야 함)

```css
/* src/ui/styles/components/button.module.css */

.button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.primary {
  background-color: #3b82f6;
  color: white;
}

.secondary {
  background-color: #e5e7eb;
  color: #374151;
}

.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### 2단계: JavaScript에서 Import

```javascript
// src/ui/components/ui/custom-button.js
import styles from "../../styles/components/button.module.css";

export class CustomButton extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    const type = this.getAttribute('type') || 'primary';
    const disabled = this.hasAttribute('disabled');

    // CSS Modules 클래스 사용
    this.innerHTML = `
      <button
        class="${styles.button} ${styles[type]} ${disabled ? styles.disabled : ''}"
      >
        ${this.getAttribute('label') || 'Button'}
      </button>
    `;
  }
}
```

### 3단계: 사용

```html
<custom-button label="클릭하세요" type="primary"></custom-button>
<custom-button label="취소" type="secondary"></custom-button>
<custom-button label="비활성" disabled></custom-button>
```

### 생성되는 HTML

```html
<button class="button__button--a1b2c button__primary--d3e4f">
  클릭하세요
</button>
```

클래스명이 자동으로 고유하게 변환됩니다!

---

## 전역 스타일 작성하기

전역으로 적용되어야 하는 스타일은 일반 `.css` 파일로 작성합니다.

### global.css

```css
/* src/ui/styles/global.css */

/* Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Body */
body {
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.5;
}

/* 전역 유틸리티 클래스 */
.hidden {
  display: none !important;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### variables.css (CSS Custom Properties)

```css
/* src/ui/styles/variables.css */

:root {
  /* Colors */
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
  --color-success: #10b981;
  --color-danger: #ef4444;
  --color-warning: #f59e0b;

  /* Gray Scale */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;

  /* Spacing */
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-5: 20px;
  --spacing-6: 24px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

### CSS 변수 사용

```css
/* src/ui/styles/components/card.module.css */

.card {
  padding: var(--spacing-4);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  background: white;
}

.cardTitle {
  color: var(--gray-900);
  font-size: 18px;
  font-weight: 600;
  margin-bottom: var(--spacing-2);
}

.cardContent {
  color: var(--gray-600);
  font-size: 14px;
}
```

---

## Webpack 설정

### 현재 프로젝트의 CSS Modules 설정

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                auto: true,  // .module.css 파일만 CSS Modules로 처리
                localIdentName: '[name]__[local]--[hash:base64:5]',
                exportLocalsConvention: 'camelCase',
                namedExport: false,
              },
              importLoaders: 1,
            },
          },
        ],
      },
    ],
  },
};
```

### 설정 옵션 설명

#### **auto: true**
- `.module.css` 파일만 CSS Modules로 처리
- 일반 `.css` 파일은 전역 스타일로 처리

#### **localIdentName**
- 생성되는 클래스명 패턴
- `[name]__[local]--[hash:base64:5]`
  - `[name]`: 파일명
  - `[local]`: 원래 클래스명
  - `[hash]`: 고유 해시

예시:
```
button.module.css의 .primary
→ button__primary--a1b2c
```

#### **exportLocalsConvention: 'camelCase'**
- CSS 클래스를 camelCase로 변환

```css
/* button.module.css */
.primary-button { }
.secondary-button { }
```

```javascript
// JavaScript에서
import styles from './button.module.css';

styles.primaryButton   // ✅ camelCase
styles['primary-button'] // ✅ 원본도 사용 가능
```

#### **namedExport: false**
- Default export 사용

```javascript
// namedExport: false (현재 설정)
import styles from './button.module.css';
console.log(styles.button);

// namedExport: true인 경우
import { button } from './button.module.css';
console.log(button);
```

---

## Best Practices

### 1. 파일 네이밍

#### ✅ **권장**
```
button.module.css
dialog.module.css
card.module.css
```

#### ❌ **비권장**
```
Button.module.css  (대문자 시작)
buttonModule.css   (.module이 중간에)
button.css         (.module 누락 - 전역 스타일로 처리됨)
```

### 2. 클래스 네이밍

#### ✅ **권장: BEM 스타일**
```css
.card { }
.cardHeader { }
.cardTitle { }
.cardContent { }
.cardFooter { }
```

#### ✅ **권장: 상태 클래스**
```css
.button { }
.buttonPrimary { }
.buttonDisabled { }
.buttonLoading { }
```

#### ❌ **비권장**
```css
.btn { }  /* 너무 짧음 */
.b { }    /* 의미 불명확 */
.button-primary { }  /* kebab-case (camelCase 권장) */
```

### 3. 컴포지션 (재사용)

CSS Modules에서 다른 클래스 상속:

```css
/* button.module.css */
.button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.primary {
  composes: button;
  background-color: #3b82f6;
  color: white;
}

.secondary {
  composes: button;
  background-color: #e5e7eb;
  color: #374151;
}
```

JavaScript에서:
```javascript
styles.primary  // "button__button--a1b2c button__primary--d3e4f"
```

### 4. 전역 클래스와 혼용

CSS Modules 내에서 전역 클래스 사용:

```css
/* dialog.module.css */
.dialog {
  /* Module 클래스 */
}

:global(.hidden) {
  /* 전역 클래스 */
  display: none;
}

.dialog :global(.custom-class) {
  /* Module 클래스 안에 전역 클래스 */
}
```

### 5. 레지스트리 패턴

모든 스타일을 중앙에서 관리:

```javascript
// src/ui/styles/index.js
import "./global.css";
import "./variables.css";

import buttonStyles from "./components/button.module.css";
import dialogStyles from "./components/dialog.module.css";
import cardStyles from "./components/card.module.css";

export {
  buttonStyles,
  dialogStyles,
  cardStyles
};
```

사용:
```javascript
import { buttonStyles, dialogStyles } from '../styles';

console.log(buttonStyles.primary);
console.log(dialogStyles.header);
```

---

## 🎯 CSS Modules vs 다른 방식

### CSS Modules
✅ **장점**:
- 클래스명 충돌 방지
- 간단한 설정
- 표준 CSS 문법 사용

❌ **단점**:
- 빌드 도구 필요
- 동적 클래스명 생성 어려움

### Inline Styles
✅ **장점**:
- 빌드 도구 불필요
- 완전한 스코프 격리

❌ **단점**:
- 미디어 쿼리 불가
- Pseudo-classes 불가
- 코드 가독성 저하

### Styled Components
✅ **장점**:
- JavaScript에서 스타일 관리
- 동적 스타일 생성 용이

❌ **단점**:
- 런타임 오버헤드
- 추가 라이브러리 필요

### CSS-in-JS (Emotion 등)
✅ **장점**:
- 강력한 동적 스타일
- TypeScript 지원

❌ **단점**:
- 번들 크기 증가
- 러닝 커브

---

## 📚 추가 리소스

- **[CSS Modules GitHub](https://github.com/css-modules/css-modules)**: 공식 저장소
- **[css-loader 문서](https://webpack.js.org/loaders/css-loader/)**: Webpack CSS Loader
- **[개발 가이드](development-guide.md)**: Web Components 개발 가이드
- **[배포 가이드](how_to_publish.md)**: npm 배포 가이드
