# RisuAI Plugin API v2.1 → v3.0 Migration

## TL;DR

> **Quick Summary**: Migrate the risu-ebooklike-viewer plugin from deprecated API v2.1 to v3.0's sandboxed iframe model. The core architectural shift: build the entire viewer UI inside the plugin's iframe (full DOM access), use `showContainer('fullscreen')` for display, and read chat content from the host DOM via SafeDocument API.
> 
> **Deliverables**:
> - Fully working e-book viewer plugin running on API v3.0
> - PC viewer (two-page spread) + Mobile viewer (single page + swipe)
> - Settings persistence via pluginStorage
> - Chat content reading via SafeDocument DOM scraping
> - Floating action button trigger via registerButton()
> 
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 5 waves
> **Critical Path**: Build Config → V3 API Wrapper → Entry Point → App.svelte → Viewer Components → Build & QA

---

## Context

### Original Request
사용자의 이북 스타일 뷰어 플러그인이 RisuAI의 API 변경(v2.0 차단)으로 작동하지 않게 됨. rfp/pluginv3/plugins/migrationGuide.md를 기반으로 v3.0으로 마이그레이션하여 플러그인 복구.

### Interview Summary
**Key Discussions**:
- 하위 호환성: v3.0 전용 (v2.1 지원 불필요, 별도 브랜치로 보존)
- 기능 범위: 전체 기능 일괄 마이그레이션 (PC/Mobile 뷰어, 설정, LB모듈, 채팅 네비게이션)
- SmallBookButton (메시지별 버튼): v3에서 제거 — registerButton()은 글로벌 버튼만 지원
- 헤더 액션 버튼 (복사/삭제/리롤): v3에서 제거 — SafeElement에 dispatchEvent() 없음
- 채팅 콘텐츠 읽기: SafeDocument DOM 스크래핑 — RisuAI 내부 처리(regex/lua)로 인해 렌더링된 HTML 사용
- 테스트: 없음 (QA 시나리오만)

**Research Findings**:
- V3는 postMessage RPC 기반 iframe 샌드박싱 — 플러그인이 독립 iframe에서 실행
- `showContainer('fullscreen')`: iframe을 전체화면으로 표시 가능 → 뷰어 UI를 iframe 내부에서 렌더링
- iframe 내부에서는 표준 DOM API 완전 사용 가능 (createElement, style, getBoundingClientRect 등)
- SafeDocument: querySelector, querySelectorAll, createElement, getInnerHTML, textContent 등 제공
- SafeElement 제약: 속성은 x- 접두사만, HTML은 DOMPurify 새니타이징, 이벤트 타입 제한
- 빌드 시스템(Vite UMD)은 v3 호환 — 배너만 변경

### Metis Review
**Identified Gaps** (addressed):
- SmallBookButton 불가: registerButton()은 글로벌만 → 사용자 결정: 제거
- 헤더 액션 dispatchEvent 불가 → 사용자 결정: 제거
- 채팅 읽기 방식 결정 필요 → SafeDocument DOM 스크래핑
- BookButton 위치 변경 → registerButton({location: 'action'}) 플로팅 액션 버튼
- 설정 저장소 → pluginStorage (iframe에서 유일하게 보장되는 영속 저장소)

---

## Work Objectives

### Core Objective
API v2.1에서 v3.0으로 마이그레이션하여 플러그인을 다시 작동시킨다. Iframe-native 아키텍처로 전환하되, 기존 기능(뷰어, 설정, 네비게이션)을 최대한 보존한다.

### Concrete Deliverables
- `dist/risu-ebooklike-viewer.js` — v3.0 API로 빌드된 단일 플러그인 파일
- PC 이북 뷰어: 양면 펼침 + 페이지 네비게이션 + 설정
- Mobile 이북 뷰어: 단일 페이지 + 스와이프 + 설정
- 채팅 콘텐츠 읽기 (SafeDocument)
- 새 채팅 감지 (createMutationObserver)
- 설정 영속화 (pluginStorage)
- LB 모듈 지원

### Definition of Done
- [ ] `npm run build` 성공
- [ ] 빌드 결과물의 첫 줄이 `//@api 3.0` 포함
- [ ] RisuAI v3 환경에서 플러그인 로드 가능
- [ ] 플로팅 액션 버튼으로 뷰어 열기 가능
- [ ] PC: 양면 펼침 + 페이지 이동 동작
- [ ] Mobile: 단일 페이지 + 스와이프 동작
- [ ] 설정 변경 및 저장/로드 동작

### Must Have
- v3.0 API 선언 (`//@api 3.0`)
- 모든 API 호출 async/await
- iframe 내부 뷰어 렌더링
- SafeDocument를 통한 채팅 콘텐츠 읽기
- createMutationObserver를 통한 채팅 변경 감지
- registerButton()을 통한 트리거 버튼
- pluginStorage를 통한 설정 영속화

### Must NOT Have (Guardrails)
- `globalThis.__pluginApis__` 직접 접근 금지 — `risuai.*` 사용
- 호스트 `document.*` 직접 접근 금지 — `risuai.getRootDocument()` 사용
- `new MutationObserver()` 직접 생성 금지 — `risuai.createMutationObserver()` 사용
- SmallBookButton (메시지별 버튼) — v3에서 제거
- 헤더 액션 버튼 (복사/삭제/리롤) — v3에서 제거
- dispatchEvent() 사용 금지 — SafeElement에서 미지원
- `localStorage` 직접 접근 금지 — `pluginStorage` 사용
- 신규 기능 추가 금지 — 기존 기능 마이그레이션만

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: None
- **Framework**: none

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Build verification**: Use Bash — `npm run build`, check output file
- **Code pattern audit**: Use Grep/AST-grep — verify no forbidden patterns remain
- **Lint check**: Use Bash — `npm run lint`

---

### SafeElement Compatibility Reference (CRITICAL)

> When accessing HOST DOM elements via `risuai.getRootDocument()`, all returned elements
> are SafeElement instances with RESTRICTED APIs. This table maps common patterns to SafeElement equivalents.
> **IFRAME-internal DOM** (the viewer's own document) uses STANDARD DOM — no restrictions.

| Standard DOM (v2.1) | SafeElement (v3.0) | Notes |
|---|---|---|
| `el.innerHTML` | `el.getInnerHTML()` | Returns actual content |
| `el.innerHTML = '...'` | `el.setInnerHTML('...')` | DOMPurify sanitized! |
| `el.innerText` | `el.innerText()` | Method, not property |
| `el.textContent` | `el.textContent()` | Method, not property |
| `el.children` | `el.getChildren()` | Returns SafeElement[] |
| `el.parentElement` | `el.getParent()` | Returns SafeElement |
| `el.style.color = 'red'` | `el.setStyle('color', 'red')` | |
| `el.style.color` (read) | `el.getStyle('color')` | Inline style only |
| `el.classList.add('x')` | `el.addClass('x')` | |
| `el.classList.remove('x')` | `el.removeClass('x')` | |
| `el.classList.contains('x')` | `el.hasClass('x')` | |
| `el.className` | `el.getClassName()` | |
| `el.getAttribute('x-foo')` | `el.getAttribute('x-foo')` | x- prefix ONLY! |
| `el.getAttribute('data-xxx')` | ❌ **NOT POSSIBLE** | Only x- prefix allowed |
| `el.dataset.xxx` | ❌ **NOT POSSIBLE** | Use x- prefix alternative |
| `getComputedStyle(el)` | ❌ **NOT AVAILABLE** | Only inline style via getStyle() |
| `el.closest('.selector')` | ❌ **NOT AVAILABLE** | Use getParent() loop |
| `el.scrollIntoView()` | ❌ **NOT AVAILABLE** | |
| `el.offsetHeight` | ❌ **NOT AVAILABLE** | Use clientHeight() or getBoundingClientRect() |
| `el.scrollHeight` | ❌ **NOT AVAILABLE** | |
| `el.id` | `el.querySelector('#id')` from parent | Direct id access unclear |
| `el.nodeName` | `el.nodeName()` | Method |
| `el.addEventListener(type, fn)` | `await el.addEventListener(type, fn)` | Returns listenerId. Restricted event types! |
| `el.removeEventListener(type, fn)` | `el.removeEventListener(type, listenerId)` | Uses listenerId, not fn ref |
| `new MutationObserver(fn)` | `risuai.createMutationObserver(fn)` | Returns SafeElement mutations |

**Allowed events (unlimited)**: click, dblclick, contextmenu, mousedown, mouseup, mousemove, mouseover, mouseleave, pointer*, scroll, scrollend
**Allowed events (with random delay)**: keydown, keyup, keypress
**BLOCKED events**: input, change, focus, blur, submit, resize, load, error, transitionend, animationend

**IMPORTANT**: page-manager.js and text-splitter*.js operate on IFRAME DOM (content already extracted), so they use STANDARD DOM and are NOT subject to these restrictions.

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — foundation, MAX PARALLEL):
├── Task 1: Build config update (vite.config.js banner) [quick]
├── Task 2: V3 API Wrapper rewrite (risu-api.js) [deep]
├── Task 3: Settings Manager migration (pluginStorage) [unspecified-high]
├── Task 4: Constants & shared types review [quick]
└── Task 5: IDB Storage iframe assessment [quick]

