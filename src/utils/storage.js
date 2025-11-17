import AsyncStorage from '@react-native-async-storage/async-storage';

const BEST_SCORE_KEY = '@2048_best_score';
const STATS_KEY = '@2048_stats';

// Save best score
export const saveBestScore = async (score) => {
  try {
    await AsyncStorage.setItem(BEST_SCORE_KEY, score.toString());
  } catch (error) {
    console.error('Error saving best score:', error);
  }
};

// Get best score
export const getBestScore = async () => {
  try {
    const value = await AsyncStorage.getItem(BEST_SCORE_KEY);
    return value !== null ? parseInt(value, 10) : 0;
  } catch (error) {
    console.error('Error getting best score:', error);
    return 0;
  }
};

// Save game statistics
export const saveStats = async (stats) => {
  try {
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving stats:', error);
  }
};

// Get game statistics
export const getStats = async () => {
  try {
    const value = await AsyncStorage.getItem(STATS_KEY);
    return value !== null ? JSON.parse(value) : {
      gamesPlayed: 0,
      gamesWon: 0,
      totalMoves: 0,
      bestTile: 0,
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    return {
      gamesPlayed: 0,
      gamesWon: 0,
      totalMoves: 0,
      bestTile: 0,
    };
  }
};

// Update statistics
export const updateStats = async (gameData) => {
  try {
    const currentStats = await getStats();
    const newStats = {
      gamesPlayed: currentStats.gamesPlayed + 1,
      gamesWon: currentStats.gamesWon + (gameData.won ? 1 : 0),
      totalMoves: currentStats.totalMoves + gameData.moves,
      bestTile: Math.max(currentStats.bestTile, gameData.highestTile),
    };
    await saveStats(newStats);
    return newStats;
  } catch (error) {
    console.error('Error updating stats:', error);
    return null;
  }
};
