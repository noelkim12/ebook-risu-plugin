import { PLUGIN_NAME } from '../constants.js';
export class RisuAPI {
  static _instance = null;

  constructor() {
    if (RisuAPI._instance) {
      return;
    }

    this._charWatchers = new Map();
    this._databaseWatchers = new Map();
    this._watcherIdCounter = 0;

    RisuAPI._instance = this;
  }

  get _api() {
    const api = globalThis.risuai;
    if (!api) {
      throw new Error('RisuAPI is not available in this context.');
    }
    return api;
  }

  async initialize() {
    try {
      if (!this._api) {
        throw new Error('global risuai is missing');
      }
      console.log(`[${PLUGIN_NAME}] RisuAPI initialized successfully`);
      return true;
    } catch (error) {
      console.log(`[${PLUGIN_NAME}] Failed to initialize RisuAPI:`, error);
      return false;
    }
  }

  static getInstance() {
    if (!RisuAPI._instance) {
      RisuAPI._instance = new RisuAPI();
    }
    return RisuAPI._instance;
  }

  static resetInstance() {
    RisuAPI._instance = null;
  }

  async risuFetch(url, arg = {}) {
    return await this._api.risuFetch(url, arg);
  }

  async nativeFetch(url, arg = {}) {
    return await this._api.nativeFetch(url, arg);
  }

  async getArg(name) {
    return await this._api.getArgument(name);
  }

  async setArg(name, value) {
    return await this._api.setArgument(name, value);
  }

  async getChar() {
    return await this._api.getCharacter();
  }

  async setChar(char) {
    return await this._api.setCharacter(char);
  }

  subscribeToChar(selector, callback, interval = 500) {
    const id = ++this._watcherIdCounter;

    const getSnapshot = async () => {
      try {
        const char = await this.getChar();
        if (char == null) {
          return null;
        }
        const value = selector ? selector(char) : char;
        return JSON.stringify(value);
      } catch (e) {
        return null;
      }
    };

    const setupTimer = async () => {
      let lastSnapshot = await getSnapshot();
      const timer = setInterval(() => {
        void getSnapshot().then(currentSnapshot => {
          if (currentSnapshot !== lastSnapshot) {
            lastSnapshot = currentSnapshot;
            try {
              const newValue = currentSnapshot
                ? JSON.parse(currentSnapshot)
                : null;
              callback(newValue);
            } catch (e) {
              console.error(
                `[${PLUGIN_NAME}] subscribeToChar callback error:`,
                e,
              );
            }
          }
        });
      }, interval);

      this._charWatchers.set(id, timer);
    };

    void setupTimer();

    return () => {
      const timer = this._charWatchers.get(id);
      if (timer) {
        clearInterval(timer);
      }
      this._charWatchers.delete(id);
    };
  }

  async getChaId() {
    const char = await this.getChar();
    if (char == null) {
      return null;
    }
    return char.chaId;
  }

  async getCurrentChatPage() {
    const char = await this.getChar();
    if (char == null) {
      return null;
    }
    return char.chatPage;
  }

  async getAllCurrentChatMessages() {
    const char = await this.getChar();
    if (char == null) {
      return null;
    }
    const chatPage = await this.getCurrentChatPage();
    if (chatPage == null) {
      return null;
    }
    return char.chats?.[chatPage]?.message;
  }

  async getLastChatIndex() {
    const char = await this.getChar();
    const chatPage = await this.getCurrentChatPage();

    if (char == null || chatPage == null) {
      return null;
    }

    return char.chats?.[chatPage]?.message?.length;
  }

  async getLastChatMessage() {
    const char = await this.getChar();
    const chatPage = await this.getCurrentChatPage();
    if (char == null || chatPage == null) {
      return null;
    }

    const index = await this.getLastChatIndex();
    if (index == null) {
      return null;
    }

    return char.chats?.[chatPage]?.message?.[index];
  }

  async addProvider(type, func, options) {
    return await this._api.addProvider(type, func, options);
  }

  async addRisuScriptHandler(type, func) {
    return await this._api.addRisuScriptHandler(type, func);
  }

  async removeRisuScriptHandler(type, func) {
    return await this._api.removeRisuScriptHandler(type, func);
  }

  async addRisuReplacer(type, func) {
    return await this._api.addRisuReplacer(type, func);
  }

  async removeRisuReplacer(type, func) {
    return await this._api.removeRisuReplacer(type, func);
  }

  async onUnload(func) {
    return await this._api.onUnload(func);
  }

  clearAllSubscriptions() {
    this._charWatchers.forEach(timer => {
      clearInterval(timer);
    });
    this._charWatchers.clear();
    this._databaseWatchers.forEach(timer => {
      clearInterval(timer);
    });
    this._databaseWatchers.clear();
    console.log(`[${PLUGIN_NAME}] All subscriptions cleared`);
  }

  async getDatabase(includeOnly = 'all') {
    return await this._api.getDatabase(includeOnly);
  }

  async setDatabaseLite(db) {
    return await this._api.setDatabaseLite(db);
  }

  subscribeToDatabase(selector, callback, interval = 500) {
    const id = ++this._watcherIdCounter;

    const getSnapshot = async () => {
      try {
        const db = await this.getDatabase();
        if (db == null) {
          return null;
        }
        const value = selector ? selector(db) : db;
        return JSON.stringify(value);
      } catch (e) {
        return null;
      }
    };

    const setupTimer = async () => {
      let lastSnapshot = await getSnapshot();
      const timer = setInterval(() => {
        void getSnapshot().then(currentSnapshot => {
          if (currentSnapshot !== lastSnapshot) {
            lastSnapshot = currentSnapshot;
            try {
              const newValue = currentSnapshot
                ? JSON.parse(currentSnapshot)
                : null;
              callback(newValue);
            } catch (e) {
              console.error(
                `[${PLUGIN_NAME}] subscribeToDatabase callback error:`,
                e,
              );
            }
          }
        });
      }, interval);

      this._databaseWatchers.set(id, timer);
    };

    void setupTimer();

    return () => {
      const timer = this._databaseWatchers.get(id);
      if (timer) {
        clearInterval(timer);
      }
      this._databaseWatchers.delete(id);
    };
  }

  async getRootDocument() {
    return await this._api.getRootDocument();
  }

  async showContainer(mode) {
    return await this._api.showContainer(mode);
  }

  async hideContainer() {
    return await this._api.hideContainer();
  }

  async registerButton(config, callback) {
    return await this._api.registerButton(config, callback);
  }

  async createMutationObserver(callback) {
    return await this._api.createMutationObserver(callback);
  }
}
