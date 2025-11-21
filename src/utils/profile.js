/**
 * User Profile Utilities
 * High-level profile functions using storageService and UserProfile model
 */
import { storageService, STORAGE_KEYS } from '../services/storageService';
import { UserProfile } from '../models/UserProfile';

/**
 * Generate a unique user ID
 */
const generateUserId = () => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get or generate user ID
 */
const getUserId = async () => {
  let userId = await storageService.get(STORAGE_KEYS.USER_ID);
  if (!userId) {
    userId = generateUserId();
    await storageService.set(STORAGE_KEYS.USER_ID, userId);
  }
  return userId;
};

/**
 * Get user profile
 * @returns {Promise<UserProfile | null>}
 */
export const getUserProfile = async () => {
  const profileData = await storageService.get(STORAGE_KEYS.USER_PROFILE);
  return UserProfile.fromJSON(profileData);
};

/**
 * Save user profile
 * @param {string} username
 * @returns {Promise<UserProfile>}
 */
export const saveUserProfile = async (username) => {
  try {
    // Validate username
    const validation = UserProfile.validateUsername(username);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // Get or generate userId
    const userId = await getUserId();

    // Create profile
    const profile = new UserProfile(userId, validation.trimmed);

    // Save to storage
    await storageService.set(STORAGE_KEYS.USER_PROFILE, profile.toJSON());

    return profile;
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

/**
 * Check if user has set up profile
 * @returns {Promise<boolean>}
 */
export const hasUserProfile = async () => {
  try {
    const profile = await getUserProfile();
    return profile !== null && profile.isComplete();
  } catch (error) {
    console.error('Error checking user profile:', error);
    return false;
  }
};

/**
 * Update username
 * @param {string} newUsername
 * @returns {Promise<UserProfile>}
 */
export const updateUsername = async (newUsername) => {
  try {
    const profile = await getUserProfile();

    if (profile) {
      // Update existing profile
      const updatedProfile = profile.updateUsername(newUsername);
      await storageService.set(STORAGE_KEYS.USER_PROFILE, updatedProfile.toJSON());
      return updatedProfile;
    } else {
      // Create new profile
      return await saveUserProfile(newUsername);
    }
  } catch (error) {
    console.error('Error updating username:', error);
    throw error;
  }
};
