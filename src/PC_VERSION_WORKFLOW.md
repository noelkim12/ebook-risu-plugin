# risu-ebooklike-viewer - PC Version Workflow

## Overview

RisuAI 채팅 메시지를 이북 스타일로 보여주는 뷰어 플러그인의 PC 버전 워크플로우.

## Architecture Diagram

```
App.svelte (Entry Point)
    │
    ├── MutationObserver (DOM 변경 감지)
    │
    ├── BookButton.svelte ─────────────┐
    │   (채팅 입력창 옆 버튼)           │
    │                                   │
    └── SmallBookButton.svelte ────────┤
        (각 채팅 메시지의 버튼)         │
                                        │
                                        ▼
                            viewerHelpers.js
                            ├── openPCViewer(chatIndex, toggleViewer, showLoading)
                            ├── closePCViewer()
                            └── togglePCViewer()
                                        │
                                        ▼
                            PCBookViewer.svelte (Main Viewer)
                            ├── BookHeader.svelte (Chat Index Control 포함)
                            ├── BookPages.svelte
                            │   └── LoadingOverlay.svelte
                            ├── NavControls.svelte
                            │   ├── SettingsMenu.svelte
                            │   └── LBModuleMenu.svelte
                            ├── CustomCssModal.svelte
                            └── ViewerToast.svelte
```

## File Structure

```
src/
├── App.svelte                           # 진입점, DOM 감시 및 버튼 마운트
├── constants.js                         # 플러그인 상수
│
├── core/
│   ├── risu-api.js                      # RisuAI 플러그인 API 래퍼 (싱글톤)
│   └── viewer/pc/
│       ├── text-splitter.js             # 텍스트 페이지 분할 로직
│       ├── page-manager.js              # 페이지 관리 및 콘텐츠 처리
│       └── settings-manager.js          # localStorage 설정 관리
│
├── ui/
│   ├── components/
│   │   ├── BookButton.svelte            # 메인 뷰어 열기 버튼
│   │   ├── SmallBookButton.svelte       # 개별 채팅용 버튼
│   │   └── viewer/pc/
│   │       ├── PCBookViewer.svelte      # PC 뷰어 메인 컴포넌트
│   │       ├── BookHeader.svelte        # 헤더 (썸네일, 이름, Chat Index Control)
│   │       ├── BookPages.svelte         # 양면 페이지 렌더링 + LoadingOverlay
│   │       ├── LoadingOverlay.svelte    # 로딩 오버레이 (blur + spinner)
│   │       ├── ViewerToast.svelte       # 토스트 알림 컴포넌트
│   │       ├── NavControls.svelte       # 네비게이션 및 설정
│   │       ├── SettingsMenu.svelte      # 폰트/폰트크기/줄간격/테마 설정
│   │       ├── LBModuleMenu.svelte      # LB 모듈 퀵 네비게이션
│   │       ├── CustomCssModal.svelte    # 사용자 CSS 편집
│   │       └── viewerHelpers.js         # 뷰어 열기/닫기 헬퍼
│   └── styles/
│       └── pc-viewer.css                # PC 뷰어 스타일
│
└── utils/
    ├── selector.js                      # RisuAI DOM 선택자 유틸 + Chat Index 유틸
    ├── svelte-helper.js                 # Svelte 안전 마운트/언마운트
    └── dom-helper.js                    # DOM 조작 유틸 (버튼 이벤트 위임)
```

## Workflow Detail

### 1. Plugin Initialization (App.svelte)

```
onMount()
    │
    ├── RisuAPI.getInstance() 초기화
    │
    └── startObserver()
        └── MutationObserver 설정
            └── debouncedAttachButton() (100ms debounce)
```

### 2. Button Attachment (attachButton)

```
attachButton()
    │
    ├── 채팅 입력창에 BookButton 마운트
    │   ├── risuSelector(LOCATOR.chatScreen.inputContainer)
    │   └── safeMount({ id: 'book-button', component: BookButton, ... })
    │
    └── 각 채팅 메시지에 SmallBookButton 마운트
        ├── risuSelectorAll(LOCATOR.chatMessage.botButtonDiv)
        └── forEach → safeMount({ id: 'small-book-button', ... })
```

