import { PLUGIN_NAME } from '../constants.js';

/**
 * RisuAPI 싱글톤 클래스
 * RisuAI의 플러그인 API를 래핑하여 제공합니다.
 */
export class RisuAPI {
  // 싱글톤 인스턴스
  static _instance = null;

  constructor(pluginApis) {
    // 싱글톤 체크
    if (RisuAPI._instance) {
      console.log(`[${PLUGIN_NAME}] Returning existing RisuAPI instance`);
      return RisuAPI._instance;
    }

    // RisuAI 플러그인 API들을 private 필드로 저장 (메서드에서 사용)
    this._risuFetch = pluginApis.risuFetch;
    this._nativeFetch = pluginApis.nativeFetch;
    this._getArg = pluginApis.getArg;
    this._setArg = pluginApis.setArg;
    this._getChar = pluginApis.getChar;
    this._setChar = pluginApis.setChar;
    this._addProvider = pluginApis.addProvider;
    this._addRisuScriptHandler = pluginApis.addRisuScriptHandler;
    this._removeRisuScriptHandler = pluginApis.removeRisuScriptHandler;
    this._addRisuReplacer = pluginApis.addRisuReplacer;
    this._removeRisuReplacer = pluginApis.removeRisuReplacer;
    this._onUnload = pluginApis.onUnload;

    // eval로 초기화할 함수들 (나중에 initialize에서 설정됨)
    this._getDatabase = null;
    this._setDatabaseLite = null;

    // 싱글톤 인스턴스 저장
    RisuAPI._instance = this;
  }

  /**
   * RisuAPI 초기화
   * eval을 통해 전역 컨텍스트의 함수들을 가져옵니다.
   * @returns {Promise<boolean>} 초기화 성공 여부
   */
  async initialize() {
    try {
      this._getDatabase = getDatabase;
      this._setDatabaseLite = setDatabaseLite;
      console.log(`[${PLUGIN_NAME}] RisuAPI initialized successfully`);
      return true;
    } catch (error) {
      console.log(`[${PLUGIN_NAME}] Failed to initialize RisuAPI:`, error);
      return false;
    }
  }

  /**
   * 싱글톤 인스턴스 가져오기 또는 생성
   *
   * @param {Object} [pluginApis] - 플러그인 API 객체. 첫 번째 호출 시에만 필요합니다.
   * @returns {RisuAPI} RisuAPI 인스턴스
   * @throws {Error} 인스턴스가 없고 pluginApis가 제공되지 않은 경우
   */
  static getInstance(pluginApis = null) {
    if (!RisuAPI._instance) {
      if (!pluginApis) {
        throw new Error(
          'RisuAPI instance does not exist. Provide pluginApis on first call.',
        );
      }
      RisuAPI._instance = new RisuAPI(pluginApis);
    }
    return RisuAPI._instance;
  }

  /**
   * 싱글톤 인스턴스 리셋 (테스트용)
   */
  static resetInstance() {
    RisuAPI._instance = null;
  }

  // ==================== Fetch API ====================

  /**
   * CORS 제한 없이 URL을 가져옵니다.
   *
   * 참고: `nativeFetch`를 사용하는 것이 권장됩니다.
   * `nativeFetch`는 표준 fetch API와 유사하며 더 예측 가능한 동작을 제공합니다.
   *
   * @param {string} url - 가져올 URL
   * @param {Object} [arg={}] - Fetch 인자
   * @param {string|Object} [arg.body] - 요청 본문. 객체인 경우 JSON으로 변환됩니다.
   * @param {Record<string, string>} [arg.headers] - 요청 헤더
   * @param {string} [arg.method='POST'] - 요청 메서드. `GET`, `POST` 지원
   * @param {AbortSignal} [arg.abortSignal] - 요청 중단 신호
   * @param {boolean} [arg.rawResponse=false] - true인 경우 응답이 Uint8Array로 반환됩니다.
   * @returns {Promise<Object>} Fetch 결과
   * @returns {boolean} returns.ok - 요청 성공 여부
   * @returns {any} returns.data - 응답 데이터. JSON 가능한 경우 파싱되며, rawResponse가 true면 Uint8Array
   * @returns {Record<string, string>} returns.headers - 응답 헤더
   */
  risuFetch(url, arg = {}) {
    // 싱글톤 인스턴스의 원본 함수를 호출 (this는 항상 같은 인스턴스를 참조)
    return this._risuFetch(url, arg);
  }

