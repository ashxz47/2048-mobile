import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_KEY = '@2048_user_profile';
const USER_ID_KEY = '@2048_user_id';

/**
 * Generate a unique user ID
 */
const generateUserId = () => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get user profile (username, userId)
 * @returns {Promise<{username: string, userId: string} | null>}
 */
export const getUserProfile = async () => {
  try {
    const profileData = await AsyncStorage.getItem(PROFILE_KEY);
    if (profileData) {
      return JSON.parse(profileData);
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

/**
 * Save user profile
 * @param {string} username
 * @returns {Promise<{username: string, userId: string}>}
 */
export const saveUserProfile = async (username) => {
  try {
    let userId = await AsyncStorage.getItem(USER_ID_KEY);

    // Generate userId if it doesn't exist
    if (!userId) {
      userId = generateUserId();
      await AsyncStorage.setItem(USER_ID_KEY, userId);
    }

    const profile = {
      username: username.trim(),
      userId,
      createdAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
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
    return profile !== null && profile.username && profile.username.length > 0;
  } catch (error) {
    console.error('Error checking user profile:', error);
    return false;
  }
};

/**
 * Update username
 * @param {string} newUsername
 * @returns {Promise<void>}
 */
export const updateUsername = async (newUsername) => {
  try {
    const profile = await getUserProfile();
    if (profile) {
      profile.username = newUsername.trim();
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } else {
      await saveUserProfile(newUsername);
    }
  } catch (error) {
    console.error('Error updating username:', error);
    throw error;
  }
};
