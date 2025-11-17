import { getStats, getBestScore } from './storage';
import { getUserProfile } from './profile';

/**
 * Leaderboard service - handles fetching and managing leaderboard data
 * This is structured to easily integrate with a real backend API
 * Currently uses mock data combined with local user stats
 */

// Mock data for demonstration - in production, this would come from a backend API
const MOCK_PLAYERS = [
  { userId: 'player_001', username: 'GameMaster', bestScore: 24580, bestTile: 2048, gamesWon: 45, gamesPlayed: 120, winRate: 37.5 },
  { userId: 'player_002', username: 'TileMerger', bestScore: 18920, bestTile: 1024, gamesWon: 32, gamesPlayed: 95, winRate: 33.7 },
  { userId: 'player_003', username: 'ProSwiper', bestScore: 16340, bestTile: 2048, gamesWon: 28, gamesPlayed: 88, winRate: 31.8 },
  { userId: 'player_004', username: '2048Legend', bestScore: 15670, bestTile: 1024, gamesWon: 25, gamesPlayed: 82, winRate: 30.5 },
  { userId: 'player_005', username: 'GridKing', bestScore: 14220, bestTile: 512, gamesWon: 22, gamesPlayed: 75, winRate: 29.3 },
  { userId: 'player_006', username: 'NumberNinja', bestScore: 13580, bestTile: 1024, gamesWon: 20, gamesPlayed: 70, winRate: 28.6 },
  { userId: 'player_007', username: 'SwipeQueen', bestScore: 12940, bestTile: 512, gamesWon: 18, gamesPlayed: 65, winRate: 27.7 },
  { userId: 'player_008', username: 'TileTitan', bestScore: 11760, bestTile: 512, gamesWon: 16, gamesPlayed: 60, winRate: 26.7 },
  { userId: 'player_009', username: 'MergeMaster', bestScore: 10580, bestTile: 256, gamesWon: 14, gamesPlayed: 55, winRate: 25.5 },
  { userId: 'player_010', username: 'GridGuru', bestScore: 9820, bestTile: 512, gamesWon: 12, gamesPlayed: 50, winRate: 24.0 },
  { userId: 'player_011', username: 'PuzzlePro', bestScore: 8940, bestTile: 256, gamesWon: 10, gamesPlayed: 45, winRate: 22.2 },
  { userId: 'player_012', username: 'SlideAce', bestScore: 7860, bestTile: 256, gamesWon: 8, gamesPlayed: 40, winRate: 20.0 },
  { userId: 'player_013', username: 'BlockBuster', bestScore: 6780, bestTile: 128, gamesWon: 6, gamesPlayed: 35, winRate: 17.1 },
  { userId: 'player_014', username: 'Combo2048', bestScore: 5920, bestTile: 256, gamesWon: 5, gamesPlayed: 30, winRate: 16.7 },
  { userId: 'player_015', username: 'TileRookie', bestScore: 4560, bestTile: 128, gamesWon: 3, gamesPlayed: 25, winRate: 12.0 },
];

/**
 * Get current user's stats formatted for leaderboard
 * @returns {Promise<Object>}
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
 * Get leaderboard by best score
 * @param {number} limit - Number of top players to return (default: 20)
 * @returns {Promise<Array>}
 */
export const getLeaderboardByScore = async (limit = 20) => {
  try {
    const allPlayers = await getMergedLeaderboardData();

    return allPlayers
      .sort((a, b) => b.bestScore - a.bestScore)
      .slice(0, limit)
      .map((player, index) => ({
        ...player,
        rank: index + 1,
      }));
  } catch (error) {
    console.error('Error getting score leaderboard:', error);
    return [];
  }
};

/**
 * Get leaderboard by best tile
 * @param {number} limit - Number of top players to return (default: 20)
 * @returns {Promise<Array>}
 */
export const getLeaderboardByTile = async (limit = 20) => {
  try {
    const allPlayers = await getMergedLeaderboardData();

    return allPlayers
      .sort((a, b) => {
        // First sort by best tile
        if (b.bestTile !== a.bestTile) {
          return b.bestTile - a.bestTile;
        }
        // If tiles are equal, sort by score
        return b.bestScore - a.bestScore;
      })
      .slice(0, limit)
      .map((player, index) => ({
        ...player,
        rank: index + 1,
      }));
  } catch (error) {
    console.error('Error getting tile leaderboard:', error);
    return [];
  }
};

/**
 * Get leaderboard by win rate
 * @param {number} limit - Number of top players to return (default: 20)
 * @returns {Promise<Array>}
 */
export const getLeaderboardByWinRate = async (limit = 20) => {
  try {
    const allPlayers = await getMergedLeaderboardData();

    // Filter players with at least 10 games played for fair comparison
    const qualifiedPlayers = allPlayers.filter(player => player.gamesPlayed >= 10);

    return qualifiedPlayers
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, limit)
      .map((player, index) => ({
        ...player,
        rank: index + 1,
      }));
  } catch (error) {
    console.error('Error getting win rate leaderboard:', error);
    return [];
  }
};

/**
 * Get leaderboard by total games won
 * @param {number} limit - Number of top players to return (default: 20)
 * @returns {Promise<Array>}
 */
export const getLeaderboardByWins = async (limit = 20) => {
  try {
    const allPlayers = await getMergedLeaderboardData();

    return allPlayers
      .sort((a, b) => b.gamesWon - a.gamesWon)
      .slice(0, limit)
      .map((player, index) => ({
        ...player,
        rank: index + 1,
      }));
  } catch (error) {
    console.error('Error getting wins leaderboard:', error);
    return [];
  }
};

/**
 * Get current user's rank in a specific category
 * @param {string} category - 'score' | 'tile' | 'winRate' | 'wins'
 * @returns {Promise<{rank: number, total: number} | null>}
 */
export const getCurrentUserRank = async (category = 'score') => {
  try {
    let leaderboard;

    switch (category) {
      case 'score':
        leaderboard = await getLeaderboardByScore(100);
        break;
      case 'tile':
        leaderboard = await getLeaderboardByTile(100);
        break;
      case 'winRate':
        leaderboard = await getLeaderboardByWinRate(100);
        break;
      case 'wins':
        leaderboard = await getLeaderboardByWins(100);
        break;
      default:
        leaderboard = await getLeaderboardByScore(100);
    }

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
