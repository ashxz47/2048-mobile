/**
 * Storage Utilities
 * High-level storage functions using storageService and domain models
 */
import { storageService, STORAGE_KEYS } from '../services/storageService';
import { GameStats } from '../models/GameStats';

// Save best score
export const saveBestScore = async (score) => {
  return storageService.set(STORAGE_KEYS.BEST_SCORE, score);
};

// Get best score
export const getBestScore = async () => {
  return storageService.get(STORAGE_KEYS.BEST_SCORE, 0);
};

// Save game statistics
export const saveStats = async (stats) => {
  const statsData = stats instanceof GameStats ? stats.toJSON() : stats;
  return storageService.set(STORAGE_KEYS.STATS, statsData);
};

// Get game statistics
export const getStats = async () => {
  const data = await storageService.get(STORAGE_KEYS.STATS, null);
  return GameStats.fromJSON(data);
};

// Update statistics after a game ends
export const updateStats = async (gameData) => {
  try {
    const currentStats = await getStats();
    const newStats = currentStats.incrementGame(
      gameData.won,
      gameData.moves,
      gameData.highestTile,
      gameData.score
    );
    await saveStats(newStats);

    // Also update best score if needed
    if (gameData.score > await getBestScore()) {
      await saveBestScore(gameData.score);
    }

    return newStats;
  } catch (error) {
    console.error('Error updating stats:', error);
    return null;
  }
};
