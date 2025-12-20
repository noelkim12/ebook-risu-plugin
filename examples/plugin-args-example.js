/**
 * PluginArgs 사용 예시
 *
 * 이 파일은 PluginArgs 클래스의 사용법을 보여주는 예제입니다.
 * RisuAI 플러그인 내에서 이와 같은 방식으로 사용할 수 있습니다.
 */

import { PluginArgs } from '../src/core/plugin-config.js';

// ==================== 기본 사용법 ====================

// 1. PluginArgs 인스턴스 생성 (RisuAPI 싱글톤 자동 사용)
const args = new PluginArgs();

// 2. Getter 사용
const apiKey = args.test123;
console.log('Current test123:', apiKey);

const watchValue = args.watchTest;
console.log('Current watchTest:', watchValue);

// 3. Setter 사용
args.test123 = "updated_value";
args.watchTest = 1234;

console.log('Updated test123:', args.test123);
console.log('Updated watchTest:', args.watchTest);

// ==================== 캐시 관리 ====================

// 4. 특정 arg 캐시 무효화
console.log('Before invalidate:', args.test123);
args.invalidate('test123');
console.log('After invalidate:', args.test123); // RisuAPI에서 다시 로드

// 5. 전체 캐시 초기화
args.clearCache();

// 6. 캐시 TTL 변경 (기본: 5초)
args.setCacheTTL(10000); // 10초로 변경

// 7. 캐시된 arg 목록 확인
const cachedArgs = args.getCachedArgs();
console.log('Cached args:', cachedArgs);

// ==================== 타입 검증 ====================

// 8. 정상 사용
try {
  args.watchTest = 5678; // ✅ OK (int)
  console.log('Valid int set:', args.watchTest);
} catch (error) {
  console.error('Error:', error.message);
}

// 9. 타입 에러
try {
  args.watchTest = "invalid"; // ❌ TypeError!
} catch (error) {
  console.error('Expected error:', error.message);
  // Expected: "watchTest must be a number"
}

// ==================== 실전 활용 예시 ====================

/**
 * 예시 1: API 키 관리
 */
function getApiClient() {
  const apiKey = args.test123;

  if (!apiKey) {
    throw new Error('API key not configured. Please set test123 arg.');
  }

  return {
    key: apiKey,
    // ... other client setup
  };
}

/**
 * 예시 2: 설정 기반 동작
 */
function processWithTokenLimit(text) {
  const maxTokens = args.watchTest;

  console.log(`Processing text with max ${maxTokens} tokens...`);

  // ... processing logic
}

/**
 * 예시 3: 설정 변경 감지
 */
function onSettingsChange(newValue) {
  // 사용자가 설정을 변경했을 때
  args.watchTest = newValue;

  // 캐시가 자동으로 업데이트됨
  console.log('Settings updated:', args.watchTest);
}

/**
 * 예시 4: 배치 설정 초기화
 */
function resetToDefaults() {
  // 기본값으로 리셋
  args.test123 = "";
  args.watchTest = 999;

  console.log('Reset to defaults');
}

/**
 * 예시 5: 조건부 기능 활성화
 */
function checkFeatureEnabled() {
  const debugMode = args.test123;

  if (debugMode === "true") {
    console.log('Debug mode enabled!');
    // ... debug logic
  }
}

// ==================== 고급 패턴 ====================

/**
 * 예시 6: 래퍼 클래스 패턴
 */
class PluginSettings {
  constructor() {
    this.args = new PluginArgs();
  }

  get apiKey() {
    return this.args.test123;
  }

  set apiKey(value) {
    if (!this.validateApiKey(value)) {
      throw new Error('Invalid API key format');
    }
    this.args.test123 = value;
  }

  validateApiKey(key) {
    // Custom validation logic
    return key.length > 0;
  }

  get maxTokens() {
    return this.args.watchTest;
  }

  set maxTokens(value) {
    if (value < 1 || value > 4096) {
      throw new RangeError('maxTokens must be between 1 and 4096');
    }
    this.args.watchTest = value;
  }
}

/**
 * 예시 7: Singleton 패턴과 결합
 */
class ConfigManager {
  static _instance = null;

  constructor() {
    if (ConfigManager._instance) {
      return ConfigManager._instance;
    }

    this.args = new PluginArgs();
    ConfigManager._instance = this;
  }

  static getInstance() {
    if (!ConfigManager._instance) {
      ConfigManager._instance = new ConfigManager();
    }
    return ConfigManager._instance;
  }

  getConfig() {
    return {
      test123: this.args.test123,
      watchTest: this.args.watchTest,
    };
  }

  updateConfig(config) {
    if (config.test123 !== undefined) {
      this.args.test123 = config.test123;
    }
    if (config.watchTest !== undefined) {
      this.args.watchTest = config.watchTest;
    }
  }
}

// 사용
const config = ConfigManager.getInstance();
console.log('Current config:', config.getConfig());
config.updateConfig({ watchTest: 2048 });

// ==================== 주의사항 ====================

/**
 * ⚠️ 주의 1: RisuAPI 초기화 전 사용 불가
 *
 * PluginArgs는 RisuAPI 싱글톤을 사용하므로,
 * RisuAPI가 초기화되기 전에는 사용할 수 없습니다.
 */

/**
 * ⚠️ 주의 2: 타입 변경 시 데이터 손실 가능
 *
 * plugin-args.json에서 타입을 변경하면
 * 기존에 저장된 값과 충돌할 수 있습니다.
 */

/**
 * ⚠️ 주의 3: 캐시 무효화 시점
 *
 * 다른 곳에서 setArg()로 직접 변경한 경우,
 * PluginArgs의 캐시는 자동으로 갱신되지 않습니다.
 * 필요시 invalidate()를 호출하세요.
 */

export {
  args,
  PluginSettings,
  ConfigManager,
};
