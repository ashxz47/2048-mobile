# Refactoring Proposal - 2048 Mobile Game

**Date**: 2025-11-21
**Analysis**: Comprehensive codebase review (2,344 LOC)
**Priority**: Address technical debt while maintaining Clean Architecture principles

---

## Executive Summary

The codebase has **solid fundamentals** (separated game logic, pure functions, clean architecture intent) but suffers from common React Native anti-patterns:

- **God Components**: GameScreen (474 lines), LobbyScreen (543 lines)
- **Code Duplication**: ~400 lines of duplicate code across input handling and leaderboard service
- **Missing Abstractions**: No domain models, input controllers, or shared components
- **Critical Bug**: Navigation closure bug in App.js
- **Test Coverage**: Only 8.3% (1/12 files tested)

**Refactoring Impact**:
- Estimated LOC reduction: 35-40%
- Improved maintainability and testability
- Better SOLID principle adherence
- Enhanced performance (remove JSON.stringify deep clones)

---

## Critical Issues (Fix Immediately)

### 1. Navigation Closure Bug in App.js ⚠️

**File**: `App.js:29-35`

**Problem**: The `addListener` function captures `currentScreen` at call time, not execution time, causing focus listeners to be registered for the wrong screen.

```javascript
// BEFORE (BUGGY)
addListener: (event, callback) => {
  if (event === 'focus') {
    const screenName = currentScreen;  // ❌ Wrong screen captured
    setListeners(prev => ({
      ...prev,
      [screenName]: [...(prev[screenName] || []), callback]
    }));
```

**Fix**: Pass screen name explicitly to addListener
```javascript
// AFTER (FIXED)
addListener: (screenName, event, callback) => {
  if (event === 'focus') {
    setListeners(prev => ({
      ...prev,
      [screenName]: [...(prev[screenName] || []), callback]
    }));
```

**Impact**: Critical - breaks data reloading in LobbyScreen

---

## High Priority Refactorings

### 2. Extract Input Handling from GameScreen (~160 lines eliminated)

**Problem**: GameScreen has duplicate input handling logic across keyboard (lines 40-63), mouse (lines 66-101), and touch (lines 200-221).

**Solution**: Create `useInputController` custom hook

**New File**: `src/hooks/useInputController.js`
```javascript
/**
 * Unified input controller for game swipe gestures
 * Handles keyboard, mouse, and touch inputs
 */
export const useInputController = (onSwipe, enabled = true) => {
  // Keyboard handling
  const handleKeyboard = useCallback((e) => {
    if (!enabled) return;
    const keyMap = {
      ArrowUp: 'up', ArrowDown: 'down',
      ArrowLeft: 'left', ArrowRight: 'right',
      w: 'up', s: 'down', a: 'left', d: 'right'
    };
    if (keyMap[e.key]) onSwipe(keyMap[e.key]);
  }, [onSwipe, enabled]);

  // Mouse drag handling
  const mouseController = useMouseDrag({
    onSwipe,
    minDistance: GAME_CONFIG.MIN_SWIPE_DISTANCE,
    enabled
  });

  // Touch gesture handling
  const panResponder = usePanResponder({
    onSwipe,
    minDistance: GAME_CONFIG.MIN_SWIPE_DISTANCE,
    enabled
  });

  return { handleKeyboard, mouseController, panHandlers: panResponder };
};
```

**Benefits**:
- Eliminate 160+ lines of duplicate code
- Single source of truth for input handling
- Easy to add new input methods (gamepad, accessibility)
- Testable in isolation

---

### 3. Refactor Leaderboard Service (~90 lines eliminated)

**Problem**: Four nearly identical functions (`getLeaderboardByScore`, `getLeaderboardByTile`, `getLeaderboardByMoves`, `getLeaderboardByWinRate`) with 90% duplicate code.

**Solution**: Strategy pattern with single parameterized function