### 3. Viewer Opening (viewerHelpers.js)

```
openPCViewer(chatIndex, toggleViewer, showLoading)
    │
    ├── 이미 열려있으면 닫기 (토글 동작)
    │
    ├── 채팅 인덱스 결정
    │   ├── null/undefined → 마지막 채팅
    │   └── 문자열 → Number()로 변환 (SmallBookButton 대응)
    │
    ├── getChatElementByChatIndex() → 채팅 요소 가져오기
    │
    ├── displayContainer 스타일 변경 (overflow: hidden)
    │
    └── safeMount({ id: 'pc-book-viewer', component: PCBookViewer, props })
        props:
        ├── chatHtml: 채팅 요소의 outerHTML
        ├── chatIndex: 채팅 인덱스 (숫자)
        ├── chatPage: 현재 채팅 페이지
        ├── chaId: 캐릭터 ID
        ├── onClose: closePCViewer
        └── initialLoading: showLoading (chat index 이동 시 true)
```

### 4. PCBookViewer Initialization

```
PCBookViewer.onMount()
    │
    ├── loadSettings() → 설정 로드
    │
    ├── loadCustomCss() → 사용자 CSS 로드 및 적용
    │
    ├── updateChatIndexInfo() → Chat Index 정보 초기화
    │   ├── getAllVisibleChatIndices()
    │   └── getChatIndexPosition(chatIndex)
    │
    ├── waitForLayout() → 레이아웃 계산 대기
    │
    ├── parseAndSplit() → 콘텐츠 파싱 및 페이지 분할
    │   ├── DOMParser로 chatHtml 파싱
    │   ├── extractHeaderInfo() → 헤더 정보 추출
    │   ├── collectLBModules() → LB 모듈 수집
    │   ├── wrapNakedTextNodes() → 노출된 텍스트 노드 래핑
    │   ├── splitPages() → 페이지 분할
    │   └── isLoading = false → 로딩 오버레이 fade-out
    │
    ├── contentCheckInterval 설정 (2초마다 콘텐츠 변경 감지)
    │
    └── RisuAPI 구독 설정
        ├── subscribeToChar(chatPage/chaId) → 채팅 페이지/캐릭터 변경 감지
        └── subscribeToChar(message.length) → 새 채팅 인덱스 감지
```

### 5. Page Splitting Logic (page-manager.js + text-splitter.js)

```
splitPages()
    │
    ├── createMeasureContainer() → 측정용 컨테이너 생성
    │
    └── splitIntoPagesHTML(content, measureContainer, textSplitter)
        │
        ├── 각 요소 순회
        │   ├── 이미지 요소 → 별도 페이지로 분리
        │   ├── 오버플로우 발생 시
        │   │   ├── textSplitter.isSplittable() 확인
        │   │   └── textSplitter.splitElement() 분할
        │   └── 일반 요소 → 현재 페이지에 추가
        │
        └── pages[] 배열 반환 (HTML 문자열 배열)
```

### 6. User Interactions

```
키보드 네비게이션:
├── ArrowRight / PageDown / Space → nextPage()
├── ArrowLeft / PageUp → prevPage()
├── Escape → onClose()
└── 예외 처리 (Escape 제외):
    ├── textarea/input 포커스 시 → 네비게이션 비활성화
    └── 텍스트 드래그 선택 중 → 네비게이션 비활성화

Chat Index 네비게이션:
├── BookHeader의 < > 버튼 → goToPrevChatIndex() / goToNextChatIndex()
├── 마지막 페이지에서 → 키보드로 다음 chat index 이동
├── 첫 페이지에서 ← 키보드로 이전 chat index 이동
└── 첫번째/마지막 chat index에서 이동 시 → Toast 알림 표시

설정 변경:
├── handleSettingsChange() → saveSettings() + debouncedRepaginate()
└── $effect() → CSS 변수 업데이트 (--bv-font-size, --bv-line-height, --bv-font-family)

사용자 CSS:
├── openCustomCssModal() → 모달 열기
├── handleApplyCustomCss() → saveCustomCss() + applyCustomCss()
└── handleResetCustomCss() → resetCustomCss()

LB 모듈:
└── handleLBModuleClick() → 해당 모듈이 있는 페이지로 이동
```

