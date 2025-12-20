# 개발 가이드

이 문서는 Risu Plugin SDK 세부 개발 가이드입니다.

## 📋 목차

- [Web Components 아키텍처](#web-components-아키텍처)
- [컴포넌트 레지스트리 시스템](#컴포넌트-레지스트리-시스템)
- [새 컴포넌트 작성하기](#새-컴포넌트-작성하기)
- [RisuAPI 사용하기](#risuapi-사용하기)
- [Plugin Args 시스템](#plugin-args-시스템)
- [IndexedDB 사용하기](#indexeddb-사용하기)
- [자동 업데이트 시스템](#자동-업데이트-시스템)

---

## Web Components 아키텍처

이 프로젝트는 **Web Components (Custom Elements)**를 사용하여 재사용 가능한 UI 컴포넌트를 구현합니다.

### 핵심 개념

#### **Custom Elements**
표준 HTML 엘리먼트처럼 사용할 수 있는 커스텀 태그를 정의합니다.

```javascript
class MyButton extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<button>Click me!</button>`;
  }
}

customElements.define('my-button', MyButton);
```

사용:
```html
<my-button></my-button>
```

#### **Shadow DOM (선택사항)**
스타일과 DOM의 캡슐화를 제공합니다.

```javascript
class MyButton extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        button { color: blue; }
      </style>
      <button>Click me!</button>
    `;
  }
}
```

### 프로젝트의 Web Components 구조

```
src/ui/components/
├── index.js                    # 컴포넌트 레지스트리 (중앙 관리)
├── main.js                     # 메인 앱 컴포넌트
├── ui/                         # UI 컴포넌트
│   └── menu-button.js          # 메뉴 버튼
└── updateManager/              # 업데이트 매니저
    ├── update-dialog.js        # 업데이트 다이얼로그
    └── alert-dialog.js         # 알림 다이얼로그
```

---

## 컴포넌트 레지스트리 시스템

모든 Custom Elements는 `src/ui/components/index.js`에서 중앙 관리됩니다.

### 현재 구조

```javascript
// src/ui/components/index.js
export * from "./ui/menu-button.js";
export * from "./updateManager/update-dialog.js";
export * from "./updateManager/alert-dialog.js";
```

### 장점

#### ✅ **중앙 집중 관리**
- 모든 컴포넌트를 한 곳에서 확인 가능
- 의존성 관리 용이

#### ✅ **index.js 깔끔 유지**
- 메인 엔트리 포인트에 import 누적 방지
- 단 하나의 import문으로 모든 컴포넌트 로드

```javascript
// src/index.js
import "./ui/components"; // 이것만으로 모든 컴포넌트 등록
```

#### ✅ **Tree-shaking 지원** 
- 사용하지 않는 컴포넌트 자동 제거
- 번들 크기 최적화

#### ✅ **재사용성**
- 태그로 선언적 사용 가능
- 다른 프로젝트로 쉽게 이식

---

## 새 컴포넌트 작성하기

### 1단계: 컴포넌트 파일 생성

```javascript
// src/ui/components/modal/confirm-dialog.js

/**
 * Confirm Dialog Component
 *
 * @example
 * const dialog = document.createElement('confirm-dialog');
 * dialog.setAttribute('message', '정말 삭제하시겠습니까?');
 * dialog.addEventListener('confirm', () => { ... });
 * document.body.appendChild(dialog);
 */
export class ConfirmDialog extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  disconnectedCallback() {
    this.cleanup();
  }

  // Attributes to observe
  static get observedAttributes() {
    return ['message', 'confirm-text', 'cancel-text'];
  }

  // Called when observed attribute changes
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  render() {
    const message = this.getAttribute('message') || '확인하시겠습니까?';
    const confirmText = this.getAttribute('confirm-text') || '확인';
    const cancelText = this.getAttribute('cancel-text') || '취소';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 9999;
        }

        .dialog {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 24px;
          border-radius: 8px;
          min-width: 300px;
        }

        .message {
          margin-bottom: 16px;
        }

        .buttons {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .confirm {
          background: #3b82f6;
          color: white;
        }

        .cancel {
          background: #e5e7eb;
        }
      </style>

      <div class="dialog">
        <div class="message">${message}</div>
        <div class="buttons">
          <button class="cancel">${cancelText}</button>
          <button class="confirm">${confirmText}</button>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const confirmBtn = this.shadowRoot.querySelector('.confirm');
    const cancelBtn = this.shadowRoot.querySelector('.cancel');

    confirmBtn.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('confirm'));
      this.remove();
    });

    cancelBtn.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('cancel'));
      this.remove();
    });
  }

  cleanup() {
    // 이벤트 리스너 정리 등
  }
}

// Custom Element 등록
const ELEMENT_TAG = "confirm-dialog";
if (!customElements.get(ELEMENT_TAG)) {
  customElements.define(ELEMENT_TAG, ConfirmDialog);
}

// 태그 이름 export (다른 곳에서 사용)
export { ELEMENT_TAG };
```

### 2단계: 레지스트리에 등록

```javascript
// src/ui/components/index.js에 한 줄 추가
export * from "./modal/confirm-dialog.js";
```

### 3단계: 사용

```javascript
// 어디서든 사용 가능
const dialog = document.createElement("confirm-dialog");
dialog.setAttribute("message", "정말 삭제하시겠습니까?");

dialog.addEventListener("confirm", () => {
  console.log("삭제 확인");
});

dialog.addEventListener("cancel", () => {
  console.log("취소");
});

document.body.appendChild(dialog);
```

---

## RisuAPI 사용하기

RisuAPI는 RisuAI의 플러그인 API를 래핑한 싱글톤 클래스입니다.

### 초기화

```javascript
import { RisuAPI } from "./core/risu-api.js";

const risuAPI = RisuAPI.getInstance(globalThis.__pluginApis__);
await risuAPI.initialize();
```

### 주요 메서드

#### **데이터베이스 접근**

```javascript
// 데이터베이스 가져오기
const db = risuAPI.getDatabase();

// 데이터베이스 저장 (전체)
risuAPI.setDatabase(db);

// 데이터베이스 저장 (경량 - IndexedDB만)
risuAPI.setDatabaseLite(db);
```

#### **플러그인 인자 (Args)**

```javascript
// 인자 가져오기
const value = risuAPI.getArg('key');

// 인자 저장하기
risuAPI.setArg('key', 'value');
```

#### **언로드 핸들러**

```javascript
risuAPI.onUnload(() => {
  console.log('플러그인 언로드됨');
  // 정리 작업
});
```

---

## Plugin Args 시스템

플러그인 설정값을 자동으로 관리하는 시스템입니다.

### 1단계: plugin-args.json 정의

```json
{
  "args": [
    {
      "name": "apiKey",
      "type": "string",
      "default": "",
      "description": "API 키"
    },
    {
      "name": "maxTokens",
      "type": "int",
      "default": 4096,
      "description": "최대 토큰 수"
    }
  ]
}
```

### 2단계: 자동 생성된 Config 사용

Webpack 빌드 시 `src/core/plugin-config.js`가 자동으로 생성됩니다.

```javascript
import { PluginArgs } from './core/plugin-config.js';

const args = new PluginArgs();

// Getter
const apiKey = args.apiKey;
const maxTokens = args.maxTokens;

// Setter
args.apiKey = 'your-api-key';
args.maxTokens = 8192;

// Cache 관리
args.invalidate('apiKey');  // 특정 키 캐시 무효화
args.clearCache();           // 전체 캐시 초기화
```

### 자동 생성된 코드

```javascript
// 자동 생성됨 - 직접 수정하지 마세요!
export class PluginArgs {
  get apiKey() {
    return this._get('apiKey', "");
  }

  set apiKey(value) {
    if (typeof value !== 'string') {
      throw new TypeError('apiKey must be a string');
    }
    this._set('apiKey', value);
  }

  get maxTokens() {
    return this._get('maxTokens', 4096);
  }

  set maxTokens(value) {
    if (typeof value !== 'number') {
      throw new TypeError('maxTokens must be a number');
    }
    this._set('maxTokens', value);
  }
}
```

---

## IndexedDB 사용하기

이미지 등 대용량 데이터를 클라이언트에 저장할 때 사용합니다. LocalStorage(5-10MB)보다 훨씬 큰 용량을 지원합니다.

### 기본 사용법

```javascript
import { storage } from './core/image-storage.js';

// 데이터 저장
await storage.save('logo', imageBlob);

// 데이터 불러오기
const blob = await storage.get('logo');

// 데이터 삭제
await storage.delete('logo');

// 모든 데이터 조회
const allData = await storage.getAll();
```

### 📚 상세 가이드

IndexedDB에 대한 자세한 내용은 **[IndexedDB 가이드](indexeddb-guide.md)**를 참조하세요:

- 전체 CRUD 메서드 (save, get, delete, getAll, clear, has, count 등)
- 실전 예제 (이미지 업로드, 사용자 설정, 캐시 시스템, 갤러리 등)
- 커스텀 스토어 생성 방법
- 고급 기능 (트랜잭션, 커서, 인덱스, 버전 관리)
- Best Practices (에러 처리, 용량 관리, 압축 등)

---

## 자동 업데이트 시스템

unpkg CDN을 통해 최신 버전을 자동으로 감지하고 업데이트합니다.

### 업데이트 체크

```javascript
import { checkForUpdates } from './core/update-manager.js';

// Silent 모드 (로그 최소화)
checkForUpdates({ silent: true });

// 강제 체크 (skip 버전 무시)
checkForUpdates({ force: true });

// 다국어 지원
checkForUpdates({
  i18n: {
    title: "Update Available",
    primary: "Update Now",
    later: "Later",
    skip: "Skip This Version"
  }
});
```

### 동작 흐름

```
1. unpkg에서 latest 버전 체크
   ↓
2. 현재 버전과 비교
   ↓
3. 업데이트 가능 시 다이얼로그 표시
   ↓
4. 사용자 확인
   ↓
5. 새 스크립트 다운로드
   ↓
6. parsePluginScript + scriptUpdater 실행
   ↓
7. 페이지 리로드
```

### 릴리즈 노트 표시

릴리즈 노트는 `dist/release-notes.json`에서 자동으로 로드됩니다.

```json
{
  "0.6.9": {
    "version": "0.6.9",
    "notes": ["fix: 로그인 에러 해결"],
    "released_at": "2024-11-02T00:00:00.000Z",
    "mandatory": false
  }
}
```

---

## 📚 추가 리소스

- **[IndexedDB 가이드](indexeddb-guide.md)**: IndexedDB 사용법 및 실전 예제
- **[CSS Modules 가이드](css-modules.md)**: CSS Modules 사용법
- **[배포 가이드](how_to_publish.md)**: npm 배포 및 릴리즈 프로세스
- **[Web Components MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components)**: Web Components 공식 문서
- **[idb 라이브러리](https://github.com/jakearchibald/idb)**: IndexedDB 래퍼 라이브러리