**File**: `src/utils/leaderboard.js` (refactored)
```javascript
// Define strategies
const LEADERBOARD_STRATEGIES = {
  score: {
    sortFn: (a, b) => b.bestScore - a.bestScore,
    filterFn: () => true,
    field: 'bestScore',
    formatter: (val) => val.toLocaleString(),
  },
  tile: {
    sortFn: (a, b) => b.bestTile - a.bestTile || b.bestScore - a.bestScore,
    filterFn: () => true,
    field: 'bestTile',
    formatter: (val) => val,
  },
  moves: {
    sortFn: (a, b) => a.totalMoves - b.totalMoves || b.bestScore - a.bestScore,
    filterFn: (p) => p.gamesPlayed > 0,
    field: 'totalMoves',
    formatter: (val) => val.toLocaleString(),
  },
  winrate: {
    sortFn: (a, b) => b.winRate - a.winRate || b.bestScore - a.bestScore,
    filterFn: (p) => p.gamesPlayed >= MIN_GAMES_FOR_WINRATE,
    field: 'winRate',
    formatter: (val) => `${(val * 100).toFixed(1)}%`,
  },
};

// Single function replaces 4 functions
export const getLeaderboard = async (category, limit = 20) => {
  try {
    const strategy = LEADERBOARD_STRATEGIES[category];
    if (!strategy) throw new Error(`Unknown category: ${category}`);

    const allPlayers = await getMergedLeaderboardData();
    return allPlayers
      .filter(strategy.filterFn)
      .sort(strategy.sortFn)
      .slice(0, limit)
      .map((player, index) => ({ ...player, rank: index + 1 }));
  } catch (error) {
    console.error(`Error getting ${category} leaderboard:`, error);
    return [];
  }
};

// Export strategies for use in UI
export { LEADERBOARD_STRATEGIES };
```

**Benefits**:
- Eliminate 4 duplicate functions
- Easy to add new leaderboard categories
- DRY principle
- Strategy config can drive UI (formatValue in HallOfFameScreen)

---

### 4. Split GameScreen into Smaller Units

**Problem**: GameScreen is 474 lines with 7+ responsibilities

**Solution**: Extract custom hooks and components

**New Files**:

#### `src/hooks/useGameState.js`
```javascript
export const useGameState = (navigation) => {
  const [grid, setGrid] = useState(() => initializeGrid());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [continueAfterWin, setContinueAfterWin] = useState(false);
  const [undoStack, setUndoStack] = useState([]);

  const executeMove = useCallback((direction) => {
    // Move logic here
  }, [grid, score, moves, gameOver, won, continueAfterWin]);

  const restartGame = useCallback(() => {
    // Restart logic
  }, []);

  const undoMove = useCallback(() => {
    // Undo logic
  }, [undoStack]);

  return {
    // State
    grid, score, bestScore, moves, gameOver, won, continueAfterWin,
    // Actions
    executeMove, restartGame, undoMove, setContinueAfterWin
  };
};
```

#### `src/components/GameModal.js`
```javascript
export const GameModal = ({
  visible,
  title,
  message,
  score,
  primaryAction,
  secondaryAction,
  onClose
}) => {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>
          <Text style={styles.modalScore}>Score: {score.toLocaleString()}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={primaryAction.onPress} style={styles.primaryButton}>
              <Text style={styles.buttonText}>{primaryAction.label}</Text>
            </TouchableOpacity>
            {secondaryAction && (
              <TouchableOpacity onPress={secondaryAction.onPress} style={styles.secondaryButton}>
                <Text style={styles.buttonText}>{secondaryAction.label}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};
```

#### `src/screens/GameScreen.styles.js`
```javascript
export const styles = StyleSheet.create({
  // Move all 135 lines of styles here
});
```

