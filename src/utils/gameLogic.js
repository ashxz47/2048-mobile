// 2048 Game Logic

// Helper function to efficiently compare arrays
const arraysEqual = (a, b) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

// Initialize empty 4x4 grid
export const initializeGrid = () => {
  const grid = Array(4).fill(null).map(() => Array(4).fill(0));
  return addRandomTile(addRandomTile(grid));
};

// Add a random tile (2 or 4) to an empty cell
export const addRandomTile = (grid) => {
  const emptyCells = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (grid[i][j] === 0) {
        emptyCells.push({ row: i, col: j });
      }
    }
  }

  if (emptyCells.length === 0) return grid;

  const newGrid = grid.map(row => [...row]);
  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const value = Math.random() < 0.9 ? 2 : 4; // 90% chance of 2, 10% chance of 4
  newGrid[randomCell.row][randomCell.col] = value;

  return newGrid;
};

// Rotate grid 90 degrees clockwise
const rotateGrid = (grid) => {
  const n = 4;
  const rotated = Array(n).fill(null).map(() => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      rotated[j][n - 1 - i] = grid[i][j];
    }
  }
  return rotated;
};

// Move and merge tiles in one direction (left)
const moveLeft = (grid) => {
  let newGrid = grid.map(row => [...row]);
  let score = 0;
  let moved = false;

  for (let i = 0; i < 4; i++) {
    // Filter out zeros
    let row = newGrid[i].filter(val => val !== 0);

    // Merge adjacent equal values
    for (let j = 0; j < row.length - 1; j++) {
      if (row[j] === row[j + 1]) {
        row[j] *= 2;
        score += row[j];
        row.splice(j + 1, 1);
      }
    }

    // Fill with zeros
    while (row.length < 4) {
      row.push(0);
    }

    // Check if row changed
    if (!arraysEqual(row, newGrid[i])) {
      moved = true;
    }

    newGrid[i] = row;
  }

  return { grid: newGrid, score, moved };
};

// Move tiles in specified direction
export const move = (grid, direction) => {
  let workingGrid = grid.map(row => [...row]);
  let rotations = 0;

  // Rotate grid so we can always use moveLeft logic
  switch (direction) {
    case 'up':
      rotations = 3;
      break;
    case 'right':
      rotations = 2;
      break;
    case 'down':
      rotations = 1;
      break;
    case 'left':
    default:
      rotations = 0;
      break;
  }

  // Rotate to make the move direction face left
  for (let i = 0; i < rotations; i++) {
    workingGrid = rotateGrid(workingGrid);
  }

  // Perform the move
  const { grid: movedGrid, score, moved } = moveLeft(workingGrid);

  // Rotate back
  let finalGrid = movedGrid;
  for (let i = 0; i < (4 - rotations) % 4; i++) {
    finalGrid = rotateGrid(finalGrid);
  }

  return { grid: finalGrid, score, moved };
};

// Check if any moves are possible
export const canMove = (grid) => {
  // Check for empty cells
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (grid[i][j] === 0) return true;
    }
  }

  // Check for possible merges
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const current = grid[i][j];
      // Check right
      if (j < 3 && current === grid[i][j + 1]) return true;
      // Check down
      if (i < 3 && current === grid[i + 1][j]) return true;
    }
  }

  return false;
};

// Check if player won (reached 2048)
export const hasWon = (grid) => {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (grid[i][j] === 2048) return true;
    }
  }
  return false;
};

// Get the highest tile value
export const getHighestTile = (grid) => {
  let max = 0;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (grid[i][j] > max) {
        max = grid[i][j];
      }
    }
  }
  return max;
};