Wave 2 (After Wave 1 — entry point & core utils):
├── Task 6: Entry Point rewrite (index.js) [deep]
├── Task 7: App.svelte iframe-native restructure [unspecified-high]
├── Task 8: Selector module → SafeDocument [unspecified-high]
├── Task 9: Svelte/DOM helpers simplification [quick]
└── Task 10: Chat content reader module [deep]

Wave 3 (After Wave 2 — viewer components, MAX PARALLEL):
├── Task 11: PC Viewer core adaptation [unspecified-high]
├── Task 12: PC sub-components adaptation [unspecified-high]
├── Task 13: Mobile Viewer core adaptation [unspecified-high]
├── Task 14: Mobile sub-components adaptation [unspecified-high]
├── Task 15: Shared components (Toast, Loading) [quick]
└── Task 16: Remove deprecated features [quick]

Wave 4 (After Wave 3 — integration & build):
├── Task 17: Full build & error resolution [deep]
├── Task 18: Forbidden pattern audit [unspecified-high]
└── Task 19: CSS/Font loading verification [quick]

Wave FINAL (After ALL — independent review, 4 parallel):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)

Critical Path: T1 → T2 → T6 → T7 → T10 → T11/T13 → T17 → F1-F4
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 6 (Waves 1 & 3)
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| 1 | — | 6, 17 | 1 |
| 2 | — | 6, 7, 8, 10 | 1 |
| 3 | — | 7, 11, 13 | 1 |
| 4 | — | 6 | 1 |
| 5 | — | 3 | 1 |
| 6 | 1, 2, 4 | 7, 8, 9, 10 | 2 |
| 7 | 2, 3, 6 | 11, 13 | 2 |
| 8 | 2, 6 | 10, 11, 13 | 2 |
| 9 | 6 | 11, 13, 15 | 2 |
| 10 | 2, 8 | 11, 13 | 2 |
| 11 | 7, 8, 9, 10 | 12, 17 | 3 |
| 12 | 11 | 17 | 3 |
| 13 | 7, 8, 9, 10 | 14, 17 | 3 |
| 14 | 13 | 17 | 3 |
| 15 | 9 | 17 | 3 |
| 16 | — | 17 | 3 |
| 17 | 11-16 | 18, 19, F1-F4 | 4 |
| 18 | 17 | F1 | 4 |
| 19 | 17 | F3 | 4 |

### Agent Dispatch Summary

- **Wave 1**: **5** — T1 → `quick`, T2 → `deep`, T3 → `unspecified-high`, T4 → `quick`, T5 → `quick`
- **Wave 2**: **5** — T6 → `deep`, T7 → `unspecified-high`, T8 → `unspecified-high`, T9 → `quick`, T10 → `deep`
- **Wave 3**: **6** — T11 → `unspecified-high`, T12 → `unspecified-high`, T13 → `unspecified-high`, T14 → `unspecified-high`, T15 → `quick`, T16 → `quick`
- **Wave 4**: **3** — T17 → `deep`, T18 → `unspecified-high`, T19 → `quick`
- **FINAL**: **4** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

> Implementation tasks follow. EVERY task has: Agent Profile + Parallelization + QA Scenarios.
> A task WITHOUT QA Scenarios is INCOMPLETE.

---

### Wave 1 — Foundation (Start Immediately)