**After Refactoring**:
```javascript
// GameScreen.js (reduced from 474 to ~150 lines)
export default function GameScreen({ navigation }) {
  const gameState = useGameState(navigation);
  const inputEnabled = !gameState.gameOver && (gameState.won ? gameState.continueAfterWin : true);
  const { handleKeyboard, mouseController, panHandlers } = useInputController(
    gameState.executeMove,
    inputEnabled
  );

  // Attach keyboard listener
  useEffect(() => {
    const handler = (e) => handleKeyboard(e);
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleKeyboard]);

  return (
    <View style={styles.container} {...mouseController} {...panHandlers}>
      {/* Header with score */}
      <GameHeader
        score={gameState.score}
        bestScore={gameState.bestScore}
        moves={gameState.moves}
        onBack={() => navigation.navigate('Lobby')}
        onRestart={gameState.restartGame}
        onUndo={gameState.undoMove}
        canUndo={gameState.undoStack.length > 0}
      />

      {/* Game grid */}
      <Grid grid={gameState.grid} />

      {/* Win modal */}
      <GameModal
        visible={gameState.won && !gameState.continueAfterWin}
        title="You Win!"
        message="Congratulations! You reached 2048!"
        score={gameState.score}
        primaryAction={{ label: 'CONTINUE', onPress: () => gameState.setContinueAfterWin(true) }}
        secondaryAction={{ label: 'NEW GAME', onPress: gameState.restartGame }}
        onClose={() => gameState.setContinueAfterWin(true)}
      />

      {/* Game over modal */}
      <GameModal
        visible={gameState.gameOver}
        title="Game Over"
        message="No more moves available!"
        score={gameState.score}
        primaryAction={{ label: 'NEW GAME', onPress: gameState.restartGame }}
        secondaryAction={{ label: 'BACK TO LOBBY', onPress: () => navigation.navigate('Lobby') }}
        onClose={gameState.restartGame}
      />
    </View>
  );
}
```

**Benefits**:
- 474 lines → ~150 lines in GameScreen
- Reusable hooks and components
- Each file has single responsibility
- Much easier to test
- Better separation of concerns

---

### 5. Split LobbyScreen

**Problem**: LobbyScreen is 543 lines with mixed concerns

**Solution**: Extract modal components

**New Files**:

#### `src/components/StatsModal.js`
```javascript
export const StatsModal = ({
  visible,
  stats,
  userProfile,
  onClose,
  onEditUsername
}) => {
  // Extract the 106-line modal (lines 147-252)
  return (
    <Modal visible={visible} animationType="slide" transparent>
      {/* Stats display and profile editing UI */}
    </Modal>
  );
};
```

#### `src/components/ProfileEditor.js`
```javascript
export const ProfileEditor = ({
  username,
  onSave,
  onCancel
}) => {
  // Extract username editing logic
  return (
    <View>
      <TextInput value={username} onChangeText={setUsername} />
      <Button onPress={() => onSave(username)} title="Save" />
      <Button onPress={onCancel} title="Cancel" />
    </View>
  );
};
```

**Benefits**:
- 543 lines → ~250 lines in LobbyScreen
- Reusable components
- Easier to maintain and test

---

## Medium Priority Refactorings

### 6. Create Domain Models

**Problem**: Using plain objects everywhere, no encapsulation

**Solution**: Create domain classes with validation and computed properties

**New File**: `src/models/GameStats.js`
```javascript
export class GameStats {
  constructor(data = {}) {
    this.gamesPlayed = data.gamesPlayed || 0;
    this.gamesWon = data.gamesWon || 0;
    this.totalMoves = data.totalMoves || 0;
    this.bestTile = data.bestTile || 0;
    this.bestScore = data.bestScore || 0;
  }

  get winRate() {
    return this.gamesPlayed > 0 ? this.gamesWon / this.gamesPlayed : 0;
  }

  get averageMovesPerGame() {
    return this.gamesPlayed > 0 ? this.totalMoves / this.gamesPlayed : 0;
  }

  incrementGame(won, moves, tile, score) {
    return new GameStats({
      gamesPlayed: this.gamesPlayed + 1,
      gamesWon: this.gamesWon + (won ? 1 : 0),
      totalMoves: this.totalMoves + moves,
      bestTile: Math.max(this.bestTile, tile),
      bestScore: Math.max(this.bestScore, score),
    });
  }

  toJSON() {
    return {
      gamesPlayed: this.gamesPlayed,
      gamesWon: this.gamesWon,
      totalMoves: this.totalMoves,
      bestTile: this.bestTile,
      bestScore: this.bestScore,
    };
  }

  static fromJSON(json) {
    return new GameStats(json);
  }

  static default() {
    return new GameStats();
  }
}
```

