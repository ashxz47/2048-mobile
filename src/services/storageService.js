/**
 * Storage Service
 * Abstraction layer for AsyncStorage with consistent error handling
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';

class StorageService {
  constructor(storage) {
    this.storage = storage;
  }

  /**
   * Get value from storage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key doesn't exist or on error
   * @returns {Promise<*>} Stored value or default
   */
  async get(key, defaultValue = null) {
    try {
      const value = await this.storage.getItem(key);
      return value !== null ? JSON.parse(value) : defaultValue;
    } catch (error) {
      console.error(`Storage get error [${key}]:`, error);
      return defaultValue;
    }
  }

  /**
   * Set value in storage
   * @param {string} key - Storage key
   * @param {*} value - Value to store (will be JSON stringified)
   * @returns {Promise<boolean>} Success status
   */
  async set(key, value) {
    try {
      await this.storage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Storage set error [${key}]:`, error);
      return false;
    }
  }

  /**
   * Remove value from storage
   * @param {string} key - Storage key
   * @returns {Promise<boolean>} Success status
   */
  async remove(key) {
    try {
      await this.storage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Storage remove error [${key}]:`, error);
      return false;
    }
  }

  /**
   * Update value in storage using update function
   * @param {string} key - Storage key
   * @param {Function} updateFn - Function that takes current value and returns new value
   * @param {*} defaultValue - Default value if key doesn't exist
   * @returns {Promise<*>} Updated value
   */
  async update(key, updateFn, defaultValue = null) {
    const current = await this.get(key, defaultValue);
    const updated = updateFn(current);
    await this.set(key, updated);
    return updated;
  }

  /**
   * Get multiple values in parallel
   * @param {Array<{key: string, defaultValue?: *}>} keys
   * @returns {Promise<Array<{key: string, value: *}>>}
   */
  async getMultiple(keys) {
    return Promise.all(
      keys.map(async ({ key, defaultValue }) => ({
        key,
        value: await this.get(key, defaultValue)
      }))
    );
  }

  /**
   * Set multiple values in parallel
   * @param {Array<{key: string, value: *}>} items
   * @returns {Promise<boolean[]>} Array of success statuses
   */
  async setMultiple(items) {
    return Promise.all(
      items.map(({ key, value }) => this.set(key, value))
    );
  }

  /**
   * Clear all storage (use with caution!)
   * @returns {Promise<boolean>} Success status
   */
  async clear() {
    try {
      await this.storage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }

  /**
   * Get all keys in storage
   * @returns {Promise<string[]>} Array of all storage keys
   */
  async getAllKeys() {
    try {
      return await this.storage.getAllKeys();
    } catch (error) {
      console.error('Storage getAllKeys error:', error);
      return [];
    }
  }
}

// Export singleton instance
export const storageService = new StorageService(AsyncStorage);

// Export class for testing purposes
export { StorageService };

// Export storage keys for convenience
export { STORAGE_KEYS };