### 7. Chat Index Control Flow

```
goToNextChatIndex() / goToPrevChatIndex()
    │
    ├── getAdjacentChatIndex(chatIndex, direction)
    │   ├── getAllVisibleChatIndices() → 현재 DOM에 있는 chat index 배열
    │   └── 이전/다음 인덱스 계산 (가상화 대응)
    │
    ├── index가 있으면
    │   └── openPCViewer(index, false, true)
    │       └── initialLoading: true → LoadingOverlay 표시
    │
    └── index가 없으면 (첫번째/마지막)
        └── showToast('현재 채팅의 첫 번째/마지막 페이지입니다')
```

### 8. Content Change Detection

```
checkContentChange() (2초마다)
    │
    ├── getChatElementByChatIndex(chatIndex)
    │
    └── outerHTML 비교
        └── 변경됨 → parseAndSplit() 재실행
```

### 9. Viewer Closing

```
closePCViewer()
    │
    ├── safeRestoreStyle() → 원래 스타일 복원
    │
    └── safeUnmount('pc-book-viewer')
```

## Core APIs

### RisuAPI (Singleton)

```javascript
RisuAPI.getInstance()
  .getChar()           // 현재 캐릭터 객체
  .getChaId()          // 캐릭터 ID
  .getCurrentChatPage() // 현재 채팅 페이지 인덱스
  .getLastChatIndex()  // 마지막 채팅 인덱스
  .subscribeToChar(    // 폴링 기반 구독 (RisuAI는 이벤트 미지원)
    selector,          // (char) => 감시할 값
    callback,          // (newValue) => 변경 시 콜백
    interval           // 폴링 간격 (ms)
  )
```

### Selector Utils

```javascript
// 기본 선택자
risuSelector(LOCATOR.xxx)      // 단일 요소 선택
risuSelectorAll(LOCATOR.xxx)   // 모든 요소 선택
getChatIndexFromNode({ node }) // 노드에서 채팅 인덱스 추출
getChatElementByChatIndex(idx) // 인덱스로 채팅 요소 찾기 (음수 지원)

// Chat Index 유틸 (가상화 대응)
getAllVisibleChatIndices()     // 현재 DOM에 렌더링된 chat index 배열
getAdjacentChatIndex(          // 이전/다음 chat index 반환
  currentIndex,                // 현재 인덱스
  direction                    // 'prev' | 'next'
) → { index, isFirst, isLast }

getChatIndexPosition(          // 현재 위치 정보 반환
  currentIndex
) → { position, total, isFirst, isLast }
```

### Svelte Helper

```javascript
safeMount({ id, component, target, anchor, props })  // 안전한 마운트
safeUnmount(id)                                       // 안전한 언마운트
isMounted(id)                                         // 마운트 확인
safeSetStyle(element, styles, namespace)             // 스타일 설정 (복원 가능)
safeRestoreStyle(element, namespace)                 // 스타일 복원
```

### DOM Helper

```javascript
// 버튼 클론 및 이벤트 위임 (직접 DOM 조작용)
cloneButtonsWithEventDelegation(
  buttons,                         // 원본 버튼 요소 배열 (라이브 DOM)
  container,                       // 클론된 버튼을 추가할 컨테이너
  options                          // { clearContainer, additionalClasses }
) → HTMLElement[]

// innerHTML 렌더링 후 이벤트 위임 설정 (BookPages용)
delegateButtonEvents(
  container,                       // 버튼을 포함한 컨테이너
  originalButtons,                 // 원본 버튼 요소 배열
  options                          // { buttonSelector, matcher }
)
```

### Page Manager

```javascript
extractHeaderInfo(doc)                 // 파싱된 문서에서 헤더 정보 추출
extractLiveButtons(liveElement)        // 라이브 DOM에서 헤더 버튼 요소 추출 (이벤트 핸들러 유지)
extractLiveContentButtons(liveElement) // 라이브 DOM에서 콘텐츠 버튼 요소 추출 (LB 모듈, risu-btn 등)
extractLiveLBModuleButtons(liveElement) // 라이브 DOM에서 LB 모듈 버튼 Map 추출 (dataId → 버튼)
collectLBModules(doc)                  // LB 모듈 수집
splitIntoPagesHTML(content, ...)       // 콘텐츠를 페이지로 분할
waitForLayout()                        // 레이아웃 계산 대기
```

