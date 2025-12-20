# NPM 배포 가이드

이 문서는 `${프로젝트명}` 프로젝트를 npm에 배포하는 전체 과정을 설명합니다.

## 📋 목차

1. [사전 준비](#사전-준비)
2. [배포 전 체크리스트](#배포-전-체크리스트)
3. [배포 프로세스](#배포-프로세스)
4. [배포 후 확인](#배포-후-확인)
5. [버전 업데이트](#버전-업데이트)
6. [개발 모드 (Hot Reload)](#개발-모드-hot-reload)
7. [문제 해결](#문제-해결)
8. [빠른 배포 워크플로우](#빠른-배포-워크플로우)

---

## 🔧 사전 준비

### 1. NPM 계정 설정

npm 계정이 없다면 먼저 생성해야 합니다.

```bash
# npm 계정 생성 (웹사이트에서도 가능)
npm adduser
```

계정이 이미 있다면 로그인합니다:

```bash
# npm 로그인
npm login

# 로그인 확인
npm whoami
```

### 2. Organization 설정

이 프로젝트는 개인 패키지로 배포됩니다. (`${프로젝트명}`)

만약 organization scope를 사용하려면:
- npm 웹사이트에서 organization 생성: https://www.npmjs.com/org/create
- `package.json`의 `name`을 `@organization-name/package-name` 형식으로 변경하세요

### 3. 필요한 도구 확인

```bash
# Node.js 버전 확인 (14.0.0 이상 필요)
node --version

# npm 버전 확인 (6.0.0 이상 필요)
npm --version
```

---

## ✅ 배포 전 체크리스트

### 1. package.json 확인

현재 설정된 주요 필드들:

```json
{
  "name": "${프로젝트명}",                     // 패키지 이름
  "version": "0.1.0",                      // 현재 버전
  "description": "${프로젝트명} for RISU AI", // 패키지 설명
  "main": "src/index.js",                  // CommonJS 진입점
  "browser": "dist/${프로젝트명}.js",          // 브라우저 진입점
  "unpkg": "dist/${프로젝트명}.js",            // CDN 진입점
  "files": ["dist"],                       // 배포할 파일/폴더
  "publishConfig": {
    "access": "public"                     // 공개 패키지
  }
}
```

**중요**: `files` 필드에 `"dist"`만 포함되어 있으므로, `dist` 폴더만 npm에 배포됩니다.

### 2. 빌드 테스트

배포 전에 빌드가 정상적으로 작동하는지 확인합니다:

```bash
# 프로덕션 빌드 실행
npm run build

# dist 폴더 확인
ls -la dist/
```

**예상 결과**: `dist/${프로젝트명}.js` 파일이 생성되어야 합니다.

### 3. .gitignore와 .npmignore 확인

**.gitignore**는 Git에 포함하지 않을 파일을 지정합니다.
**.npmignore**가 없다면 `.gitignore`를 기본으로 사용하지만, `files` 필드가 더 우선순위가 높습니다.

현재 설정에서는 `files: ["dist"]`로 인해 `dist` 폴더만 배포되므로 추가 설정이 필요 없습니다.

---

## 🚀 배포 프로세스

### ⚡ 빠른 배포 (권장)

**자동화된 릴리즈 스크립트**를 사용하면 한 번의 명령으로 모든 배포 과정이 완료됩니다:

```bash
# Patch 릴리즈 (0.6.8 → 0.6.9) - 버그 수정
npm run release -- patch "fix: 로그인 에러 해결"

# Minor 릴리즈 (0.6.8 → 0.7.0) - 새 기능 추가
npm run release -- minor "feat: 다크모드 지원"

# Major 릴리즈 (0.6.8 → 1.0.0) - Breaking Change
npm run release -- major "breaking: API 구조 변경"

# 릴리즈 노트 없이 (기본값 사용)
npm run release -- patch
```

**릴리즈 스크립트가 자동으로 수행하는 작업**:
1. ✅ Git 저장소 확인
2. ✅ NPM 로그인 확인
3. ✅ 버전 업데이트 (package.json)
4. ✅ 프로덕션 빌드 (`npm run build`)
5. ✅ 릴리즈 노트 생성 (`dist/release-notes.json`)
6. ✅ Git 커밋 & 태그 생성
7. ✅ NPM 배포 (`npm publish`)
8. ✅ Git 푸시 (커밋 + 태그)

**주요 장점**:
- 🚀 **작업 중에도 릴리즈 가능**: Git working directory가 clean하지 않아도 됩니다
- 📦 **하나의 커밋**: 작업 중 변경사항 + 릴리즈 변경사항을 하나로 통합
- 🎯 **Push 한 번**: 같은 내용으로 두 번 push하지 않음
- 📝 **자동 릴리즈 노트**: 버전별 변경사항 자동 기록
- 🛡️ **안전장치**: `.gitignore`로 개발 파일 자동 제외

### 📋 단계별 배포 명령어 (수동)

자동화 스크립트를 사용하지 않고 수동으로 배포하려면:

```bash
# 1. 의존성 설치 확인
npm install

# 2. 빌드 실행 (prepublishOnly 스크립트로 자동 실행되지만 수동 확인 권장)
npm run build

# 3. 패키지 내용 미리보기 (배포될 파일 확인)
npm pack --dry-run

# 4. 실제 패키지 파일 생성 (선택사항, 테스트용)
npm pack

# 5. npm 배포 (실제 배포)
npm publish
```

### prepublishOnly 훅

`package.json`에 다음 스크립트가 설정되어 있어 `npm publish` 시 자동으로 빌드됩니다:

```json
"scripts": {
  "prepublishOnly": "npm run build"
}
```

이로 인해 배포 전에 항상 최신 빌드가 생성됩니다.

---

## 🔍 배포 후 확인

### 1. npm 웹사이트에서 확인

배포 후 1~2분 내에 다음 URL에서 패키지를 확인할 수 있습니다:

```
https://www.npmjs.com/package/${프로젝트명}
```

### 2. CDN 링크 확인

unpkg CDN을 통해 배포된 파일에 접근할 수 있습니다:

```
https://unpkg.com/${프로젝트명}@latest/dist/${프로젝트명}.js
https://unpkg.com/${프로젝트명}@0.1.0/dist/${프로젝트명}.js
```

### 3. 설치 테스트

다른 프로젝트에서 설치하여 테스트합니다:

```bash
# 새 프로젝트에서 설치
npm install ${프로젝트명}

# 또는 전역 설치
npm install -g ${프로젝트명}
```

### 4. HTML에서 CDN 사용 예시

```html
<!DOCTYPE html>
<html>
<head>
  <title>CDN Test</title>
</head>
<body>
  <h1>${프로젝트명} 로딩 테스트</h1>

  <script src="https://unpkg.com/${프로젝트명}@latest/dist/${프로젝트명}.js"></script>
  <script>
    // 전역 변수 cdnTest1 사용
    console.log('cdnTest1:', cdnTest1);
  </script>
</body>
</html>
```

---

## 🔄 버전 업데이트

### Semantic Versioning (SemVer) 규칙

버전 형식: `MAJOR.MINOR.PATCH` (예: `0.6.8`)

- **MAJOR**: 호환되지 않는 API 변경 (Breaking Change)
- **MINOR**: 하위 호환되는 기능 추가
- **PATCH**: 하위 호환되는 버그 수정

### 릴리즈 스크립트 사용 (권장)

```bash
# Patch 버전 증가 (0.6.8 → 0.6.9) - 버그 수정
npm run release -- patch "fix: 로그인 에러 해결"

# Minor 버전 증가 (0.6.8 → 0.7.0) - 새 기능
npm run release -- minor "feat: 다크모드 지원"

# Major 버전 증가 (0.6.8 → 1.0.0) - Breaking Change
npm run release -- major "breaking: API 구조 변경"

# 릴리즈 노트 생략 (기본 메시지 사용)
npm run release -- patch
npm run release:patch  # 단축 명령어
npm run release:minor  # 단축 명령어
npm run release:major  # 단축 명령어
```

**릴리즈 스크립트가 자동으로 처리하는 작업**:
1. 버전 업데이트 (`package.json`, `package-lock.json`)
2. 프로덕션 빌드 실행
3. 릴리즈 노트 생성 (`dist/release-notes.json`)
4. Git 커밋 & 태그 생성
5. npm 배포
6. Git 푸시 (커밋 + 태그)

### npm version 명령어 (수동)

자동화 스크립트를 사용하지 않고 버전만 업데이트하려면:

```bash
# 패치 버전 증가 (0.6.8 → 0.6.9)
npm version patch

# 마이너 버전 증가 (0.6.8 → 0.7.0)
npm version minor

# 메이저 버전 증가 (0.6.8 → 1.0.0)
npm version major

# 직접 버전 지정
npm version 0.7.0
```

`npm version` 명령어는 다음을 자동으로 수행합니다:
1. `package.json`의 `version` 필드 업데이트
2. Git 커밋 생성 (메시지: `v0.7.0`)
3. Git 태그 생성 (`v0.7.0`)

### 릴리즈 노트 작성

릴리즈 스크립트를 사용하면 `dist/release-notes.json`에 자동으로 기록됩니다:

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

이 파일은:
- ✅ npm 패키지에 포함되어 배포됨
- ✅ unpkg CDN에서 접근 가능
- ✅ 플러그인의 자동 업데이트 시스템에서 사용됨

---

## 🔥 개발 모드 (Hot Reload)

### Hot Reload 시스템

개발 중 코드를 수정하면 **자동으로 RisuAI에 반영**되는 Hot Reload 시스템이 구축되어 있습니다.

### 사용 방법

```bash
# 1. 개발 모드 시작
npm run dev

# 출력:
# [DevServer] 🚀 WebSocket server started on ws://localhost:13131
# [DevServer] 📂 Watching: dist/cdn-test1.js
# [webpack] Watching for file changes...
```

### 동작 방식

```
1. npm run dev 실행
   ├─ WebSocket 서버 시작 (포트 13131)
   └─ Webpack watch 모드 시작

2. RisuAI에서 플러그인 로드
   └─ @dev-mode true 감지 → ws://localhost:13131 연결

3. 파일 수정 후 저장
   ├─ Webpack 자동 빌드
   ├─ DevServer가 변경 감지
   ├─ WebSocket으로 스크립트 전송
   ├─ RisuAI에서 자동 업데이트
   └─ Toast 알림 표시: "🔥 Hot Reload Complete!"
```

### 주요 특징

- ✅ **실시간 업데이트**: 파일 저장 즉시 RisuAI에 반영
- ✅ **Toast 알림**: 상단에서 내려오는 3초간의 성공 알림
- ✅ **프로덕션 안전**: 개발 코드가 프로덕션 빌드에 포함되지 않음
- ✅ **자동 재연결**: WebSocket 연결 끊김 시 자동 재연결

### 프로덕션 빌드

프로덕션 빌드 시 Hot Reload 관련 코드가 **완전히 제거**됩니다:

```bash
# 프로덕션 빌드
npm run build

# 출력:
# [DevModePlugin] Production mode - skipping dev-reload.js generation
# [DevModePlugin] Removed dev-reload.js for production build
```

**번들 크기 비교**:
- 개발 모드: 130 KiB (Hot Reload 포함)
- 프로덕션 모드: 84.4 KiB (Hot Reload 제거)
- 절약: 45.6 KiB

### 개발 파일 (.gitignore)

다음 파일들은 자동으로 Git에서 제외됩니다:

```
src/core/plugin-config.js  (자동 생성)
src/core/dev-reload.js      (개발 모드 전용)
dist/src_core*              (chunk 파일)
```

---

## 🛠️ 문제 해결

### 1. 권한 오류

```
npm ERR! code E403
npm ERR! 403 Forbidden
```

**해결방법**:
```bash
# 로그인 확인
npm whoami

# 재로그인
npm logout
npm login

# 개인 패키지의 경우 자신의 계정으로 배포 가능
# organization 패키지의 경우 해당 organization의 멤버여야 합니다
```

### 2. 중복 버전 오류

```
npm ERR! code E409
npm ERR! 409 Conflict - PUT https://registry.npmjs.org/${프로젝트명}
```

**해결방법**:
```bash
# 버전 증가
npm version patch

# 다시 배포
npm publish
```

### 3. 빌드 파일이 없음

```
npm ERR! This package has been marked as private
```

**해결방법**:
```bash
# 빌드 실행
npm run build

# dist 폴더 확인
ls -la dist/

# 다시 배포
npm publish
```

### 4. 네트워크 오류

```
npm ERR! network request to https://registry.npmjs.org failed
```

**해결방법**:
```bash
# npm 레지스트리 확인
npm config get registry

# 기본 레지스트리로 설정
npm config set registry https://registry.npmjs.org/

# 캐시 정리
npm cache clean --force
```

### 5. 2FA (Two-Factor Authentication) 오류

npm에서 2FA를 활성화한 경우:

```bash
# OTP 코드와 함께 배포
npm publish --otp=123456
```

---

## 📝 배포 체크리스트

### 릴리즈 스크립트 사용 시 (권장)

릴리즈 스크립트가 대부분을 자동으로 처리하므로 최소한의 확인만 필요합니다:

**배포 전**:
- [ ] npm 로그인 완료 (`npm whoami`)
- [ ] Git 저장소가 초기화되어 있음 (`git status`)
- [ ] 릴리즈 노트 준비 (변경사항 요약)

**배포 실행**:
```bash
npm run release -- patch "fix: 변경사항 요약"
```

**배포 후**:
- [ ] npm 웹사이트에서 패키지 확인
- [ ] CDN 링크 테스트 (`https://unpkg.com/${프로젝트명}@latest`)
- [ ] GitHub에서 태그 확인

### 수동 배포 시

배포하기 전에 다음 항목들을 확인하세요:

- [ ] npm 로그인 완료 (`npm whoami`)
- [ ] `package.json` 버전 확인 및 업데이트
- [ ] 빌드 테스트 완료 (`npm run build`)
- [ ] `dist/${프로젝트명}.js` 파일 생성 확인
- [ ] Git 커밋 및 푸시 완료
- [ ] README.md 업데이트 (필요한 경우)
- [ ] CHANGELOG 업데이트 (필요한 경우)
- [ ] npm publish 실행
- [ ] npm 웹사이트에서 패키지 확인
- [ ] CDN 링크 테스트

---

## 🎯 빠른 배포 워크플로우

### 자동화 스크립트 사용 (권장)

**가장 간단한 배포 방법**:

```bash
# 작업 중... (파일 수정, 커밋 안 해도 됨)
# 변경사항이 있어도 OK!

# 릴리즈 한 번에 완료
npm run release -- patch "fix: hot reload toast 애니메이션 개선"

# 끝! 🎉
# - 모든 변경사항이 하나의 커밋으로 통합됨
# - npm에 자동 배포됨
# - git에 자동 푸시됨 (커밋 + 태그)
```

### 수동 배포 (자동화 스크립트 미사용)

전통적인 방식으로 배포하려면:

```bash
# 1. 코드 변경 및 커밋
git add .
git commit -m "feat: add new feature"

# 2. 버전 업데이트 (자동 커밋 및 태그)
npm version patch

# 3. Git 푸시
git push && git push --tags

# 4. 빌드 및 배포 (prepublishOnly가 자동으로 빌드 실행)
npm publish

# 5. 배포 확인
echo "Check: https://www.npmjs.com/package/${프로젝트명}"
```

### 릴리즈 스크립트 vs 수동 배포

| 항목 | 릴리즈 스크립트 | 수동 배포 |
|------|----------------|-----------|
| **명령어 수** | 1개 | 4~5개 |
| **작업 중 변경사항** | 포함 가능 ✅ | 커밋 필요 ❌ |
| **릴리즈 노트** | 자동 생성 ✅ | 수동 작성 |
| **에러 처리** | 자동 롤백 ✅ | 수동 복구 |
| **Git 푸시** | 자동 (1회) ✅ | 수동 (2회) |

---

## 📚 추가 리소스

- [npm 공식 문서](https://docs.npmjs.com/)
- [Semantic Versioning](https://semver.org/)
- [package.json 필드 설명](https://docs.npmjs.com/cli/v9/configuring-npm/package-json)
- [npm publish 가이드](https://docs.npmjs.com/cli/v9/commands/npm-publish)
- [unpkg CDN 문서](https://unpkg.com/)

---

## 📧 문의

프로젝트 관련 문의사항은 GitHub Issues를 이용해주세요.
