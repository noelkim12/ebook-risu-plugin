# risu-ebooklike-viewer

RisuAI 채팅 메시지를 **이북(E-Book) 스타일**로 보여주는 뷰어 플러그인입니다.

## 주요 기능

### 이북 스타일 뷰어
- **페이지네이션**: 긴 채팅 메시지를 책처럼 페이지 단위로 분할
- **양면 펼침 (PC)**: 좌우 2페이지 책 레이아웃
- **단일 페이지 (Mobile)**: 모바일 최적화 단일 페이지 뷰
- **스와이프 네비게이션 (Mobile)**: 터치 제스처로 페이지 이동

### 디바이스 자동 감지
- PC/Mobile 환경 자동 감지 후 적합한 뷰어 실행
- 화면 너비 및 User Agent 기반 판별

### 읽기 설정
- **글자 크기**: 14px ~ 24px 조절
- **줄 간격**: 1.4 ~ 2.2 조절
- **테마**: Light / Sepia / Dark
- **폰트**: 17종 한글 웹폰트 지원
- **사용자 CSS**: 커스텀 스타일 적용

### 채팅 네비게이션
- **Chat Index 이동**: 이전/다음 채팅 메시지로 빠르게 이동
- **새 채팅 감지**: 새 응답 수신 시 알림 토스트 표시
- **자동 이동**: 사용자 메시지 전송 시 자동으로 해당 채팅으로 이동

### LB 모듈 지원
- LB 모듈 버튼 목록 표시
- 뷰어 내에서 LB 모듈 실행
- 리롤링 상태 로딩 인디케이터

### 기타
- 헤더 액션 버튼 (복사, 삭제 등) 연동
- 콘텐츠 내 버튼 이벤트 위임
- 실시간 콘텐츠 변경 감지

---

## 프로젝트 구조

```
src/
├── App.svelte                    # 메인 엔트리 - BookButton 부착
├── core/
│   ├── risu-api.js              # RisuAPI 래퍼 (구독, 캐릭터 접근)
│   └── viewer/
│       ├── pc/
│       │   ├── page-manager.js      # 페이지 분할, 헤더/버튼 추출
│       │   ├── settings-manager.js  # 설정 저장/로드 (PC/Mobile 공용)
│       │   └── text-splitter.js     # PC용 텍스트 분할기
│       └── mobile/
│           ├── text-splitter-mobile.js  # Mobile용 텍스트 분할기
│           └── touch-handler.js         # 스와이프 제스처 핸들러
│
├── ui/
│   ├── components/
│   │   ├── BookButton.svelte        # 채팅 입력창 옆 뷰어 버튼
│   │   ├── SmallBookButton.svelte   # 메시지별 뷰어 버튼
│   │   └── viewer/
│   │       ├── ViewerToast.svelte       # 공유 토스트 컴포넌트
│   │       ├── LoadingOverlay.svelte    # 공유 로딩 오버레이
│   │       ├── pc/
│   │       │   ├── PCBookViewer.svelte      # PC 메인 뷰어
│   │       │   ├── BookHeader.svelte        # PC 헤더
│   │       │   ├── BookPages.svelte         # PC 양면 페이지
│   │       │   ├── NavControls.svelte       # PC 네비게이션/설정
│   │       │   ├── SettingsMenu.svelte      # PC 설정 드롭다운
│   │       │   ├── CustomCssModal.svelte    # CSS 편집 모달
│   │       │   └── viewerHelpers.js         # PC 뷰어 열기/닫기
│   │       └── mobile/
│   │           ├── MobileBookViewer.svelte  # Mobile 메인 뷰어
│   │           ├── MobileBookHeader.svelte  # Mobile 2줄 헤더
│   │           ├── MobileBookPage.svelte    # Mobile 단일 페이지
│   │           ├── MobileNavFooter.svelte   # Mobile 하단 네비게이션
│   │           ├── MobileSettingsPanel.svelte   # Mobile 설정 바텀시트
│   │           ├── MobileLBPanel.svelte         # Mobile LB 바텀시트
│   │           ├── MobileCustomCssModal.svelte  # Mobile CSS 모달
│   │           └── viewerHelpers.js             # Mobile 뷰어 열기/닫기
│   │
│   └── styles/
│       ├── pc-viewer.css        # PC 뷰어 스타일
│       └── mobile-viewer.css    # Mobile 뷰어 스타일
│
└── utils/
    ├── selector.js          # RisuAI DOM 셀렉터, Chat Index 유틸
    ├── dom-helper.js        # 버튼 복제, 이벤트 위임
    └── svelte-helper.js     # Svelte 컴포넌트 마운트/언마운트
```

---

## 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 모드 (Hot Reload)

```bash
npm run dev
```

- WebSocket 서버 시작 (`ws://localhost:13131`)
- Vite watch 모드로 자동 리빌드
- RisuAI에서 플러그인 import 후 코드 수정 시 자동 반영

### 3. 프로덕션 빌드

```bash
npm run build
```

빌드 결과: `dist/risu-ebooklike-viewer.js`

---

## 사용 방법

### RisuAI에서 플러그인 Import

1. RisuAI 설정 → 플러그인 관리
2. 플러그인 URL 또는 파일로 Import
3. 채팅 입력창 옆 책 아이콘 클릭하여 뷰어 실행

### 뷰어 조작

**PC 버전**
- `←` `→` 또는 `PageUp` `PageDown`: 페이지 이동
- `Escape`: 뷰어 닫기
- 우측 하단 설정 메뉴로 읽기 설정 변경

**Mobile 버전**
- 좌/우 스와이프: 페이지 이동
- 하단 이전/다음 버튼: 페이지 이동
- 상단 설정 버튼: 읽기 설정 변경

---

## 스크립트 명령어

### 개발

```bash
npm run dev          # Hot Reload 개발 모드
npm run dev:server   # WebSocket 서버만 시작
npm run dev:vite     # Vite watch 모드만 시작
```

### 빌드

```bash
npm run build        # 프로덕션 빌드
npm run build:dev    # 개발 모드 빌드
```

### 코드 품질

```bash
npm run lint         # ESLint 검사
npm run lint:fix     # ESLint 자동 수정
npm run format       # Prettier 포맷팅
npm run format:check # Prettier 검사
```

### 릴리즈

```bash
npm run release -- patch "fix: 버그 수정"
npm run release -- minor "feat: 새 기능"
npm run release -- major "breaking: API 변경"
```

---

## 기술 스택

- **프레임워크**: Svelte 5 (runes 모드)
- **빌드**: Vite 6
- **아이콘**: lucide-svelte
- **스타일**: CSS (CSS Variables 기반 테마)
- **저장소**: localStorage (설정), IndexedDB (캐시)
- **개발**: Hot Reload (WebSocket)

---

## 라이선스

MIT License

