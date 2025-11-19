# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the App
```bash
# Start Expo development server
npm start

# Run on specific platforms
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Web browser
```

### Expo CLI Shortcuts
After running `npm start`, use these keyboard shortcuts:
- `i` - Open iOS simulator
- `a` - Open Android emulator
- `r` - Reload app
- `m` - Toggle menu

## Architecture Overview

This is a React Native 2048 game built with Expo, following **Clean Architecture** and **SOLID principles**.

### Layered Architecture

```
┌─────────────────────────────────────────┐
│  App.js                                 │  Entry point with custom navigation
├─────────────────────────────────────────┤
│  Screens (Presentation Layer)          │  LobbyScreen, GameScreen, HallOfFameScreen, UsernameSetupScreen
├─────────────────────────────────────────┤
│  Components (UI Layer)                  │  Grid, Tile - reusable UI components
├─────────────────────────────────────────┤
│  Utils (Business Logic & Data)          │
│  ├─ gameLogic.js (pure functions)       │  All 2048 game rules and mechanics
│  ├─ leaderboard.js (service layer)      │  Leaderboard data management
│  ├─ storage.js (persistence)            │  Game statistics via AsyncStorage
│  ├─ profile.js (user management)        │  User profile and unique ID generation
│  └─ colors.js (constants)               │  Color scheme definitions
└─────────────────────────────────────────┘
```

### Key Architectural Decisions

**Navigation System**: Custom navigation implementation in App.js using state-based screen switching. No React Navigation dependency. The navigation object provides `navigate()`, `goBack()`, and `addListener()` methods.

**Game Logic Separation**: All 2048 game mechanics live in `src/utils/gameLogic.js` as pure functions. This includes:
- Grid initialization and tile placement
- Movement logic using rotation technique (all directions rotate to "left", then rotate back)
- Win/loss detection
- Move validation

**Data Flow**:
1. User swipes (gesture detected in GameScreen)
2. GameScreen calls `move()` from gameLogic.js
3. Pure function returns new grid state and score
4. GameScreen updates state and checks win/loss conditions
5. Stats are persisted to AsyncStorage via storage.js

**Leaderboard Architecture**: Designed for easy backend integration. Currently uses mock data combined with local stats. All leaderboard functions in `leaderboard.js` are structured as async services ready to swap mock data with real API calls. User identification uses generated userId from profile.js.

### Core Game Logic Implementation

The movement algorithm uses a clever rotation technique:
1. Rotate grid so target direction faces left
2. Apply left-move logic (collapse, merge, collapse)
3. Rotate back to original orientation

This avoids duplicating movement code for all 4 directions.

### State Management

No Redux or external state management. All state is managed via:
- React `useState` in screens
- AsyncStorage for persistence (scores, stats, profiles)
- Navigation state in App.js

### Gesture Handling

Uses `react-native-gesture-handler` for swipe detection:
- Pan gesture captures translation in X and Y
- Minimum swipe distance of 50 pixels to trigger
- Direction determined by larger absolute translation (absX vs absY)

## Important Implementation Notes

### Adding New Features

When extending the game:
1. **Keep gameLogic.js pure** - No side effects, all functions should be testable
2. **Use the layered architecture** - UI orchestrates, business logic stays in utils
3. **Abstract external dependencies** - Wrap third-party libraries like AsyncStorage
4. **Follow single responsibility** - Each file has one clear purpose

### Backend Integration

To connect to a real backend:
1. Replace mock data in `leaderboard.js` MOCK_PLAYERS array
2. Implement the commented functions at the bottom of leaderboard.js
3. Use profile.js `getUserProfile()` to get userId for API calls
4. Consider adding authentication flow through UsernameSetupScreen

### Statistics Tracking

Stats are updated in two places:
1. `GameScreen.handleGameEnd()` - Called when game is over
2. `storage.updateStats()` - Persists to AsyncStorage

Stats tracked: gamesPlayed, gamesWon, totalMoves, bestTile, bestScore

### Color Scheme

All colors defined in `src/utils/colors.js`. Tile colors follow classic 2048 palette with specific colors for each value (2, 4, 8, 16, etc.). To add themes, extend this file without modifying existing exports.

## Project Constraints

- **Expo SDK ~49.0.0** - Stay compatible with this version
- **React Native 0.72.6** - Core RN version
- **No React Navigation** - Custom navigation system in place
- **AsyncStorage only** - No other persistence mechanisms used

## Testing Considerations

While no tests currently exist, the architecture supports testing:
- Pure functions in gameLogic.js are highly testable
- Mock AsyncStorage for testing storage.js functions
- Component testing would require mocking navigation prop
- Leaderboard service can be tested with mock vs. real API modes
