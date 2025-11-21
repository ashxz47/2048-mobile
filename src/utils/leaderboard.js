/**
 * Leaderboard Service
 * Handles fetching and managing leaderboard data with strategy pattern
 * Structured to easily integrate with a real backend API
 */
import { getStats, getBestScore } from './storage';
import { getUserProfile } from './profile';
import { LEADERBOARD_CONFIG } from './constants';

// Mock data for demonstration - in production, this would come from a backend API
const MOCK_PLAYERS = [
  { userId: 'player_001', username: 'GameMaster', bestScore: 24580, bestTile: 2048, gamesWon: 45, gamesPlayed: 120, winRate: 37.5, totalMoves: 3456 },
  { userId: 'player_002', username: 'TileMerger', bestScore: 18920, bestTile: 1024, gamesWon: 32, gamesPlayed: 95, winRate: 33.7, totalMoves: 2890 },
  { userId: 'player_003', username: 'ProSwiper', bestScore: 16340, bestTile: 2048, gamesWon: 28, gamesPlayed: 88, winRate: 31.8, totalMoves: 2567 },
  { userId: 'player_004', username: '2048Legend', bestScore: 15670, bestTile: 1024, gamesWon: 25, gamesPlayed: 82, winRate: 30.5, totalMoves: 2345 },
  { userId: 'player_005', username: 'GridKing', bestScore: 14220, bestTile: 512, gamesWon: 22, gamesPlayed: 75, winRate: 29.3, totalMoves: 2123 },
  { userId: 'player_006', username: 'NumberNinja', bestScore: 13580, bestTile: 1024, gamesWon: 20, gamesPlayed: 70, winRate: 28.6, totalMoves: 1987 },
  { userId: 'player_007', username: 'SwipeQueen', bestScore: 12940, bestTile: 512, gamesWon: 18, gamesPlayed: 65, winRate: 27.7, totalMoves: 1845 },
  { userId: 'player_008', username: 'TileTitan', bestScore: 11760, bestTile: 512, gamesWon: 16, gamesPlayed: 60, winRate: 26.7, totalMoves: 1723 },
  { userId: 'player_009', username: 'MergeMaster', bestScore: 10580, bestTile: 256, gamesWon: 14, gamesPlayed: 55, winRate: 25.5, totalMoves: 1589 },
  { userId: 'player_010', username: 'GridGuru', bestScore: 9820, bestTile: 512, gamesWon: 12, gamesPlayed: 50, winRate: 24.0, totalMoves: 1456 },
  { userId: 'player_011', username: 'PuzzlePro', bestScore: 8940, bestTile: 256, gamesWon: 10, gamesPlayed: 45, winRate: 22.2, totalMoves: 1345 },
  { userId: 'player_012', username: 'SlideAce', bestScore: 7860, bestTile: 256, gamesWon: 8, gamesPlayed: 40, winRate: 20.0, totalMoves: 1234 },
  { userId: 'player_013', username: 'BlockBuster', bestScore: 6780, bestTile: 128, gamesWon: 6, gamesPlayed: 35, winRate: 17.1, totalMoves: 1123 },
  { userId: 'player_014', username: 'Combo2048', bestScore: 5920, bestTile: 256, gamesWon: 5, gamesPlayed: 30, winRate: 16.7, totalMoves: 987 },
  { userId: 'player_015', username: 'TileRookie', bestScore: 4560, bestTile: 128, gamesWon: 3, gamesPlayed: 25, winRate: 12.0, totalMoves: 856 },
];

/**
 * Leaderboard Strategies
 * Defines sorting, filtering, and formatting for each leaderboard category
 */
export const LEADERBOARD_STRATEGIES = {
  score: {
    sortFn: (a, b) => b.bestScore - a.bestScore,
    filterFn: () => true,
    field: 'bestScore',
    formatter: (val) => val.toLocaleString(),
    label: 'Best Score',
  },
  tile: {
    sortFn: (a, b) => {
      // First sort by best tile, then by score as tiebreaker
      if (b.bestTile !== a.bestTile) return b.bestTile - a.bestTile;
      return b.bestScore - a.bestScore;
    },
    filterFn: () => true,
    field: 'bestTile',
    formatter: (val) => val.toString(),
    label: 'Best Tile',
  },
  winRate: {
    sortFn: (a, b) => b.winRate - a.winRate,
    filterFn: (p) => p.gamesPlayed >= LEADERBOARD_CONFIG.MIN_GAMES_FOR_WINRATE,
    field: 'winRate',
    formatter: (val) => `${val.toFixed(1)}%`,
    label: 'Win Rate',
  },
  wins: {
    sortFn: (a, b) => b.gamesWon - a.gamesWon,
    filterFn: () => true,
    field: 'gamesWon',
    formatter: (val) => val.toLocaleString(),
    label: 'Total Wins',
  },
  moves: {
    sortFn: (a, b) => a.totalMoves - b.totalMoves || b.bestScore - a.bestScore,
    filterFn: (p) => p.gamesPlayed > 0,
    field: 'totalMoves',
    formatter: (val) => val.toLocaleString(),
    label: 'Total Moves',
  },
};

