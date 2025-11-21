/**
 * UserProfile Domain Model
 * Encapsulates user profile data with validation
 */
import { USERNAME_CONSTRAINTS } from '../utils/constants';

export class UserProfile {
  constructor(userId, username) {
    this.userId = userId;
    this.username = username;
  }

  /**
   * Validate username against constraints
   * @param {string} username - Username to validate
   * @returns {{valid: boolean, errors: string[], trimmed: string}}
   */
  static validateUsername(username) {
    const errors = [];
    const trimmed = username.trim();

    if (trimmed.length < USERNAME_CONSTRAINTS.MIN_LENGTH) {
      errors.push(`Username must be at least ${USERNAME_CONSTRAINTS.MIN_LENGTH} characters`);
    }

    if (trimmed.length > USERNAME_CONSTRAINTS.MAX_LENGTH) {
      errors.push(`Username must be at most ${USERNAME_CONSTRAINTS.MAX_LENGTH} characters`);
    }

    if (!USERNAME_CONSTRAINTS.ALLOWED_PATTERN.test(trimmed)) {
      errors.push('Username can only contain letters, numbers, spaces, underscores, and hyphens');
    }

    return {
      valid: errors.length === 0,
      errors,
      trimmed
    };
  }

  /**
   * Update username with validation
   * @param {string} newUsername - New username
   * @returns {UserProfile} New UserProfile instance with updated username
   * @throws {Error} If username is invalid
   */
  updateUsername(newUsername) {
    const validation = UserProfile.validateUsername(newUsername);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }
    return new UserProfile(this.userId, validation.trimmed);
  }

  /**
   * Check if profile is complete
   */
  isComplete() {
    return Boolean(this.userId && this.username);
  }

  /**
   * Convert to plain object for storage
   */
  toJSON() {
    return {
      userId: this.userId,
      username: this.username
    };
  }

  /**
   * Create UserProfile from plain object
   */
  static fromJSON(json) {
    if (!json) return null;
    return new UserProfile(json.userId, json.username);
  }
}