  /**
   * CORS 제한 없이 URL을 가져옵니다.
   * 표준 fetch API의 하위 집합으로 설계되었으며, CORS 제한이 없고 기본 메서드가 `POST`입니다.
   *
   * @param {string} url - 가져올 URL
   * @param {Object} [arg={}] - Fetch 인자
   * @param {string|Uint8Array|ArrayBuffer} [arg.body] - 요청 본문
   * @param {Record<string, string>} [arg.headers] - 요청 헤더
   * @param {string} [arg.method='POST'] - 요청 메서드. `GET`, `POST`, `PUT`, `DELETE` 지원
   * @param {AbortSignal} [arg.signal] - 요청 중단 신호
   * @returns {Promise<Response>} 표준 Response 객체
   */
  nativeFetch(url, arg = {}) {
    return this._nativeFetch(url, arg);
  }

  // ==================== Argument API ====================

  /**
   * 인자 값을 이름으로 가져옵니다.
   *
   * @param {string} name - 인자 이름. `<plugin_name>::<arg_name>` 형식이어야 합니다. (예: `exampleplugin::arg1`)
   * @returns {string|number} 인자 값
   */
  getArg(name) {
    return this._getArg(name);
  }

  /**
   * 인자 값을 이름으로 설정합니다.
   *
   * @param {string} name - 인자 이름. `<plugin_name>::<arg_name>` 형식이어야 합니다. (예: `exampleplugin::arg1`)
   * @param {string|number} value - 인자 값
   */
  setArg(name, value) {
    return this._setArg(name, value);
  }

  // ==================== Character API ====================

  /**
   * 현재 캐릭터를 가져옵니다.
   *
   * @returns {Object} 현재 캐릭터 객체
   */
  getChar() {
    return this._getChar();
  }

  /**
   * 현재 캐릭터를 설정합니다.
   *
   * @param {Object} char - 설정할 캐릭터 객체
   */
  setChar(char) {
    return this._setChar(char);
  }

  // ==================== Provider API ====================

  /**
   * 프로바이더를 추가합니다.
   *
   * @param {string} type - 프로바이더 이름
   * @param {Function} func - 프로바이더 함수
   * @param {Object} func.arg - 프로바이더 인자
   * @param {Array} func.arg.prompt_chat - 채팅 프롬프트
   * @param {number} [func.arg.frequency_penalty] - 빈도 페널티
   * @param {number} [func.arg.min_p] - 최소 p 값
   * @param {number} [func.arg.presence_penalty] - 존재 페널티
   * @param {number} [func.arg.repetition_penalty] - 반복 페널티
   * @param {number} [func.arg.top_k] - Top k 값
   * @param {number} [func.arg.top_p] - Top p 값
   * @param {number} [func.arg.temperature] - 온도 값
   * @param {number} [func.arg.max_tokens] - 최대 토큰 수
   * @param {string} func.arg.mode - 모드. `model`, `submodel`, `memory`, `emotion`, `otherAx`, `translate` 중 하나
   * @param {AbortSignal} [func.abortSignal] - 요청 중단 신호
   * @param {Promise<Object>} func.returns - 프로바이더 결과
   * @param {boolean} func.returns.success - 프로바이더 성공 여부
   * @param {string|ReadableStream<string>} func.returns.content - 프로바이더 콘텐츠. ReadableStream인 경우 스트리밍됩니다.
   * @param {Object} [options] - 프로바이더 옵션
   * @param {string} [options.tokenizer] - 토크나이저 이름. `"mistral"`, `"llama"`, `"novelai"`, `"claude"`, `"novellist"`, `"llama3"`, `"gemma"`, `"cohere"`, `"tiktoken"`, `"custom"` 중 하나
   * @param {Function} [options.tokenizerFunc] - 커스텀 토크나이저 함수. `(content: string) => number[]|Promise<number[]>`
   */
  addProvider(type, func, options) {
    return this._addProvider(type, func, options);
  }

  // ==================== Risu Script Handler API ====================