- [x] 1. Build Config Update

  **What to do**:
  - Open `vite.config.js`
  - In the `viteBannerPlugin()` function, change the banner from `//@api 2.1` to `//@api 3.0`
  - Verify no other API version references exist in build config
  - Run `npm run build` to confirm output starts with `//@api 3.0`

  **Must NOT do**:
  - Change any other build configuration (output format, plugins, etc.)
  - Modify source code in this task

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single-line change in config file
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4, 5)
  - **Blocks**: Tasks 6, 17
  - **Blocked By**: None

  **References**:
  - `vite.config.js` — Find the `viteBannerPlugin()` function that generates the banner string with `//@api 2.1`
  - `rfp/pluginv3/plugins/migrationGuide.md:16-24` — API version declaration syntax (`//@api 3.0`)
  - `rfp/pluginv3/plugins/plugins.svelte.ts:191-193` — How RisuAI parses the `//@api` header from plugin code

  **Acceptance Criteria**:

  **QA Scenarios:**
  ```
  Scenario: Build output contains v3.0 API declaration
    Tool: Bash
    Steps:
      1. Run `npm run build`
      2. Run `head -5 dist/risu-ebooklike-viewer.js`
      3. Assert output contains `//@api 3.0`
      4. Assert output does NOT contain `//@api 2.1` or `//@api 2.0`
    Expected Result: First 5 lines of build output include `//@api 3.0`
    Failure Indicators: Build fails, or API version is not 3.0
    Evidence: .sisyphus/evidence/task-1-build-api-version.txt
  ```

  **Commit**: YES
  - Message: `refactor(config): update plugin API version to 3.0`
  - Files: `vite.config.js`
  - Pre-commit: `npm run build`

---

- [x] 2. V3 API Wrapper Rewrite (risu-api.js)

  **What to do**:
  - Completely rewrite `src/core/risu-api.js` to wrap the v3 `risuai` global object
  - All methods must be async (return Promises)
  - Remove `globalThis.__pluginApis__` initialization pattern
  - The `risuai` object is available as a global in the iframe context — use it directly
  - Maintain the singleton pattern but adapt constructor to v3:
    - `constructor()` — no `pluginApis` parameter needed, just use `risuai` global
    - All methods delegate to `risuai.*` async APIs
  - Key method mappings:
    - `getChar()` → `await risuai.getCharacter()`
    - `setChar(char)` → `await risuai.setCharacter(char)`
    - `getArg(name)` → `await risuai.getArgument(name)`
    - `setArg(name, value)` → `await risuai.setArgument(name, value)`
    - `getDatabase()` → `await risuai.getDatabase()`
    - `setDatabaseLite(db)` → `await risuai.setDatabaseLite(db)`
    - `risuFetch(url, arg)` → `await risuai.risuFetch(url, arg)`
    - `nativeFetch(url, arg)` → `await risuai.nativeFetch(url, arg)`
    - `addProvider(...)` → `await risuai.addProvider(...)`
    - `addRisuScriptHandler(...)` → `await risuai.addRisuScriptHandler(...)`
    - `removeRisuScriptHandler(...)` → `await risuai.removeRisuScriptHandler(...)`
    - `addRisuReplacer(...)` → `await risuai.addRisuReplacer(...)`
    - `removeRisuReplacer(...)` → `await risuai.removeRisuReplacer(...)`
    - `onUnload(func)` → `await risuai.onUnload(func)`
  - Keep convenience methods (subscribeToChar, subscribeToDatabase, getAllCurrentChatMessages, etc.) but adapt to async
  - subscribeToChar/subscribeToDatabase: polling still works but `getChar/getDatabase` calls must be awaited
  - Add new v3-specific methods:
    - `getRootDocument()` → `risuai.getRootDocument()` (returns SafeDocument)
    - `showContainer(mode)` → `risuai.showContainer(mode)`
    - `hideContainer()` → `risuai.hideContainer()`
    - `registerButton(config, callback)` → `risuai.registerButton(config, callback)`
    - `createMutationObserver(callback)` → `risuai.createMutationObserver(callback)`

  **Must NOT do**:
  - Reference `globalThis.__pluginApis__` anywhere
  - Use synchronous API calls (all must be async/await)
  - Change the public interface signature beyond what's necessary for async

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Core module rewrite requiring careful API mapping and async conversion
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4, 5)
  - **Blocks**: Tasks 6, 7, 8, 10
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/core/risu-api.js` — Current implementation to rewrite (the entire file)
  - `rfp/pluginv3/plugins/migrationGuide.md:127-199` — v3 API key changes and method signatures
  - `rfp/pluginv3/plugins/migrationGuide.md:508-514` — `risuai.getDatabase()` async pattern
  - `rfp/pluginv3/plugins/migrationGuide.md:651-699` — Complete v3 plugin example

  **API/Type References**:
  - `rfp/pluginv3/plugins/apiV3/risuai.d.ts` — V3 TypeScript definitions for all `risuai.*` methods
  - `rfp/pluginv3/plugins/migrationGuide.md:144-171` — Legacy APIs from v2.1 maintained in v3
  - `rfp/pluginv3/plugins/migrationGuide.md:173-198` — New v3 APIs (getCharacter, getArgument, container, etc.)

  **Acceptance Criteria**:

  **QA Scenarios:**
  ```
  Scenario: No v2.1 API patterns remain in risu-api.js
    Tool: Bash (grep)
    Steps:
      1. Run `grep -n 'globalThis.__pluginApis__' src/core/risu-api.js`
      2. Run `grep -n 'pluginApis' src/core/risu-api.js`
      3. Assert both return empty (no matches)
    Expected Result: Zero occurrences of v2.1 patterns
    Failure Indicators: Any match found
    Evidence: .sisyphus/evidence/task-2-no-v2-patterns.txt

  Scenario: All public methods are async
    Tool: Bash (grep)
    Steps:
      1. Run `grep -n 'async ' src/core/risu-api.js | wc -l`
      2. Verify all API-wrapping methods (getChar, setChar, getDatabase, etc.) are async
      3. Run `grep -n 'risuai\.' src/core/risu-api.js` to confirm delegation to risuai global
    Expected Result: All API methods use async and delegate to risuai.*
    Evidence: .sisyphus/evidence/task-2-async-methods.txt
  ```

  **Commit**: YES
  - Message: `refactor(core): rewrite risu-api wrapper for v3 async API`
  - Files: `src/core/risu-api.js`

---

- [x] 3. Settings Manager Migration (pluginStorage)

  **What to do**:
  - Rewrite `src/core/viewer/settings-manager.js` to use `pluginStorage` instead of `localStorage`
  - Note: `pluginStorage` is SYNCHRONOUS in v3 (unlike other risuai APIs) — check migrationGuide
    - `pluginStorage.getItem(key)`, `pluginStorage.setItem(key, value)`, etc.
    - Access via `risuai.pluginStorage`
  - Update `loadSettings()`: read from `risuai.pluginStorage.getItem(SETTINGS_KEY)`
  - Update `saveSettings()`: write to `risuai.pluginStorage.setItem(SETTINGS_KEY, value)`
  - Remove all `localStorage.getItem/setItem/removeItem` calls
  - Keep the same settings data structure (font size, line height, theme, font, custom CSS)
  - Also check if there are CSS variable injections via `document.documentElement.style.setProperty`
    - These should now target the iframe's own `document.documentElement` (standard DOM inside iframe — OK as-is)

  **Must NOT do**:
  - Use `localStorage` directly
  - Use `safeLocalStorage` (pluginStorage is preferred for cross-device sync)
  - Change settings data structure

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Storage migration requires understanding both old and new API surfaces
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4, 5)
  - **Blocks**: Tasks 7, 11, 13
  - **Blocked By**: None

  **References**:
  - `src/core/viewer/settings-manager.js` — Current implementation with localStorage calls (ENTIRE file)
  - `rfp/pluginv3/plugins/migrationGuide.md:88-96` — pluginStorage API (getItem, setItem, removeItem, clear, keys, length)
  - `rfp/pluginv3/plugins/migrationGuide.md:163` — pluginStorage in v3 (save file-specific, syncable)
  - `rfp/pluginv3/plugins/plugins.svelte.ts:694-730` — pluginStorage implementation (synchronous read/write to pluginCustomStorage)

  **Acceptance Criteria**:

  **QA Scenarios:**
  ```
  Scenario: No direct localStorage usage remains
    Tool: Bash (grep)
    Steps:
      1. Run `grep -rn 'localStorage' src/core/viewer/settings-manager.js`
      2. Assert zero matches
    Expected Result: No direct localStorage references
    Evidence: .sisyphus/evidence/task-3-no-localstorage.txt

  Scenario: Settings use pluginStorage API
    Tool: Bash (grep)
    Steps:
      1. Run `grep -n 'pluginStorage' src/core/viewer/settings-manager.js`
      2. Assert matches for getItem and setItem calls
    Expected Result: pluginStorage.getItem and pluginStorage.setItem are used
    Evidence: .sisyphus/evidence/task-3-pluginstorage-usage.txt
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `refactor(core): migrate settings storage to pluginStorage`
  - Files: `src/core/viewer/settings-manager.js`

---

- [x] 4. Constants & Shared Types Review

  **What to do**:
  - Review `src/constants.js` for any API-version-dependent values
  - Check if PLUGIN_NAME or other constants need updates
  - Verify no v2.1-specific constants exist (e.g., API version strings)
  - If there are type definitions or shared interfaces, ensure compatibility with v3 async patterns

  **Must NOT do**:
  - Add new features or change plugin behavior

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple review and minor updates
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 5)
  - **Blocks**: Task 6
  - **Blocked By**: None

  **References**:
  - `src/constants.js` — Plugin constants (read entire file)
  - `src/core/risu-api.js` — Current imports from constants

  **QA Scenarios:**
  ```
  Scenario: Constants file has no v2.1-specific values
    Tool: Bash (grep)
    Steps:
      1. Run `grep -rn 'v2\|2\.1\|2\.0\|__pluginApis__' src/constants.js`
      2. Assert zero matches for deprecated version references
    Expected Result: No v2.x references in constants
    Evidence: .sisyphus/evidence/task-4-constants-clean.txt
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `refactor(core): review and update constants for v3`
  - Files: `src/constants.js`

---

