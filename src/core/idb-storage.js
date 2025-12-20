import { openDB } from 'idb';

import { PLUGIN_NAME } from '../constants.js';

const DB_NAME = `${PLUGIN_NAME}-db`;
const DB_VERSION = 1;
const STORE_NAME = `${PLUGIN_NAME}-store`;

/**
 * IndexedDB Storage Class
 *
 * Generic key-value storage using IndexedDB with CRUD operations.
 *
 * @example
 * const storage = new IdbStorage();
 *
 * // Create/Update
 * await storage.save('user-avatar', imageBlob);
 *
 * // Read
 * const blob = await storage.get('user-avatar');
 *
 * // Delete
 * await storage.delete('user-avatar');
 *
 * // Read All
 * const allItems = await storage.getAll();
 *
 * // Clear All
 * await storage.clear();
 */
export class IdbStorage {
  constructor() {
    this.dbName = DB_NAME;
    this.storeName = STORE_NAME;
    this.version = DB_VERSION;
  }

  /**
   * Initialize IndexedDB
   * @private
   * @returns {Promise<IDBDatabase>}
   */
  async _initDB() {
    return openDB(this.dbName, this.version, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          // Create object store without keyPath (use explicit keys)
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }

  /**
   * Save (Create/Update) a value
   * @param {string} key - Storage key
   * @param {any} value - Value to store (Blob, Object, String, etc.)
   * @returns {Promise<void>}
   *
   * @example
   * await storage.save('avatar', imageBlob);
   * await storage.save('settings', { theme: 'dark' });
   */
  async save(key, value) {
    const db = await this._initDB();
    await db.put(this.storeName, value, key);
  }

  /**
   * Get (Read) a value
   * @param {string} key - Storage key
   * @returns {Promise<any|undefined>} Stored value or undefined if not found
   *
   * @example
   * const avatar = await storage.get('avatar');
   * if (avatar) {
   *   console.log('Found:', avatar);
   * }
   */
  async get(key) {
    const db = await this._initDB();
    return await db.get(this.storeName, key);
  }

  /**
   * Delete a value
   * @param {string} key - Storage key
   * @returns {Promise<void>}
   *
   * @example
   * await storage.delete('avatar');
   */
  async delete(key) {
    const db = await this._initDB();
    await db.delete(this.storeName, key);
  }

  /**
   * Get all entries
   * @returns {Promise<Array<any>>} Array of all stored values
   *
   * @example
   * const allItems = await storage.getAll();
   * console.log('Total items:', allItems.length);
   */
  async getAll() {
    const db = await this._initDB();
    return await db.getAll(this.storeName);
  }

  /**
   * Get all keys
   * @returns {Promise<Array<string>>} Array of all keys
   *
   * @example
   * const keys = await storage.getAllKeys();
   * console.log('Keys:', keys);
   */
  async getAllKeys() {
    const db = await this._initDB();
    return await db.getAllKeys(this.storeName);
  }

  /**
   * Clear all data
   * @returns {Promise<void>}
   *
   * @example
   * await storage.clear();
   * console.log('All data cleared');
   */
  async clear() {
    const db = await this._initDB();
    await db.clear(this.storeName);
  }

  /**
   * Check if a key exists
   * @param {string} key - Storage key
   * @returns {Promise<boolean>} True if key exists
   *
   * @example
   * const exists = await storage.has('avatar');
   * if (exists) {
   *   console.log('Avatar exists');
   * }
   */
  async has(key) {
    const value = await this.get(key);
    return value !== undefined;
  }

  /**
   * Count total entries
   * @returns {Promise<number>} Number of entries
   *
   * @example
   * const count = await storage.count();
   * console.log(`Total items: ${count}`);
   */
  async count() {
    const db = await this._initDB();
    return await db.count(this.storeName);
  }
}

// Export singleton instance for convenience
export const storage = new IdbStorage();

// Export default for named imports
export default IdbStorage;
