# risu-ebooklike-viewer

RisuAI를 위한 **Svelte 5** 기반 플러그인 개발 스캐폴드 프로젝트입니다.

## 📋 목차

- [빠른 시작](#-빠른-시작)
- [특징](#-특징)
- [개발 환경](#-개발-환경)
- [빌드 & 배포](#-빌드--배포)
- [프로젝트 구조](#-프로젝트-구조)
- [문서](#-문서)

---

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 모드 시작 (Hot Reload)

```bash
npm run dev
```

**실행 내용**:

- WebSocket 서버 시작 (`ws://localhost:13131`)
- Vite watch 모드 시작
- 파일 변경 시 자동 리빌드 및 RisuAI에 실시간 반영

**사용 방법**:

1. RisuAI에서 개발 모드 빌드된 플러그인 import
2. 코드 수정 후 저장
3. RisuAI에서 자동으로 업데이트되고 Toast 알림 표시

### 3. 프로덕션 빌드

```bash
npm run build
```

빌드 결과물: `dist/risu-ebooklike-viewer.js`

---

## ✨ 특징

### 🔥 Hot Reload 개발 환경

- **실시간 업데이트**: 코드 수정 즉시 RisuAI에 자동 반영
- **Toast 알림**: 업데이트 완료 시 시각적 피드백
- **WebSocket 기반**: 포트 13131에서 로컬 개발 서버 실행
- **프로덕션 안전**: 개발 코드가 프로덕션 빌드에서 완전히 제거됨

### 🚀 자동화된 릴리즈 시스템

- **원스톱 배포**: 한 명령으로 버전 업데이트 → 빌드 → npm 배포 → Git 푸시
- **릴리즈 노트 자동 생성**: 버전별 변경사항 자동 기록
- **작업 중 릴리즈**: Git working directory가 clean하지 않아도 배포 가능

### 🎨 현대적인 개발 스택

- **Svelte 5**: 최신 Svelte 5 runes 모드 지원
- **CSS Modules**: 스타일 충돌 방지 및 스코프 격리
- **Vite 6**: 초고속 번들링 시스템
- **IndexedDB**: 클라이언트 사이드 데이터 저장

### 🔄 자동 업데이트 시스템

- **unpkg CDN 연동**: 최신 버전 자동 감지
- **사용자 알림**: 업데이트 가능 시 다이얼로그 표시
- **릴리즈 노트 표시**: 변경사항 자동 표시

---

## 🛠️ 개발 환경

### 스크립트 명령어

#### 개발

```bash
# Hot Reload 개발 모드 (권장)
npm run dev

# WebSocket 서버만 시작
npm run dev:server

# Vite watch 모드만 시작
npm run dev:vite
```

#### 빌드

```bash
# 프로덕션 빌드
npm run build

# 개발 모드 빌드 (디버깅용)
npm run build:dev
```

#### 릴리즈 (자동화)

```bash
# Patch 릴리즈 (0.6.8 → 0.6.9) - 버그 수정
npm run release -- patch "fix: 로그인 에러 해결"
npm run release:patch  # 대화형 입력

# Minor 릴리즈 (0.6.8 → 0.7.0) - 새 기능
npm run release -- minor "feat: 다크모드 지원"
npm run release:minor  # 대화형 입력

# Major 릴리즈 (0.6.8 → 1.0.0) - Breaking Change
npm run release -- major "breaking: API 구조 변경"
npm run release:major  # 대화형 입력
```

**릴리즈 스크립트가 자동으로 수행하는 작업**:

1. ✅ Git 저장소 확인
2. ✅ NPM 로그인 확인
3. ✅ 버전 업데이트 (`package.json`)
4. ✅ 프로덕션 빌드
5. ✅ 릴리즈 노트 생성 (`dist/release-notes.json`)
6. ✅ Git 커밋 & 태그
7. ✅ NPM 배포
8. ✅ Git 푸시 (커밋 + 태그)

---

## 📦 빌드 & 배포

### 빠른 배포 (권장)

```bash
# 작업 중... (커밋 안 해도 됨!)
# 변경사항이 있어도 OK!

# 릴리즈 한 번에 완료
npm run release -- patch "fix: 버그 수정"

# 끝! 🎉
# - 모든 변경사항이 하나의 커밋으로 통합
# - npm에 자동 배포
# - git에 자동 푸시 (커밋 + 태그)
```

### 수동 배포

상세한 배포 가이드는 [docs/how_to_publish.md](docs/how_to_publish.md) 참조

---

## 📁 프로젝트 구조

```
risu-ebooklike-viewer/
├── dist/                          # 빌드 결과물
│   ├── risu-ebooklike-viewer.js              # 번들 파일
│   └── release-notes.json        # 릴리즈 노트
│
├── docs/                          # 문서
│   ├── how_to_publish.md         # 배포 가이드
│   ├── development-guide.md      # 개발 가이드
│   └── css-modules.md            # CSS Modules 가이드
│
├── scripts/                       # 자동화 스크립트
│   ├── dev-server.js             # WebSocket 개발 서버 (Hot Reload)
│   ├── vite-plugin-devmode.js    # 개발 모드 플러그인
│   ├── vite-plugin-args.js       # Plugin Args 자동 생성
│   ├── release.js                # 릴리즈 자동화
│   ├── sync-version.js           # 버전 동기화
│   └── script-util.js            # 유틸리티
│
├── src/                           # 소스 코드
│   ├── index.js                  # 메인 엔트리 포인트
│   ├── App.svelte                # 메인 Svelte 컴포넌트
│   ├── constants.js              # 상수 정의
│   ├── plugin-args.json          # 플러그인 인자 정의
│   │
│   ├── core/                     # 핵심 로직
│   │   ├── risu-api.js          # RisuAPI 래퍼
│   │   ├── update-manager.js    # 자동 업데이트 시스템
│   │   ├── script-updater.js    # 스크립트 업데이터
│   │   ├── plugin-config.js     # Plugin Args Config (자동 생성)
│   │   ├── dev-reload.js        # Hot Reload 클라이언트 (자동 생성)
│   │   └── idb-storage.js       # IndexedDB 저장소
│   │
│   ├── ui/                       # UI 관련
│   │   ├── styles/              # CSS 스타일
│   │   │   ├── index.js         # 스타일 레지스트리
│   │   │   ├── global.css       # 전역 스타일
│   │   │   └── *.module.css     # CSS Modules
│   │   │
│   │   └── components/          # Svelte 컴포넌트
│   │       ├── index.js         # 컴포넌트 레지스트리
│   │       ├── UpdateDialog.svelte    # 업데이트 다이얼로그
│   │       ├── AlertDialog.svelte     # 알림 다이얼로그
│   │       ├── LoadingDialog.svelte   # 로딩 다이얼로그
│   │       └── dialogHelpers.js       # 다이얼로그 헬퍼 함수
│   │
│   └── utils/                   # 유틸리티
│       └── helpers.js          # 헬퍼 함수
│
├── .gitignore                    # Git 제외 파일
├── package.json                  # 패키지 설정
├── vite.config.js                # Vite 설정
├── svelte.config.js              # Svelte 설정
└── README.md                     # 프로젝트 문서
```

---

## 📚 문서

### 개발 가이드

- **[개발 가이드](docs/development-guide.md)**: Svelte 컴포넌트 개발 상세 가이드
- **[CSS Modules 가이드](docs/css-modules.md)**: CSS Modules 사용법 및 Best Practices
- **[배포 가이드](docs/how_to_publish.md)**: npm 배포 및 릴리즈 프로세스

### 주요 기능

- **Hot Reload**: 실시간 코드 업데이트 시스템 (포트 13131)
- **자동 업데이트**: unpkg CDN 기반 자동 업데이트
- **릴리즈 자동화**: 원스톱 배포 시스템

---

## 🔧 기술 스택

- **프레임워크**: Svelte 5 (runes 모드)
- **빌드**: Vite 6
- **스타일**: CSS Modules
- **저장소**: IndexedDB (idb)
- **개발**: Hot Reload (WebSocket)
- **배포**: npm + unpkg CDN

---

## 📄 라이선스

MIT License

---

## 📞 문의

프로젝트 관련 문의사항은 Issue를 통해 남겨주세요.