  /**
   * Risu 스크립트 핸들러를 추가합니다.
   *
   * @param {string} type - 핸들러 타입. `display`, `output`, `input`, `process` 중 하나
   *   - `display`: 데이터가 표시될 때 호출됩니다.
   *   - `output`: AI 모델이 데이터를 출력할 때 호출됩니다.
   *   - `input`: 사용자가 데이터를 입력할 때 호출됩니다.
   *   - `process`: 실제 요청 데이터를 생성할 때 호출됩니다.
   * @param {Function} func - 핸들러 함수
   * @param {string} func.content - 처리할 콘텐츠
   * @returns {string|null|undefined|Promise<string|null|undefined>} 핸들러 결과. 문자열 또는 문자열 Promise인 경우 데이터가 결과로 대체됩니다.
   */
  addRisuScriptHandler(type, func) {
    return this._addRisuScriptHandler(type, func);
  }

  /**
   * Risu 스크립트 핸들러를 제거합니다.
   *
   * @param {string} type - 핸들러 타입. `display`, `output`, `input`, `process` 중 하나
   * @param {Function} func - 제거할 핸들러 함수
   */
  removeRisuScriptHandler(type, func) {
    return this._removeRisuScriptHandler(type, func);
  }

  // ==================== Risu Replacer API ====================

  /**
   * Risu 리플레이서를 추가합니다.
   *
   * @param {string} type - 리플레이서 타입. `beforeRequest`, `afterRequest` 중 하나
   *   - `beforeRequest`: 요청이 전송되기 직전에 호출됩니다.
   *   - `afterRequest`: 응답이 수신된 직후에 호출됩니다.
   * @param {Function} func - 리플레이서 함수. 타입에 따라 시그니처가 다릅니다.
   *   - `afterRequest` 타입: `(content: string, mode: string) => string`
   *   - `beforeRequest` 타입: `(content: Chat[], mode: string) => Chat[]`
   *   - mode는 `model`, `submodel`, `memory`, `emotion`, `otherAx`, `translate` 중 하나입니다.
   */
  addRisuReplacer(type, func) {
    return this._addRisuReplacer(type, func);
  }

  /**
   * Risu 리플레이서를 제거합니다.
   *
   * @param {string} type - 리플레이서 타입. `beforeRequest`, `afterRequest` 중 하나
   * @param {Function} func - 제거할 리플레이서 함수
   */
  removeRisuReplacer(type, func) {
    return this._removeRisuReplacer(type, func);
  }

  // ==================== Lifecycle API ====================

  /**
   * 플러그인 언로드 핸들러를 추가합니다.
   * 플러그인이 언로드될 때 호출될 함수를 등록합니다.
   *
   * @param {Function} func - 언로드 시 호출할 함수
   */
  onUnload(func) {
    return this._onUnload(func);
  }

  // ==================== Database API ====================

  /**
   * 데이터베이스를 가져옵니다.
   * @returns {any} 데이터베이스 객체
   */
  getDatabase() {
    if (!this._getDatabase) {
      throw new Error('RisuAPI is not initialized. Call initialize() first.');
    }
    return this._getDatabase();
  }

  /**
   * 데이터베이스 Lite를 설정합니다.
   * @param {any} data - 설정할 데이터
   */
  setDatabaseLite(data) {
    if (!this._setDatabaseLite) {
      throw new Error('RisuAPI is not initialized. Call initialize() first.');
    }
    return this._setDatabaseLite(data);
  }

  /**
   * 현재 채팅 페이지를 가져옵니다.
   * @returns {number|null}
   */
  getCurrentChatPage() {
    const char = this._getChar();
    if (char == null) return null;
    return char.chatPage;
  }

  /**
   * 현재 채팅 페이지의 모든 메시지를 가져옵니다.
   * @returns {Message[]|null}
   */
  getAllCurrentChatMessages() {
    const char = this._getChar();
    if (char == null) return null;
    return char.chats[this.getCurrentChatPage()].message;
  }

  /**
   * 마지막 채팅 인덱스를 가져옵니다.
   * @returns {number|null}
   */
  getLastChatIndex() {
    const char = this._getChar();
    if (char == null) return null;

    return char.chats[this.getCurrentChatPage()].message.length;
  }

  /**
   * 현재 채팅의 마지막 채팅 메세지를 가져옵니다.
   */
  getLastChatMessage() {
    const char = this._getChar();
    if (char == null) return null;

    return char.chats[this.getCurrentChatPage()].message[
      this.getLastChatIndex()
    ];
  }
}