**New File**: `src/models/UserProfile.js`
```javascript
export class UserProfile {
  constructor(userId, username) {
    this.userId = userId;
    this.username = username;
  }

  static validateUsername(username) {
    const errors = [];
    const trimmed = username.trim();

    if (trimmed.length < USERNAME_MIN_LENGTH) {
      errors.push(`Username must be at least ${USERNAME_MIN_LENGTH} characters`);
    }
    if (trimmed.length > USERNAME_MAX_LENGTH) {
      errors.push(`Username must be at most ${USERNAME_MAX_LENGTH} characters`);
    }
    if (!/^[a-zA-Z0-9 _-]+$/.test(trimmed)) {
      errors.push('Username can only contain letters, numbers, spaces, underscores, and hyphens');
    }

    return {
      valid: errors.length === 0,
      errors,
      trimmed
    };
  }

  updateUsername(newUsername) {
    const validation = UserProfile.validateUsername(newUsername);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }
    return new UserProfile(this.userId, validation.trimmed);
  }

  toJSON() {
    return {
      userId: this.userId,
      username: this.username
    };
  }

  static fromJSON(json) {
    return new UserProfile(json.userId, json.username);
  }
}
```

**New File**: `src/models/Grid.js`
```javascript
export class Grid {
  constructor(size = GRID_SIZE) {
    this.size = size;
    this.cells = Array(size).fill(null).map(() => Array(size).fill(0));
  }

  getCell(row, col) {
    return this.cells[row]?.[col] ?? 0;
  }

  setCell(row, col, value) {
    const newGrid = this.clone();
    newGrid.cells[row][col] = value;
    return newGrid;
  }

  forEach(callback) {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        callback(this.cells[i][j], i, j);
      }
    }
  }

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

  getEmptyCells() {
    const empty = [];
    this.forEach((value, row, col) => {
      if (value === 0) empty.push({ row, col });
    });
    return empty;
  }

  clone() {
    const newGrid = new Grid(this.size);
    newGrid.cells = this.cells.map(row => [...row]);
    return newGrid;
  }

  toArray() {
    return this.cells;
  }

  static fromArray(array) {
    const grid = new Grid(array.length);
    grid.cells = array.map(row => [...row]);
    return grid;
  }
}
```

**Benefits**:
- Encapsulation and validation
- Computed properties (winRate, averageMovesPerGame)
- Type safety (can migrate to TypeScript easily)
- Business logic in domain models
- Easier to test

---

### 7. Extract Constants

**Problem**: Magic numbers scattered throughout codebase

**New File**: `src/utils/constants.js`
```javascript
export const GAME_CONFIG = {
  GRID_SIZE: 4,
  TILE_2_PROBABILITY: 0.9,
  WIN_TILE: 2048,
  MIN_SWIPE_DISTANCE: 50,
  GRID_PADDING: 10,
  CELL_MARGIN: 10,
};

export const USERNAME_CONSTRAINTS = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 20,
  ALLOWED_PATTERN: /^[a-zA-Z0-9 _-]+$/,
};

export const LEADERBOARD_CONFIG = {
  MIN_GAMES_FOR_WINRATE: 10,
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
```

**Benefits**:
- Single source of truth for configuration
- Easy to adjust game behavior
- Better for testing (can override constants)
- Self-documenting code

---

### 8. Improve Storage Abstraction

**Problem**: Direct AsyncStorage usage, inconsistent error handling, no retry logic