## State Management

| State | Location | Description |
|-------|----------|-------------|
| `pages[]` | PCBookViewer | 분할된 페이지 HTML 배열 |
| `currentPage` | PCBookViewer | 현재 스프레드 인덱스 (0-based) |
| `settings` | PCBookViewer + localStorage | fontSize, lineHeight, theme, fontFamily |
| `customCss` | PCBookViewer + localStorage | 사용자 커스텀 CSS |
| `headerInfo` | PCBookViewer | 썸네일, 이름, 버튼 정보 |
| `lbModules` | PCBookViewer | LB 모듈 목록 |
| `liveLBModuleButtons` | PCBookViewer | LB 모듈 라이브 버튼 Map (dataId → 버튼) |
| `liveContentButtons` | PCBookViewer | 콘텐츠 내 라이브 버튼 참조 배열 |
| `chatIndexPosition` | PCBookViewer | { position, total, isFirst, isLast } |
| `visibleChatIndices` | PCBookViewer | 현재 렌더링된 chat index 배열 |
| `isLoading` | PCBookViewer | 로딩 오버레이 표시 여부 |
| `toastVisible` | PCBookViewer | 토스트 표시 여부 |
| `mountedComponents` | svelte-helper.js | 마운트된 컴포넌트 추적 |

## Key Design Decisions

1. **safeMount/safeUnmount 패턴**: RisuAI의 기존 Svelte 앱과 충돌 방지
2. **MutationObserver + Debounce**: 효율적인 DOM 변경 감지
3. **2-페이지 스프레드**: 책처럼 양면 표시 (leftContent, rightContent)
4. **콘텐츠 변경 감지**: 2초마다 폴링하여 실시간 업데이트 지원
5. **TextSplitter**: 문장/단어 단위 분할로 페이지 넘김 최적화
6. **폴링 기반 구독**: RisuAI가 이벤트 시스템을 제공하지 않아 subscribeToChar 구현
7. **가상화 대응**: getAllVisibleChatIndices로 현재 DOM에 있는 인덱스만 추적
8. **initialLoading 패턴**: chat index 이동 시 새 뷰어에서 로딩 시작 → fade-out으로 깜빡임 방지
9. **키보드 네비게이션 예외**: 입력 필드 포커스/텍스트 선택 시 비활성화
10. **라이브 DOM 버튼 참조**: DOMParser 파싱 결과 대신 라이브 DOM에서 버튼 추출 (이벤트 핸들러 유지)
11. **이벤트 위임 패턴**: cloneNode로 복제된 버튼에서 원본 버튼으로 클릭 이벤트 전달
12. **한글 폰트 지원**: 17개 한글 웹폰트 (나눔스퀘어네오, 에스코어드림, 마루부리 등) 선택 가능

## Available Fonts

pc-viewer.css에 정의된 17개 한글 웹폰트:

| Font Name | Type | Description |
|-----------|------|-------------|
| 나눔스퀘어네오 | Sans-serif | 기본 폰트, 깔끔한 고딕 |
| 에스코어드림 | Sans-serif | 현대적 고딕 |
| 레페리포인트 | Sans-serif | 포인트 고딕 |
| 플렉스 | Sans-serif | 유연한 고딕 |
| 스위트 | Sans-serif | 부드러운 고딕 |
| 오르빗 | Sans-serif | 모던 고딕 |
| 스쿨오르빗 | Sans-serif | 학교 스타일 |
| 프리티나잇 | Display | 장식용 |
| 서라운드에어 | Sans-serif | 에어리한 스타일 |
| 고운돋움 | Sans-serif | 전통적 돋움 |
| 고운바탕 | Serif | 전통적 바탕 |
| 리디바탕 | Serif | 리디북스 바탕 |
| 마루부리 | Serif | 네이버 세리프 |
| 도스고딕 | Pixel | 레트로 픽셀 |
| 스타더스트 | Pixel | 레트로 픽셀 |
| 픽시드시스 | Pixel | 레트로 픽셀 |
| 네오둥근모 | Pixel | 레트로 둥근모꼴 |
