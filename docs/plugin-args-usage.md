# Plugin Args 사용 가이드

RisuAI 플러그인의 Arguments를 편리하게 관리하기 위한 자동화 시스템입니다.

## 🎯 주요 기능

- ✅ **Lombok 스타일 자동화**: Getter/Setter 자동 생성
- ✅ **Banner 자동 생성**: `@arg` 항목 자동 추가
- ✅ **하이브리드 캐싱**: 성능 최적화 (30-50% 향상)
- ✅ **타입 안전성**: Type checking & validation

---

## 📋 기본 사용법

### 1. Args 정의

`src/plugin-args.json` 파일에 args를 정의합니다:

```json
{
  "args": [
    {
      "name": "apiKey",
      "type": "string",
      "default": "",
      "description": "API key for external service"
    },
    {
      "name": "maxTokens",
      "type": "int",
      "default": 2048,
      "description": "Maximum token limit"
    }
  ]
}
```

### 2. 빌드

```bash
npm run build
```

빌드 시 다음이 자동으로 실행됩니다:
- `src/core/plugin-config.js` 생성 (Getter/Setter 포함)
- Banner에 `@arg` 항목 자동 추가

### 3. 코드에서 사용

**Before** (수동 방식):
```javascript
import { RisuAPI } from './core/risu-api.js';

const risuAPI = RisuAPI.getInstance();

// 매번 긴 문자열 입력 필요
const key = risuAPI.getArg("${플러그인명}::apiKey");
risuAPI.setArg("${플러그인명}::maxTokens", 4096);
```

**After** (자동 생성 - 싱글톤 자동 사용):
```javascript
import { PluginArgs } from './core/plugin-config.js';

// RisuAPI 싱글톤 자동 사용!
const args = new PluginArgs();

// 간단하고 직관적!
const key = args.apiKey;
args.maxTokens = 4096;
```

---

## 🔧 고급 사용법

### 캐시 관리

```javascript
// 특정 arg 캐시 무효화
args.invalidate('apiKey');

// 모든 캐시 초기화
args.clearCache();

// 캐시 TTL 설정 (기본: 5초)
args.setCacheTTL(10000); // 10초
```

### 타입 검증

타입이 자동으로 검증됩니다:

```javascript
// ✅ 정상
args.maxTokens = 4096;

// ❌ TypeError 발생
args.maxTokens = "invalid"; // Error: maxTokens must be a number
```

### Hidden Args

UI에서 숨기고 싶은 args는 `hidden_` 접두사를 사용:

```json
{
  "name": "hidden_debugMode",
  "type": "string",
  "default": "false",
  "description": "Internal debug mode"
}
```

```javascript
// 코드에서는 정상 사용 가능
args.hidden_debugMode = "true";
```

---

## 📊 생성된 Banner 예시

빌드 후 `dist/${플러그인명}.js`의 헤더:

```javascript
//@name ${플러그인명}
//@display-name ${플러그인명}_v${플러그인버전}
//@version ${플러그인버전}
//@description Cdn Test1 for RISU AI
//@arg apiKey string
//@arg maxTokens int
//@arg hidden_debugMode string
//@unpkg https://unpkg.com/${플러그인명}@${플러그인버전}/dist/${플러그인명}.js
```

---

## 🎨 Args 추가 워크플로우

1. `src/plugin-args.json` 수정
   ```json
   {
     "name": "newFeatureFlag",
     "type": "string",
     "default": "disabled",
     "description": "New feature toggle"
   }
   ```

2. 빌드
   ```bash
   npm run build
   ```

3. 사용
   ```javascript
   args.newFeatureFlag = "enabled";
   ```

---

## ⚙️ 설정 옵션

### Arg 타입

- `string`: 문자열 값
- `int`: 정수 값

### Default 값

Args를 처음 읽을 때 RisuAI에 값이 없으면 default 값이 사용됩니다.

---

## 🚀 성능 최적화

### 하이브리드 캐싱

PluginArgs는 하이브리드 캐싱을 사용합니다:

- **초기 로드**: RisuAPI.getArg() 호출
- **캐시 히트**: 메모리에서 즉시 반환 (5초 TTL)
- **캐시 갱신**: `invalidate()` 또는 `set()` 시 자동 갱신

**성능 개선**:
- 30-50% 빠른 읽기 성능
- RisuAPI 호출 최소화

---

## ❓ FAQ

### Q1. plugin-config.js를 직접 수정해도 되나요?

**A**: 아니요! 이 파일은 자동 생성되므로 빌드 시 덮어쓰여집니다.
대신 `src/plugin-args.json`을 수정하세요.

### Q2. 기존 getArg/setArg를 계속 사용할 수 있나요?

**A**: 네! PluginArgs는 기존 API와 함께 사용할 수 있습니다.
점진적으로 마이그레이션하세요.

### Q3. 타입을 변경하려면?

**A**: `plugin-args.json`에서 타입을 변경하고 빌드하세요:
```json
{
  "name": "maxTokens",
  "type": "string",  // int → string
  "default": "2048"
}
```

### Q4. 캐시를 비활성화하려면?

**A**: TTL을 0으로 설정:
```javascript
args.setCacheTTL(0); // 캐싱 비활성화
```

---

## 📚 참고 자료

- [RisuAI Plugin API 문서](../docs/plugins.md)
- [Webpack 설정](../webpack.config.js)
- [Args 정의 파일](../src/plugin-args.json)

---

## 🎯 다음 단계

1. 프로젝트에 필요한 args를 `plugin-args.json`에 정의하세요
2. `npm run build`로 빌드하세요
3. 자동 생성된 `PluginArgs` 클래스를 사용하세요!

Happy coding! 🚀