**New File**: `src/services/storageService.js`
```javascript
class StorageService {
  constructor(storage) {
    this.storage = storage;
  }

  async get(key, defaultValue = null) {
    try {
      const value = await this.storage.getItem(key);
      return value !== null ? JSON.parse(value) : defaultValue;
    } catch (error) {
      console.error(`Storage get error [${key}]:`, error);
      return defaultValue;
    }
  }

  async set(key, value) {
    try {
      await this.storage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Storage set error [${key}]:`, error);
      return false;
    }
  }

  async remove(key) {
    try {
      await this.storage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Storage remove error [${key}]:`, error);
      return false;
    }
  }

  async update(key, updateFn, defaultValue = null) {
    const current = await this.get(key, defaultValue);
    const updated = updateFn(current);
    await this.set(key, updated);
    return updated;
  }

  // Batch operations
  async getMultiple(keys) {
    return Promise.all(
      keys.map(async ({ key, defaultValue }) => ({
        key,
        value: await this.get(key, defaultValue)
      }))
    );
  }

  async setMultiple(items) {
    return Promise.all(
      items.map(({ key, value }) => this.set(key, value))
    );
  }
}

// Export singleton instance
export const storageService = new StorageService(AsyncStorage);

// For testing: export class to allow mocking
export { StorageService };
```

**Refactor storage.js to use storageService**:
```javascript
import { storageService, STORAGE_KEYS } from './storageService';
import { GameStats } from '../models/GameStats';

export const getBestScore = async () => {
  return storageService.get(STORAGE_KEYS.BEST_SCORE, 0);
};

export const setBestScore = async (score) => {
  return storageService.set(STORAGE_KEYS.BEST_SCORE, score);
};

export const getStats = async () => {
  const data = await storageService.get(STORAGE_KEYS.STATS, null);
  return data ? GameStats.fromJSON(data) : GameStats.default();
};

export const updateStats = async (newStats) => {
  return storageService.set(STORAGE_KEYS.STATS, newStats.toJSON());
};
```

**Benefits**:
- Abstraction layer for storage
- Consistent error handling
- Batch operations
- Easy to swap storage implementation (localStorage, SQLite, etc.)
- Better testability (mock StorageService)

---

### 9. Add Form Validation Layer

**Problem**: Username validation duplicated in UsernameSetupScreen and LobbyScreen

**New File**: `src/utils/validators.js`
```javascript
export const createValidator = (rules) => (value) => {
  const errors = [];
  for (const rule of rules) {
    if (!rule.test(value)) {
      errors.push(rule.message);
    }
  }
  return {
    valid: errors.length === 0,
    errors,
    value: rules.some(r => r.transform) ? rules.find(r => r.transform).transform(value) : value
  };
};

export const validators = {
  required: (message = 'This field is required') => ({
    test: (value) => value !== null && value !== undefined && value !== '',
    message
  }),

  minLength: (length, message = `Must be at least ${length} characters`) => ({
    test: (value) => value.length >= length,
    message
  }),

  maxLength: (length, message = `Must be at most ${length} characters`) => ({
    test: (value) => value.length <= length,
    message
  }),

  pattern: (regex, message = 'Invalid format') => ({
    test: (value) => regex.test(value),
    message
  }),

  trim: () => ({
    test: () => true,
    transform: (value) => value.trim()
  })
};

// Username validator
export const validateUsername = createValidator([
  validators.trim(),
  validators.required('Username is required'),
  validators.minLength(USERNAME_CONSTRAINTS.MIN_LENGTH),
  validators.maxLength(USERNAME_CONSTRAINTS.MAX_LENGTH),
  validators.pattern(
    USERNAME_CONSTRAINTS.ALLOWED_PATTERN,
    'Username can only contain letters, numbers, spaces, underscores, and hyphens'
  )
]);
```

**Usage in components**:
```javascript
const handleSubmit = () => {
  const validation = validateUsername(inputUsername);
  if (!validation.valid) {
    Alert.alert('Invalid Username', validation.errors.join('\n'));
    return;
  }
  // Use validation.value (trimmed)
  saveUsername(validation.value);
};
```

**Benefits**:
- DRY - no duplicate validation
- Reusable validators
- Composable validation rules
- Easy to add new validators
- Testable in isolation

---

## Low Priority (Code Quality)

### 10. Performance Optimizations

#### Replace JSON.stringify deep clones
```javascript
// BEFORE
grid: JSON.parse(JSON.stringify(grid))  // Slow!

// AFTER
grid: grid.map(row => [...row])  // Fast!
// OR use structuredClone (modern browsers)
grid: structuredClone(grid)
```

#### Add memoization to Grid component
```javascript
const Grid = ({ grid }) => {
  const gridSize = useMemo(() => width - 40, [width]);
  const cellSize = useMemo(
    () => (gridSize - GRID_PADDING * 2 - CELL_MARGIN * 3) / 4,
    [gridSize]
  );
  // ...
};
```

#### Optimize array comparison in gameLogic.js
```javascript
// BEFORE
if (JSON.stringify(row) !== JSON.stringify(newGrid[i])) {
  moved = true;
}

// AFTER
if (!arraysEqual(row, newGrid[i])) {
  moved = true;
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
```

#### Fix parallel data loading in LobbyScreen
```javascript
// BEFORE - Sequential
const score = await getBestScore();
const gameStats = await getStats();
const profile = await getUserProfile();

// AFTER - Parallel
const [score, gameStats, profile] = await Promise.all([
  getBestScore(),
  getStats(),
  getUserProfile()
]);
```

---

### 11. Add Error Boundaries

**New File**: `src/components/ErrorBoundary.js`
```javascript
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error boundary caught:', error, errorInfo);
    // Could send to error tracking service here
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorMessage}>{this.state.error?.message}</Text>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false, error: null })}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
```

**Usage in App.js**:
```javascript
<ErrorBoundary>
  {renderScreen()}
</ErrorBoundary>
```

---

### 12. Improve Test Coverage

**Current**: 8.3% (1/12 files)
**Target**: 80%+

**Priority files to test**:
1. ✅ `gameLogic.js` - Already tested (123 lines)
2. ❌ `storage.js` - Need AsyncStorage mocking
3. ❌ `leaderboard.js` - Need service tests
4. ❌ `profile.js` - Need userId generation tests
5. ❌ `validators.js` - Easy to test (pure functions)
6. ❌ `useGameState.js` - Hook testing with @testing-library/react-hooks
7. ❌ `useInputController.js` - Input simulation tests
8. ❌ Components - Rendering and interaction tests

**New File**: `src/utils/__tests__/validators.test.js`
```javascript
import { validateUsername } from '../validators';

describe('validateUsername', () => {
  it('should accept valid usernames', () => {
    expect(validateUsername('john_doe').valid).toBe(true);
    expect(validateUsername('Player123').valid).toBe(true);
    expect(validateUsername('test-user').valid).toBe(true);
  });

  it('should reject short usernames', () => {
    const result = validateUsername('ab');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Must be at least 3 characters');
  });

  it('should trim whitespace', () => {
    const result = validateUsername('  john  ');
    expect(result.value).toBe('john');
  });

  it('should reject invalid characters', () => {
    const result = validateUsername('user@email');
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('letters, numbers');
  });
});
```

---

## Implementation Roadmap

### Phase 1: Critical Fixes (1-2 days)
- [ ] Fix navigation closure bug (App.js)
- [ ] Extract constants to constants.js
- [ ] Add parallel data loading (LobbyScreen)
- [ ] Replace JSON.stringify with efficient cloning

### Phase 2: High Priority (1 week)
- [ ] Create domain models (GameStats, UserProfile, Grid)
- [ ] Extract useInputController hook
- [ ] Refactor leaderboard service with strategy pattern
- [ ] Create GameModal component
- [ ] Split GameScreen (extract useGameState)
- [ ] Create validators.js and extract validation logic

### Phase 3: Medium Priority (1 week)
- [ ] Split LobbyScreen (extract StatsModal, ProfileEditor)
- [ ] Create storageService abstraction
- [ ] Extract styles to separate files
- [ ] Add memoization optimizations
- [ ] Create shared Button component

### Phase 4: Testing & Polish (1 week)
- [ ] Add ErrorBoundary
- [ ] Write tests for validators
- [ ] Write tests for storage service
- [ ] Write tests for leaderboard service
- [ ] Write tests for hooks (useGameState, useInputController)
- [ ] Component tests for Grid, Tile, GameModal
- [ ] Integration tests for screens

---

## File Structure After Refactoring

```
src/
├── components/
│   ├── ErrorBoundary.js         [NEW]
│   ├── GameModal.js              [NEW]
│   ├── StatsModal.js             [NEW]
│   ├── ProfileEditor.js          [NEW]
│   ├── GameHeader.js             [NEW]
│   ├── Button.js                 [NEW]
│   ├── Grid.js                   [EXISTING]
│   └── Tile.js                   [EXISTING]
├── hooks/
│   ├── useGameState.js           [NEW]
│   ├── useInputController.js     [NEW]
│   ├── useMouseDrag.js           [NEW]
│   └── usePanResponder.js        [NEW]
├── models/
│   ├── GameStats.js              [NEW]
│   ├── UserProfile.js            [NEW]
│   └── Grid.js                   [NEW]
├── screens/
│   ├── GameScreen.js             [REFACTORED: 474→150 lines]
│   ├── GameScreen.styles.js      [NEW]
│   ├── LobbyScreen.js            [REFACTORED: 543→250 lines]
│   ├── LobbyScreen.styles.js     [NEW]
│   ├── HallOfFameScreen.js       [EXISTING]
│   └── UsernameSetupScreen.js    [EXISTING]
├── services/
│   └── storageService.js         [NEW]
├── utils/
│   ├── constants.js              [NEW]
│   ├── validators.js             [NEW]
│   ├── gameLogic.js              [EXISTING]
│   ├── storage.js                [REFACTORED]
│   ├── leaderboard.js            [REFACTORED]
│   ├── profile.js                [EXISTING]
│   └── colors.js                 [EXISTING]
└── __tests__/
    ├── validators.test.js        [NEW]
    ├── storageService.test.js    [NEW]
    ├── leaderboard.test.js       [NEW]
    ├── GameStats.test.js         [NEW]
    └── gameLogic.test.js         [EXISTING]
```

**New Files**: 20
**Refactored Files**: 5
**Unchanged Files**: 7

---

## Success Metrics

### Code Quality
- **Lines of Code**: 2,344 → ~1,500 (35% reduction)
- **Average File Size**: 195 lines → 75 lines
- **Test Coverage**: 8.3% → 80%+
- **Cyclomatic Complexity**: Reduce high-complexity functions by 50%

### Maintainability
- **Code Duplication**: ~400 lines → <50 lines
- **Magic Numbers**: 11 → 0 (all in constants.js)
- **God Components**: 2 (GameScreen, LobbyScreen) → 0
- **Single Responsibility**: 40% → 90% of files

### Performance
- **Deep Clone Operations**: Remove 3 instances of JSON.parse(JSON.stringify())
- **Parallel Async**: Convert 3 sequential awaits to Promise.all
- **Component Re-renders**: Add memoization to 5+ components

---

## Risks & Mitigation

### Risk 1: Breaking Changes
**Mitigation**:
- Implement changes incrementally
- Test each refactoring thoroughly
- Keep existing code working during migration
- Create feature branches for major changes

### Risk 2: Test Coverage Gap
**Mitigation**:
- Write tests before refactoring critical paths
- Use snapshot tests for components
- Add integration tests for user flows

### Risk 3: Performance Regression
**Mitigation**:
- Benchmark before/after changes
- Test on low-end devices
- Monitor bundle size

### Risk 4: Over-Engineering
**Mitigation**:
- Follow YAGNI (You Aren't Gonna Need It)
- Only add abstractions that solve current problems
- Keep it simple and pragmatic

---

## Conclusion

This refactoring proposal addresses critical issues while maintaining the solid architectural foundation. The changes are prioritized by impact and organized into phases for incremental implementation.

**Key Benefits**:
- 35-40% code reduction
- Elimination of 400+ lines of duplicate code
- Better SOLID principle adherence
- Improved testability (8.3% → 80%+)
- Enhanced performance
- Easier maintenance and feature development

**Next Steps**:
1. Review and approve this proposal
2. Create feature branch for refactoring work
3. Start with Phase 1 (Critical Fixes)
4. Implement phases incrementally
5. Test thoroughly at each phase
6. Merge when confident and stable

**Estimated Timeline**: 4 weeks (1 week per phase)
**Risk Level**: Medium (mitigated by incremental approach)
**ROI**: High (significant improvement in maintainability and code quality)