- [x] 5. IDB Storage Iframe Assessment

  **What to do**:
  - Review `src/core/idb-storage.js` to understand current IndexedDB usage
  - Determine if IndexedDB is accessible inside v3's sandboxed iframe
    - The iframe has `allow-scripts` and `allow-modals` but NOT `allow-same-origin`
    - Without `allow-same-origin`, IndexedDB may be blocked or ephemeral
  - If IndexedDB doesn't work in iframe:
    - Option A: Replace with pluginStorage (if data is small enough)
    - Option B: Remove caching entirely (simplify)
    - Option C: Use in-memory cache only (lost on plugin reload)
  - Document the decision and implement the chosen approach
  - The current usage is for caching — not critical data, so degradation is acceptable

  **Must NOT do**:
  - Use direct IndexedDB without testing iframe compatibility
  - Break existing functionality if cache is unavailable

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Assessment + conditional simple replacement
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 4)
  - **Blocks**: Task 3 (informs storage strategy)
  - **Blocked By**: None

  **References**:
  - `src/core/idb-storage.js` — Current IndexedDB implementation (ENTIRE file)
  - `rfp/pluginv3/plugins/apiV3/factory.ts` — Iframe sandbox attributes (search for 'sandbox')
  - `rfp/pluginv3/plugins/migrationGuide.md:480` — Iframe isolation security model

  **QA Scenarios:**
  ```
  Scenario: IDB storage module handles iframe restrictions gracefully
    Tool: Bash (grep)
    Steps:
      1. Read `src/core/idb-storage.js`
      2. Verify it either: (a) has try-catch for IndexedDB access failure, or (b) is replaced with alternative
      3. Run `grep -n 'indexedDB\|openDB\|idb' src/core/idb-storage.js`
    Expected Result: Module gracefully handles unavailable IndexedDB
    Evidence: .sisyphus/evidence/task-5-idb-assessment.txt
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `refactor(core): adapt IDB storage for iframe sandbox`
  - Files: `src/core/idb-storage.js`

---

### Wave 2 — Entry Point & Core Utils (After Wave 1)

- [x] 6. Entry Point Rewrite (index.js)

  **What to do**:
  - Completely rewrite `src/index.js` for v3 iframe execution model
  - REMOVE:
    - `RisuAPI.getInstance(globalThis.__pluginApis__)` initialization
    - `document.body.appendChild(container)` host DOM injection
    - Direct MutationObserver creation on host document
  - ADD:
    - Initialize RisuAPI singleton (now uses `risuai` global internally)
    - Register floating action button: `risuai.registerButton({name: 'E-Book Viewer', icon: '<svg>...</svg>', iconType: 'html', location: 'action'}, openViewer)`
    - Set up chat change detection via `risuai.createMutationObserver()` on host DOM body
    - The Svelte app mounts inside the iframe's own `document.body` (standard DOM)
    - When action button clicked: mount/show viewer + `risuai.showContainer('fullscreen')`
    - Export a cleanup function for `risuai.onUnload()`
  - Wrap everything in `(async () => { ... })()` as shown in migration guide

  **Must NOT do**:
  - Access `globalThis.__pluginApis__`
  - Append elements to host document.body
  - Use `new MutationObserver()` directly

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Core entry point rewrite with complex initialization logic
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (sequential after Wave 1)
  - **Parallel Group**: Wave 2 (with Tasks 7, 8, 9, 10)
  - **Blocks**: Tasks 7, 8, 9, 10
  - **Blocked By**: Tasks 1, 2, 4

  **References**:

  **Pattern References**:
  - `src/index.js` — Current entry point (ENTIRE file — to be rewritten)
  - `rfp/pluginv3/plugins/migrationGuide.md:651-699` — Complete v3 plugin example (initialization pattern)
  - `rfp/pluginv3/plugins/migrationGuide.md:415-440` — registerButton() API with icon and location
  - `rfp/pluginv3/plugins/migrationGuide.md:388-408` — createMutationObserver() API

  **API References**:
  - `rfp/pluginv3/plugins/migrationGuide.md:199-209` — showContainer/hideContainer API
  - `rfp/pluginv3/plugins/migrationGuide.md:169` — onUnload() for cleanup
  - `rfp/pluginv3/plugins/apiV3/risuai.d.ts` — Full type definitions for all APIs

  **QA Scenarios:**
  ```
  Scenario: No v2.1 initialization patterns in entry point
    Tool: Bash (grep)
    Steps:
      1. Run `grep -n '__pluginApis__\|globalThis\.' src/index.js`
      2. Run `grep -n 'new MutationObserver' src/index.js`
      3. Assert both return empty
    Expected Result: Zero v2.1 patterns
    Evidence: .sisyphus/evidence/task-6-no-v2-entry.txt

  Scenario: V3 initialization patterns present
    Tool: Bash (grep)
    Steps:
      1. Run `grep -n 'registerButton\|showContainer\|createMutationObserver\|risuai\.' src/index.js`
      2. Assert matches for all three v3 APIs
    Expected Result: Entry point uses v3 APIs
    Evidence: .sisyphus/evidence/task-6-v3-entry.txt
  ```

  **Commit**: YES
  - Message: `refactor(core): rewrite entry point for v3 iframe execution`
  - Files: `src/index.js`

---

- [x] 7. App.svelte Iframe-Native Restructure

  **What to do**:
  - Restructure `src/App.svelte` for iframe-native rendering
  - REMOVE:
    - `safeMount()` calls that inject into host DOM (BookButton into input container)
    - `SmallBookButton` injection logic (feature removed in v3)
    - Direct `MutationObserver` on host `document.body`
    - Any direct host DOM manipulation
  - RESTRUCTURE:
    - App.svelte now renders INSIDE the iframe (standard Svelte mounting)
    - It should be the root component containing:
      - PC/Mobile viewer (conditionally shown based on device detection)
      - Settings panel
      - Toast notifications
    - Device detection: use iframe's `window.innerWidth` and `navigator.userAgent` (available in iframe)
    - The viewer starts hidden; shown when entry point calls a show function
    - Provide exported functions: `showViewer(chatData)`, `hideViewer()`, `updateContent(chatData)`
  - Chat content flow:
    - Entry point reads chat from host DOM via SafeDocument (Task 10)
    - Passes data to App.svelte as props or via a shared store
    - App.svelte renders the content in book format

  **Must NOT do**:
  - Mount anything into host DOM
  - Use SmallBookButton
  - Import or reference safeMount for host DOM injection

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Major component restructure with architectural implications
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (within Wave 2)
  - **Parallel Group**: Wave 2 (with Tasks 6, 8, 9, 10)
  - **Blocks**: Tasks 11, 13
  - **Blocked By**: Tasks 2, 3, 6

  **References**:
  - `src/App.svelte` — Current implementation (ENTIRE file)
  - `src/ui/components/BookButton.svelte` — Current trigger button (will be replaced by registerButton)
  - `src/ui/components/SmallBookButton.svelte` — Per-message button (TO BE REMOVED)
  - `src/utils/svelte-helper.js` — Current safeMount utility (to understand current mounting)
  - `rfp/pluginv3/plugins/migrationGuide.md:524-534` — Building UI inside iframe pattern

  **QA Scenarios:**
  ```
  Scenario: No host DOM injection in App.svelte
    Tool: Bash (grep)
    Steps:
      1. Run `grep -rn 'safeMount\|SmallBookButton\|BookButton' src/App.svelte`
      2. Run `grep -rn 'document\.body\|document\.querySelector' src/App.svelte`
      3. Assert both return empty
    Expected Result: No host DOM manipulation in App.svelte
    Evidence: .sisyphus/evidence/task-7-no-host-dom.txt
  ```

  **Commit**: YES (groups with Wave 2)
  - Message: `refactor(ui): restructure App.svelte for iframe-native rendering`
  - Files: `src/App.svelte`

---

- [x] 8. Selector Module → SafeDocument Queries

  **What to do**:
  - Rewrite `src/utils/selector.js` to use SafeDocument for host DOM queries
  - Current pattern: `document.querySelector('.some-risuai-class')` → direct HTMLElement
  - New pattern: `risuai.getRootDocument().querySelector('.some-risuai-class')` → SafeElement
  - Create a module that:
    - Gets SafeDocument reference once: `const rootDoc = risuai.getRootDocument()`
    - Provides selector functions that return SafeElement instances
    - Handles SafeElement API differences (e.g., `element.getInnerHTML()` instead of `element.innerHTML`)
  - Key selectors to preserve:
    - Chat container selector
    - Individual message selectors
    - Input container selector (for chat navigation)
    - Bot message detection
  - SafeElement method mapping for reading content:
    - `element.innerHTML` → `element.getInnerHTML()`
    - `element.innerText` → `element.innerText()` (it's a method in SafeElement)
    - `element.textContent` → `element.textContent()` (it's a method in SafeElement)
    - `element.children` → `element.getChildren()`
    - `element.parentElement` → `element.getParent()`
    - `element.classList.add()` → `element.addClass()`
    - `element.style.x = y` → `element.setStyle('x', 'y')`
  - ⚠️ **CRITICAL**: `element.getAttribute('data-xxx')` → NOT POSSIBLE (only x- prefix)
    - If current selectors use data-* attributes to identify elements, must use class-based or structural selectors instead
  - ⚠️ **CRITICAL**: `getComputedStyle(element)` → NOT AVAILABLE on SafeElement
    - If style inspection is needed, use `element.getStyle('prop')` for inline styles only
  - ⚠️ **CRITICAL**: `element.closest('.selector')` → NOT AVAILABLE
    - Implement manual traversal: `let p = el; while (p) { if (p.matches('.selector')) return p; p = p.getParent(); }`
  - ⚠️ `element.id` direct access → unclear in SafeElement, use querySelector from parent instead

  **Must NOT do**:
  - Use direct `document.querySelector` for host DOM (only for iframe's own DOM)
  - Assume SafeElement has same interface as HTMLElement

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: API surface translation requires careful mapping
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (within Wave 2)
  - **Parallel Group**: Wave 2 (with Tasks 6, 7, 9, 10)
  - **Blocks**: Tasks 10, 11, 13
  - **Blocked By**: Tasks 2, 6

  **References**:
  - `src/utils/selector.js` — Current selector implementations (ENTIRE file)
  - `rfp/pluginv3/plugins/migrationGuide.md:218-233` — DOM access via getRootDocument()
  - `rfp/pluginv3/plugins/migrationGuide.md:236-341` — SafeElement API (ALL methods listed)
  - `rfp/pluginv3/plugins/migrationGuide.md:369-387` — SafeDocument API (createElement, querySelector)
  - `rfp/pluginv3/plugins/migrationGuide.md:265-269` — Attribute restrictions (x- prefix only)

  **QA Scenarios:**
  ```
  Scenario: Selector module uses SafeDocument API
    Tool: Bash (grep)
    Steps:
      1. Run `grep -n 'getRootDocument\|risuai' src/utils/selector.js`
      2. Assert matches exist for SafeDocument usage
      3. Run `grep -n 'document\.querySelector' src/utils/selector.js`
      4. Assert zero direct document.querySelector calls (should use rootDoc)
    Expected Result: All host DOM queries go through SafeDocument
    Evidence: .sisyphus/evidence/task-8-safedocument-selectors.txt
  ```

  **Commit**: YES (groups with Wave 2)
  - Message: `refactor(utils): migrate selectors to SafeDocument API`
  - Files: `src/utils/selector.js`

---

- [x] 9. Svelte/DOM Helper Simplification

  **What to do**:
  - Simplify `src/utils/svelte-helper.js`:
    - Remove `safeMount()` for host DOM injection — no longer needed
    - Keep or simplify any utilities needed for iframe-internal Svelte mounting
    - Standard `mount()` from Svelte works normally inside iframe
  - Update `src/utils/dom-helper.js`:
    - Remove button cloning logic that depended on host DOM (`cloneNode`, `dispatchEvent`)
    - Remove header action button extraction — feature removed in v3
    - Keep any utilities needed for iframe-internal DOM operations
    - If the file becomes empty/trivial, consider removing it

  **Must NOT do**:
  - Keep dead code referencing host DOM manipulation
  - Keep SmallBookButton or header action related code

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Mostly deletion and simplification
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (within Wave 2)
  - **Parallel Group**: Wave 2 (with Tasks 6, 7, 8, 10)
  - **Blocks**: Tasks 11, 13, 15
  - **Blocked By**: Task 6

  **References**:
  - `src/utils/svelte-helper.js` — Current implementation (ENTIRE file)
  - `src/utils/dom-helper.js` — Current implementation (ENTIRE file)
  - `src/ui/components/BookButton.svelte` — To understand what safeMount was injecting

  **QA Scenarios:**
  ```
  Scenario: No host DOM injection utilities remain
    Tool: Bash (grep)
    Steps:
      1. Run `grep -rn 'safeMount\|cloneNode\|dispatchEvent' src/utils/svelte-helper.js src/utils/dom-helper.js`
      2. Assert zero matches for host DOM injection patterns
    Expected Result: Helper files contain only iframe-compatible utilities
    Evidence: .sisyphus/evidence/task-9-helpers-clean.txt
  ```

  **Commit**: YES (groups with Wave 2)
  - Message: `refactor(utils): simplify helpers for iframe context`
  - Files: `src/utils/svelte-helper.js`, `src/utils/dom-helper.js`

---

- [x] 10. Chat Content Reader Module

  **What to do**:
  - Create or adapt a module that reads chat content from host DOM via SafeDocument
  - This is the BRIDGE between host DOM (chat messages) and iframe (viewer rendering)
  - Implementation:
    - Get SafeDocument: `const rootDoc = risuai.getRootDocument()`
    - Find chat message elements using selectors from Task 8
    - For each message element:
      - Read rendered HTML via `element.getInnerHTML()` (preserves RisuAI's markdown/regex/lua processing)
      - Determine role (user/assistant) from element structure or classes
      - Extract message index information
    - Return structured array: `[{role, html, index}, ...]`
  - Also set up chat change detection:
    - Use `risuai.createMutationObserver()` to watch for new messages
    - When change detected, re-read and notify the viewer
  - Alternative approach if SafeDocument HTML reading is limited:
    - Use `risuai.getCharacter()` for structured data (role, raw text)
    - But PREFER DOM scraping for visual fidelity (user's explicit preference)

  **Must NOT do**:
  - Use direct `document.querySelector` for host DOM
  - Use `new MutationObserver()` directly
  - Modify host DOM elements

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Complex bridge module between host SafeDocument and iframe rendering
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (within Wave 2)
  - **Parallel Group**: Wave 2 (with Tasks 6, 7, 8, 9)
  - **Blocks**: Tasks 11, 13
  - **Blocked By**: Tasks 2, 8

  **References**:
  - `src/utils/selector.js` — Current selectors for finding chat elements (after Task 8 rewrites it)
  - `rfp/pluginv3/plugins/migrationGuide.md:218-233` — getRootDocument() and SafeDocument queries
  - `rfp/pluginv3/plugins/migrationGuide.md:291-303` — getInnerHTML(), getOuterHTML() (sanitized read)
  - `rfp/pluginv3/plugins/migrationGuide.md:388-408` — createMutationObserver() for change detection
  - `rfp/pluginv3/plugins/migrationGuide.md:256-262` — SafeElement textContent(), innerText()
  - `src/core/risu-api.js` — V3 wrapper methods (after Task 2 rewrites it)

  **QA Scenarios:**
  ```
  Scenario: Chat reader uses SafeDocument and createMutationObserver
    Tool: Bash (grep)
    Steps:
      1. Identify the chat content reader file (new or adapted)
      2. Run `grep -n 'getRootDocument\|getInnerHTML\|createMutationObserver' <file>`
      3. Assert matches for SafeDocument query and MutationObserver
      4. Run `grep -n 'document\.querySelector\|new MutationObserver' <file>`
      5. Assert zero direct DOM access
    Expected Result: Uses SafeDocument API exclusively for host DOM access
    Evidence: .sisyphus/evidence/task-10-chat-reader.txt
  ```

  **Commit**: YES (groups with Wave 2)
  - Message: `feat(core): add chat content reader via SafeDocument`
  - Files: `src/core/chat-reader.js` (new or adapted)

---

### Wave 3 — Viewer Components (After Wave 2, MAX PARALLEL)

- [ ] 11. PC Viewer Core Adaptation

  **What to do**:
  - Adapt `src/ui/components/viewer/pc/PCBookViewer.svelte` for iframe rendering:
    - The viewer already renders its own UI — inside the iframe this mostly works
    - Update how it receives chat content: from direct DOM reading → from chat-reader module (Task 10)
    - Remove any direct host DOM references
    - Update RisuAPI usage to async (await calls)
  - Adapt `src/ui/components/viewer/pc/viewerHelpers.js`:
    - `openViewer()`: Instead of creating overlay in host DOM, signal to show container via `risuai.showContainer('fullscreen')`
    - `closeViewer()`: Instead of removing overlay from host DOM, call `risuai.hideContainer()`
    - Remove body scroll locking on host DOM (iframe handles its own scrolling)
  - Update page rendering flow:
    - Receive chat HTML from chat-reader module
    - Pass to page-manager/text-splitter (these work inside iframe, no changes expected)
    - Render pages in iframe DOM (standard DOM)

  **Must NOT do**:
  - Access host document directly
  - Keep header action button logic
  - Modify text-splitter or page-manager internal logic (they work inside iframe)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Core viewer component adaptation with async API integration
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 12, 13, 14, 15, 16)
  - **Blocks**: Tasks 12, 17
  - **Blocked By**: Tasks 7, 8, 9, 10

  **References**:
  - `src/ui/components/viewer/pc/PCBookViewer.svelte` — Current PC viewer (ENTIRE file)
  - `src/ui/components/viewer/pc/viewerHelpers.js` — Open/close viewer logic
  - `src/core/viewer/pc/page-manager.js` — Page splitting (should work as-is in iframe)
  - `src/core/viewer/pc/text-splitter.js` — Text splitting (should work as-is in iframe)
  - `src/core/risu-api.js` — V3 API wrapper (after Task 2)

  **QA Scenarios:**
  ```
  Scenario: PC Viewer uses no direct host DOM access
    Tool: Bash (grep)
    Steps:
      1. Run `grep -rn 'document\.body\|document\.querySelector\|document\.createElement' src/ui/components/viewer/pc/PCBookViewer.svelte`
      2. Note: `document.createElement` inside iframe is OK, but check context
      3. Run `grep -rn 'showContainer\|hideContainer' src/ui/components/viewer/pc/viewerHelpers.js`
      4. Assert v3 container APIs are used
    Expected Result: Viewer uses v3 APIs for show/hide, no host DOM access
    Evidence: .sisyphus/evidence/task-11-pc-viewer-core.txt
  ```

  **Commit**: YES (groups with Wave 3)
  - Message: `refactor(ui): adapt PC viewer for iframe rendering`
  - Files: `src/ui/components/viewer/pc/PCBookViewer.svelte`, `src/ui/components/viewer/pc/viewerHelpers.js`

---

- [ ] 12. PC Sub-Components Adaptation

  **What to do**:
  - Adapt PC viewer sub-components for v3:
  - `BookHeader.svelte`:
    - REMOVE header action buttons (copy, delete, reroll, translate) — feature removed
    - Keep: chat title, chat index display, close button
    - Close button should call `risuai.hideContainer()` instead of DOM removal
  - `BookPages.svelte`:
    - Should work mostly as-is (renders inside iframe)
    - Update any RisuAPI calls to async
  - `NavControls.svelte`:
    - Chat index navigation: update to use async `risuAPI.getChar()` for chat data
    - Page navigation: works as-is (iframe internal)
  - `SettingsMenu.svelte` + `CustomCssModal.svelte`:
    - Update settings read/write to use async pluginStorage (from Task 3)
    - Font selector, theme selector, size controls — mostly UI, should work in iframe

  **Must NOT do**:
  - Keep header action button code
  - Keep dispatchEvent calls
  - Access host DOM directly

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Multiple related components need consistent updates
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 11, 13, 14, 15, 16)
  - **Blocks**: Task 17
  - **Blocked By**: Task 11

  **References**:
  - `src/ui/components/viewer/pc/BookHeader.svelte` — Header with action buttons to remove
  - `src/ui/components/viewer/pc/BookPages.svelte` — Page rendering
  - `src/ui/components/viewer/pc/NavControls.svelte` — Navigation + settings trigger
  - `src/ui/components/viewer/pc/SettingsMenu.svelte` — Settings dropdown
  - `src/ui/components/viewer/pc/CustomCssModal.svelte` — Custom CSS editor
  - `src/utils/dom-helper.js` — Previous button clone logic (now removed, after Task 9)

  **QA Scenarios:**
  ```
  Scenario: No header action buttons in PC viewer
    Tool: Bash (grep)
    Steps:
      1. Run `grep -rn 'dispatchEvent\|cloneNode\|headerAction\|actionButton' src/ui/components/viewer/pc/`
      2. Assert zero matches for action button patterns
    Expected Result: All header action button code removed
    Evidence: .sisyphus/evidence/task-12-pc-no-actions.txt
  ```

  **Commit**: YES (groups with Wave 3)
  - Message: `refactor(ui): adapt PC sub-components, remove header actions`
  - Files: `src/ui/components/viewer/pc/BookHeader.svelte`, `BookPages.svelte`, `NavControls.svelte`, `SettingsMenu.svelte`, `CustomCssModal.svelte`

---

- [ ] 13. Mobile Viewer Core Adaptation

  **What to do**:
  - Adapt `src/ui/components/viewer/mobile/MobileBookViewer.svelte` for iframe rendering:
    - Same approach as PC viewer (Task 11) but for mobile layout
    - Update chat content reception from chat-reader module
    - Remove direct host DOM references
    - Update RisuAPI usage to async
  - Adapt `src/ui/components/viewer/mobile/viewerHelpers.js`:
    - Same changes as PC version: showContainer/hideContainer
  - Touch handling (`src/core/viewer/mobile/touch-handler.js`):
    - Swipe gestures work inside iframe — should need minimal changes
    - Verify touch events attach to iframe elements (standard DOM)
  - Text splitting (`src/core/viewer/mobile/text-splitter-mobile.js`):
    - Works inside iframe — getBoundingClientRect is standard DOM

  **Must NOT do**:
  - Access host document directly
  - Keep header action button logic
  - Modify touch-handler internal logic unless necessary

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Core viewer adaptation, parallel with PC viewer work
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 11, 12, 14, 15, 16)
  - **Blocks**: Tasks 14, 17
  - **Blocked By**: Tasks 7, 8, 9, 10

  **References**:
  - `src/ui/components/viewer/mobile/MobileBookViewer.svelte` — Current mobile viewer
  - `src/ui/components/viewer/mobile/viewerHelpers.js` — Open/close logic
  - `src/core/viewer/mobile/touch-handler.js` — Swipe gesture handling
  - `src/core/viewer/mobile/text-splitter-mobile.js` — Mobile text splitting

  **QA Scenarios:**
  ```
  Scenario: Mobile Viewer uses v3 container APIs
    Tool: Bash (grep)
    Steps:
      1. Run `grep -rn 'showContainer\|hideContainer' src/ui/components/viewer/mobile/viewerHelpers.js`
      2. Assert v3 APIs are used
      3. Run `grep -rn 'document\.body' src/ui/components/viewer/mobile/MobileBookViewer.svelte`
      4. Assert no direct host DOM body access
    Expected Result: Mobile viewer uses v3 APIs, no host DOM access
    Evidence: .sisyphus/evidence/task-13-mobile-viewer-core.txt
  ```

  **Commit**: YES (groups with Wave 3)
  - Message: `refactor(ui): adapt Mobile viewer for iframe rendering`
  - Files: `src/ui/components/viewer/mobile/MobileBookViewer.svelte`, `viewerHelpers.js`

---

- [ ] 14. Mobile Sub-Components Adaptation

  **What to do**:
  - Adapt mobile viewer sub-components for v3:
  - `MobileBookHeader.svelte`:
    - REMOVE header action buttons — same as PC (Task 12)
    - Keep: chat title, close button, settings trigger
  - `MobileBookPage.svelte`:
    - Should work mostly as-is in iframe
  - `MobileNavFooter.svelte`:
    - Chat navigation: update to async
    - Page navigation: works as-is
  - `MobileSettingsPanel.svelte`:
    - Update for async pluginStorage (from Task 3)
  - `MobileLBPanel.svelte`:
    - LB module support: verify it works with v3 API
    - May need adaptation if it interacts with host DOM
  - `MobileCustomCssModal.svelte`:
    - Same as PC version

  **Must NOT do**:
  - Keep header action button code
  - Access host DOM directly from sub-components

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Multiple mobile components need consistent adaptation
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 11, 12, 13, 15, 16)
  - **Blocks**: Task 17
  - **Blocked By**: Task 13

  **References**:
  - `src/ui/components/viewer/mobile/MobileBookHeader.svelte` — Mobile header
  - `src/ui/components/viewer/mobile/MobileBookPage.svelte` — Mobile page rendering
  - `src/ui/components/viewer/mobile/MobileNavFooter.svelte` — Mobile navigation
  - `src/ui/components/viewer/mobile/MobileSettingsPanel.svelte` — Mobile settings
  - `src/ui/components/viewer/mobile/MobileLBPanel.svelte` — LB module panel
  - `src/ui/components/viewer/mobile/MobileCustomCssModal.svelte` — Custom CSS modal

  **QA Scenarios:**
  ```
  Scenario: No header action buttons in Mobile viewer
    Tool: Bash (grep)
    Steps:
      1. Run `grep -rn 'dispatchEvent\|cloneNode\|headerAction\|actionButton' src/ui/components/viewer/mobile/`
      2. Assert zero matches
    Expected Result: All header action button code removed from mobile
    Evidence: .sisyphus/evidence/task-14-mobile-no-actions.txt
  ```

  **Commit**: YES (groups with Wave 3)
  - Message: `refactor(ui): adapt Mobile sub-components, remove header actions`
  - Files: `src/ui/components/viewer/mobile/MobileBookHeader.svelte`, `MobileBookPage.svelte`, `MobileNavFooter.svelte`, `MobileSettingsPanel.svelte`, `MobileLBPanel.svelte`, `MobileCustomCssModal.svelte`

---

- [ ] 15. Shared Components (Toast, Loading Overlay)

  **What to do**:
  - Review and adapt shared UI components:
  - `ViewerToast.svelte`:
    - Toast renders inside iframe — should work as-is
    - Verify no host DOM dependencies
  - `LoadingOverlay.svelte`:
    - Loading overlay renders inside iframe — should work as-is
    - Verify no host DOM dependencies
  - If these components have no host DOM references, mark as “no changes needed”

  **Must NOT do**:
  - Modify working components unnecessarily

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Likely minimal or no changes needed
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 11-14, 16)
  - **Blocks**: Task 17
  - **Blocked By**: Task 9

  **References**:
  - `src/ui/components/viewer/ViewerToast.svelte` — Toast component
  - `src/ui/components/viewer/LoadingOverlay.svelte` — Loading overlay

  **QA Scenarios:**
  ```
  Scenario: Shared components have no host DOM dependencies
    Tool: Bash (grep)
    Steps:
      1. Run `grep -rn 'document\.body\|document\.querySelector\|getRootDocument' src/ui/components/viewer/ViewerToast.svelte src/ui/components/viewer/LoadingOverlay.svelte`
      2. Assert zero matches
    Expected Result: Shared components are self-contained iframe components
    Evidence: .sisyphus/evidence/task-15-shared-components.txt
  ```

  **Commit**: YES (groups with Wave 3) if changes made
  - Message: `refactor(ui): verify shared components for iframe compatibility`
  - Files: `ViewerToast.svelte`, `LoadingOverlay.svelte`

---

- [ ] 16. Remove Deprecated Features

  **What to do**:
  - Delete or empty the following files:
    - `src/ui/components/BookButton.svelte` — Replaced by registerButton()
    - `src/ui/components/SmallBookButton.svelte` — Removed (no per-message buttons in v3)
  - Remove all imports/references to these components across the codebase
  - Search and remove any remaining v2.1-specific code patterns:
    - `safeGlobalThis` references
    - `safeDocument` references (not the same as SafeDocument via getRootDocument)
    - `alertStore` compatibility layer references
    - `SafeFunction` references
  - Clean up any dead code paths

  **Must NOT do**:
  - Remove files that are still in use
  - Break imports in other files

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Deletion and cleanup task
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 11-15)
  - **Blocks**: Task 17
  - **Blocked By**: None

  **References**:
  - `src/ui/components/BookButton.svelte` — TO DELETE
  - `src/ui/components/SmallBookButton.svelte` — TO DELETE
  - Use `grep -rn 'BookButton\|SmallBookButton' src/` to find all references

  **QA Scenarios:**
  ```
  Scenario: Deprecated components are fully removed
    Tool: Bash (grep)
    Steps:
      1. Run `ls src/ui/components/BookButton.svelte src/ui/components/SmallBookButton.svelte 2>&1`
      2. Assert both files don't exist (or are deleted)
      3. Run `grep -rn 'BookButton\|SmallBookButton' src/`
      4. Assert zero references remain
    Expected Result: No deprecated component files or references
    Evidence: .sisyphus/evidence/task-16-deprecated-removed.txt
  ```

  **Commit**: YES (groups with Wave 3)
  - Message: `feat(cleanup): remove deprecated v2 features (BookButton, SmallBookButton)`
  - Files: deleted `BookButton.svelte`, `SmallBookButton.svelte`, updated imports

---

### Wave 4 — Integration & Build (After Wave 3)

- [ ] 17. Full Build & Error Resolution

  **What to do**:
  - Run `npm run build` and resolve ALL build errors
  - Common expected errors:
    - Missing imports (deleted files like BookButton, SmallBookButton)
    - Type mismatches from sync-to-async API changes
    - Unused imports/variables from removed features
    - Svelte compilation errors from component changes
  - Fix each error, maintaining v3 architecture decisions
  - Run `npm run lint` and fix lint errors
  - Verify final build output:
    - Single file in `dist/risu-ebooklike-viewer.js`
    - Contains `//@api 3.0` header
    - No build warnings related to missing modules

  **Must NOT do**:
  - Reintroduce v2.1 patterns to fix build errors
  - Skip lint fixes
  - Change architecture decisions (e.g., re-adding host DOM access)

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: May require debugging multiple interconnected build issues
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (sequential)
  - **Parallel Group**: Wave 4
  - **Blocks**: Tasks 18, 19, F1-F4
  - **Blocked By**: Tasks 11-16

  **References**:
  - `package.json` — Build scripts (`npm run build`, `npm run lint`)
  - `vite.config.js` — Build configuration
  - All source files modified in previous tasks

  **QA Scenarios:**
  ```
  Scenario: Build succeeds with no errors
    Tool: Bash
    Steps:
      1. Run `npm run build 2>&1`
      2. Assert exit code 0
      3. Run `ls -la dist/risu-ebooklike-viewer.js`
      4. Assert file exists and size > 0
      5. Run `head -5 dist/risu-ebooklike-viewer.js`
      6. Assert contains `//@api 3.0`
    Expected Result: Build succeeds, output contains v3 API declaration
    Failure Indicators: Non-zero exit code, missing output file, wrong API version
    Evidence: .sisyphus/evidence/task-17-build-success.txt

  Scenario: Lint passes with no errors
    Tool: Bash
    Steps:
      1. Run `npm run lint 2>&1`
      2. Assert no error-level issues (warnings acceptable)
    Expected Result: Lint clean
    Evidence: .sisyphus/evidence/task-17-lint-clean.txt
  ```

  **Commit**: YES
  - Message: `chore: fix build errors and verify v3 compliance`
  - Files: various (all files touched to fix build)

---

- [ ] 18. Forbidden Pattern Audit

  **What to do**:
  - Comprehensive search for ALL forbidden v2.1 patterns across entire src/ directory
  - Search and eliminate:
    - `globalThis.__pluginApis__` (must be zero)
    - `new MutationObserver(` (must be zero — use risuai.createMutationObserver)
    - Direct `localStorage.getItem\|localStorage.setItem\|localStorage.removeItem` (must be zero)
    - `document.querySelector\|document.querySelectorAll\|document.getElementById` in non-iframe context
      - NOTE: Inside Svelte components that render IN the iframe, `document.*` is OK (it refers to iframe's document)
      - Only forbidden when accessing HOST document
    - `element.style.` direct assignments on host elements (should use SafeElement.setStyle)
    - `element.innerHTML =` on host elements (should use SafeElement.setInnerHTML)
    - `element.setAttribute` without x- prefix on host elements
  - For each finding: fix or document why it's acceptable (e.g., iframe-internal DOM)

  **Must NOT do**:
  - Remove legitimate iframe-internal DOM usage
  - Break working code by overly aggressive cleanup

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Thorough codebase-wide audit requiring context judgment
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Task 17)
  - **Parallel Group**: Wave 4 (with Task 19)
  - **Blocks**: F1
  - **Blocked By**: Task 17

  **References**:
  - All `src/**/*.js` and `src/**/*.svelte` files
  - This plan's "Must NOT Have (Guardrails)" section for forbidden patterns

  **QA Scenarios:**
  ```
  Scenario: Zero forbidden v2.1 patterns in codebase
    Tool: Bash (grep)
    Steps:
      1. Run `grep -rn '__pluginApis__' src/`
      2. Run `grep -rn 'new MutationObserver' src/`
      3. Run `grep -rn 'localStorage\.' src/ --include='*.js' --include='*.svelte'`
      4. Assert all three return zero matches
    Expected Result: No forbidden patterns found in source
    Failure Indicators: Any match in grep output
    Evidence: .sisyphus/evidence/task-18-forbidden-audit.txt
  ```

  **Commit**: YES (if any fixes)
  - Message: `fix: remove remaining v2.1 patterns`
  - Files: any files with remaining forbidden patterns

---

- [ ] 19. CSS & Font Loading Verification

  **What to do**:
  - Verify CSS styles work correctly inside iframe context:
    - `src/ui/styles/pc-viewer.css` — should be bundled by Vite and injected into iframe
    - `src/ui/styles/mobile-viewer.css` — same
    - Check Vite build configuration inlines CSS (currently does via `cssCodeSplit: false` or similar)
  - Verify web font loading in iframe:
    - The plugin uses 17 Korean web fonts
    - Fonts loaded via CSS @import or @font-face need to work in iframe context
    - If fonts are loaded from CDN, verify iframe CSP allows external font loading
    - If iframe blocks font loading, consider:
      - Inline font declarations in CSS
      - Use parent document font loading via SafeDocument (last resort)
  - Verify CSS variables (--bv-font-size, --bv-line-height, etc.) work inside iframe

  **Must NOT do**:
  - Remove font support
  - Break existing theme system

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Verification + possible minor CSS adjustments
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Task 17)
  - **Parallel Group**: Wave 4 (with Task 18)
  - **Blocks**: F3
  - **Blocked By**: Task 17

  **References**:
  - `src/ui/styles/pc-viewer.css` — PC viewer styles
  - `src/ui/styles/mobile-viewer.css` — Mobile viewer styles
  - `src/core/viewer/settings-manager.js` — CSS variable injection logic (after Task 3)
  - `vite.config.js` — CSS bundling configuration
  - `rfp/pluginv3/plugins/apiV3/factory.ts` — Search for 'sandbox' to see iframe CSP settings

  **QA Scenarios:**
  ```
  Scenario: CSS is bundled into the output file
    Tool: Bash
    Steps:
      1. Run `npm run build`
      2. Run `grep -c 'font-family\|--bv-' dist/risu-ebooklike-viewer.js`
      3. Assert count > 0 (CSS is inlined in the bundle)
    Expected Result: CSS variables and font declarations present in bundle
    Evidence: .sisyphus/evidence/task-19-css-fonts.txt
  ```

  **Commit**: YES (if changes needed)
  - Message: `fix: ensure CSS and fonts load correctly in iframe`
  - Files: CSS files, vite.config.js (if CSP changes needed)
## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE. Rejection → fix → re-run.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (grep for pattern, read file). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run lint` and `npm run build`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log (excessive), commented-out code, unused imports. Check for leftover v2.1 patterns: `globalThis.__pluginApis__`, direct `document.querySelector`, `new MutationObserver`, direct `localStorage`. Verify all API calls use async/await.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | V2.1 Remnants [N found] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high`
  Execute EVERY QA scenario from EVERY task. Test cross-task integration. Save evidence to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git diff). Verify 1:1 compliance. Check "Must NOT do" compliance. Detect cross-task contamination. Flag unaccounted changes. Verify SmallBookButton and header action buttons are REMOVED (not just hidden).
  Output: `Tasks [N/N compliant] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Wave 1**: `refactor(config): update plugin API version to 3.0` — vite.config.js
- **Wave 1**: `refactor(core): rewrite risu-api for v3 async API` — src/core/risu-api.js
- **Wave 1**: `refactor(core): migrate settings to pluginStorage` — src/core/viewer/settings-manager.js
- **Wave 2**: `refactor(core): rewrite entry point for iframe execution` — src/index.js, src/App.svelte
- **Wave 2**: `refactor(utils): adapt selectors and helpers for v3` — src/utils/*.js
- **Wave 3**: `refactor(ui): adapt PC viewer for iframe rendering` — src/ui/components/viewer/pc/*
- **Wave 3**: `refactor(ui): adapt Mobile viewer for iframe rendering` — src/ui/components/viewer/mobile/*
- **Wave 3**: `feat(ui): remove deprecated v2 features (SmallBookButton, header actions)` — cleanup
- **Wave 4**: `chore: fix build errors and verify v3 compliance` — various

---

## Success Criteria

### Verification Commands
```bash
npm run build          # Expected: builds successfully, output in dist/
head -5 dist/risu-ebooklike-viewer.js  # Expected: contains //@api 3.0
npm run lint           # Expected: no errors (warnings OK)
```

### Final Checklist
- [ ] `//@api 3.0` in build output
- [ ] No `globalThis.__pluginApis__` references in src/
- [ ] No direct `document.querySelector` in src/ (only via SafeDocument wrapper)
- [ ] No `new MutationObserver` in src/ (only via risuai.createMutationObserver)
- [ ] No direct `localStorage` in src/ (only via pluginStorage)
- [ ] No SmallBookButton component or references
- [ ] No header action button code (copy/delete/reroll dispatch)
- [ ] All API calls use async/await
- [ ] Build output is single file UMD bundle
