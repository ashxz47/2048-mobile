/**
 * GameStats Domain Model
 * Encapsulates game statistics with validation and computed properties
 */
export class GameStats {
  constructor(data = {}) {
    this.gamesPlayed = data.gamesPlayed || 0;
    this.gamesWon = data.gamesWon || 0;
    this.totalMoves = data.totalMoves || 0;
    this.bestTile = data.bestTile || 0;
    this.bestScore = data.bestScore || 0;
  }

  /**
   * Calculated win rate (0 to 1)
   */
  get winRate() {
    return this.gamesPlayed > 0 ? this.gamesWon / this.gamesPlayed : 0;
  }

  /**
   * Average moves per game
   */
  get averageMovesPerGame() {
    return this.gamesPlayed > 0 ? this.totalMoves / this.gamesPlayed : 0;
  }

  /**
   * Win rate as percentage (0-100)
   */
  get winRatePercentage() {
    return this.winRate * 100;
  }

  /**
   * Increment game statistics after a game ends
   * @param {boolean} won - Whether the game was won
   * @param {number} moves - Number of moves in the game
   * @param {number} tile - Best tile achieved
   * @param {number} score - Final score
   * @returns {GameStats} New GameStats instance with updated values
   */
  incrementGame(won, moves, tile, score) {
    return new GameStats({
      gamesPlayed: this.gamesPlayed + 1,
      gamesWon: this.gamesWon + (won ? 1 : 0),
      totalMoves: this.totalMoves + moves,
      bestTile: Math.max(this.bestTile, tile),
      bestScore: Math.max(this.bestScore, score),
    });
  }

  /**
   * Convert to plain object for storage
   */
  toJSON() {
    return {
      gamesPlayed: this.gamesPlayed,
      gamesWon: this.gamesWon,
      totalMoves: this.totalMoves,
      bestTile: this.bestTile,
      bestScore: this.bestScore,
    };
  }

  /**
   * Create GameStats from plain object
   */
  static fromJSON(json) {
    if (!json) return GameStats.default();
    return new GameStats(json);
  }

  /**
   * Create default GameStats (all zeros)
   */
  static default() {
    return new GameStats();
  }
}
