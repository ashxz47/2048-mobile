/**
 * Game Configuration Constants
 * Centralized configuration for the 2048 game
 */

export const GAME_CONFIG = {
  // Grid settings
  GRID_SIZE: 4,
  GRID_PADDING: 10,
  CELL_MARGIN: 10,

  // Tile generation
  TILE_2_PROBABILITY: 0.9, // 90% chance of spawning 2, 10% chance of 4

  // Win condition
  WIN_TILE: 2048,

  // Input settings
  MIN_SWIPE_DISTANCE: 50, // Minimum pixels to register a swipe
};

export const USERNAME_CONSTRAINTS = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 20,
  ALLOWED_PATTERN: /^[a-zA-Z0-9 _-]+$/,
};

export const LEADERBOARD_CONFIG = {
  MIN_GAMES_FOR_WINRATE: 10, // Minimum games to show win rate ranking
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

export const STORAGE_KEYS = {
  BEST_SCORE: '@best_score',
  STATS: '@stats',
  USER_ID: '@userId',
  USER_PROFILE: '@userProfile',
};

export const ANIMATION_DURATION = {
  TILE_MERGE: 100,
  MODAL_FADE: 300,
};

// UI Dimensions
export const UI_DIMENSIONS = {
  SCREEN_PADDING: 20,
  BUTTON_HEIGHT: 50,
  HEADER_HEIGHT: 100,
};