/**
 * Get current user's stats formatted for leaderboard
 * @returns {Promise<Object | null>}
 */
const getCurrentUserStats = async () => {
  try {
    const profile = await getUserProfile();
    const stats = await getStats();
    const bestScore = await getBestScore();

    if (!profile) {
      return null;
    }

    return {
      userId: profile.userId,
      username: profile.username,
      bestScore: bestScore,
      bestTile: stats.bestTile || 0,
      gamesWon: stats.gamesWon || 0,
      gamesPlayed: stats.gamesPlayed || 0,
      totalMoves: stats.totalMoves || 0,
      winRate: stats.gamesPlayed > 0 ? (stats.gamesWon / stats.gamesPlayed) * 100 : 0,
      isCurrentUser: true,
    };
  } catch (error) {
    console.error('Error getting current user stats:', error);
    return null;
  }
};

/**
 * Merge mock data with current user data
 * @returns {Promise<Array>}
 */
const getMergedLeaderboardData = async () => {
  const currentUser = await getCurrentUserStats();

  if (!currentUser) {
    return MOCK_PLAYERS;
  }

  // Remove current user from mock data if exists (by userId)
  const filteredMockPlayers = MOCK_PLAYERS.filter(
    player => player.userId !== currentUser.userId
  );

  // Combine and return
  return [...filteredMockPlayers, currentUser];
};

/**
 * Get leaderboard for a specific category using strategy pattern
 * @param {string} category - Category key ('score', 'tile', 'winRate', 'wins', 'moves')
 * @param {number} limit - Number of top players to return
 * @returns {Promise<Array>}
 */
export const getLeaderboard = async (category, limit = LEADERBOARD_CONFIG.DEFAULT_LIMIT) => {
  try {
    const strategy = LEADERBOARD_STRATEGIES[category];
    if (!strategy) {
      throw new Error(`Unknown leaderboard category: ${category}`);
    }

    const allPlayers = await getMergedLeaderboardData();

    return allPlayers
      .filter(strategy.filterFn)
      .sort(strategy.sortFn)
      .slice(0, limit)
      .map((player, index) => ({
        ...player,
        rank: index + 1,
      }));
  } catch (error) {
    console.error(`Error getting ${category} leaderboard:`, error);
    return [];
  }
};

/**
 * Legacy functions for backward compatibility
 * These call the new getLeaderboard function with the appropriate category
 */
export const getLeaderboardByScore = async (limit = LEADERBOARD_CONFIG.DEFAULT_LIMIT) => {
  return getLeaderboard('score', limit);
};

export const getLeaderboardByTile = async (limit = LEADERBOARD_CONFIG.DEFAULT_LIMIT) => {
  return getLeaderboard('tile', limit);
};

export const getLeaderboardByWinRate = async (limit = LEADERBOARD_CONFIG.DEFAULT_LIMIT) => {
  return getLeaderboard('winRate', limit);
};

export const getLeaderboardByWins = async (limit = LEADERBOARD_CONFIG.DEFAULT_LIMIT) => {
  return getLeaderboard('wins', limit);
};

/**
 * Get current user's rank in a specific category
 * @param {string} category - 'score' | 'tile' | 'winRate' | 'wins' | 'moves'
 * @returns {Promise<{rank: number, total: number} | null>}
 */
export const getCurrentUserRank = async (category = 'score') => {
  try {
    const leaderboard = await getLeaderboard(category, LEADERBOARD_CONFIG.MAX_LIMIT);
    const currentUser = await getCurrentUserStats();

    if (!currentUser) {
      return null;
    }

    const userEntry = leaderboard.find(entry => entry.userId === currentUser.userId);

    return userEntry ? {
      rank: userEntry.rank,
      total: leaderboard.length,
    } : null;
  } catch (error) {
    console.error('Error getting current user rank:', error);
    return null;
  }
};

// Future: Functions to integrate with real backend API
// export const submitScoreToBackend = async (scoreData) => { ... }
// export const fetchLeaderboardFromBackend = async (category) => { ... }
// export const syncLocalStatsWithBackend = async () => { ... }
