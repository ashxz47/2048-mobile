/**
 * Grid Domain Model
 * Encapsulates grid operations for the 2048 game
 */
import { GAME_CONFIG } from '../utils/constants';

export class Grid {
  constructor(size = GAME_CONFIG.GRID_SIZE) {
    this.size = size;
    this.cells = Array(size).fill(null).map(() => Array(size).fill(0));
  }

  /**
   * Get cell value at position
   */
  getCell(row, col) {
    return this.cells[row]?.[col] ?? 0;
  }

  /**
   * Set cell value at position (returns new Grid instance)
   */
  setCell(row, col, value) {
    const newGrid = this.clone();
    newGrid.cells[row][col] = value;
    return newGrid;
  }

  /**
   * Iterate over each cell with callback(value, row, col)
   */
  forEach(callback) {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        callback(this.cells[i][j], i, j);
      }
    }
  }

  /**
   * Find first cell matching predicate
   * @returns {{value, row, col} | null}
   */
  find(predicate) {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (predicate(this.cells[i][j], i, j)) {
          return { value: this.cells[i][j], row: i, col: j };
        }
      }
    }
    return null;
  }

  /**
   * Check if any cell matches predicate
   */
  some(predicate) {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (predicate(this.cells[i][j], i, j)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Get all empty cells
   * @returns {Array<{row, col}>}
   */
  getEmptyCells() {
    const empty = [];
    this.forEach((value, row, col) => {
      if (value === 0) empty.push({ row, col });
    });
    return empty;
  }

  /**
   * Get highest tile value in grid
   */
  getMaxTile() {
    let max = 0;
    this.forEach(value => {
      if (value > max) max = value;
    });
    return max;
  }

  /**
   * Clone grid (deep copy)
   */
  clone() {
    const newGrid = new Grid(this.size);
    newGrid.cells = this.cells.map(row => [...row]);
    return newGrid;
  }

  /**
   * Convert to 2D array
   */
  toArray() {
    return this.cells.map(row => [...row]);
  }

  /**
   * Create Grid from 2D array
   */
  static fromArray(array) {
    const grid = new Grid(array.length);
    grid.cells = array.map(row => [...row]);
    return grid;
  }

  /**
   * Create empty grid of specified size
   */
  static empty(size = GAME_CONFIG.GRID_SIZE) {
    return new Grid(size);
  }
}
