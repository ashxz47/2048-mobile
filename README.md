# 2048 Mobile Game

A React Native implementation of the classic 2048 puzzle game for iOS and Android.

## Features

- **Full 2048 Game Mechanics**: Swipe to merge tiles and reach 2048!
- **Lobby Screen**: Start new games and view statistics
- **Game Statistics**: Track games played, win rate, total moves, and best tiles
- **Score Tracking**: Current score and best score persistence
- **Responsive Design**: Works on various mobile screen sizes
- **Smooth Animations**: Tile animations for better user experience
- **Win/Loss Detection**: Automatic detection of game completion

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (optional, but recommended)
- iOS Simulator or Android Emulator (or physical device)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd 2048-mobile
```

2. Install dependencies:
```bash
npm install
```

### Running the App

#### Using Expo:
```bash
npm start
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator
- Scan QR code with Expo Go app for physical device

#### Direct platform commands:
```bash
# iOS
npm run ios

# Android
npm run android
```

## How to Play

1. **Start a New Game**: Tap "NEW GAME" from the lobby
2. **Move Tiles**: Swipe in any direction (up, down, left, right)
3. **Merge Tiles**: When two tiles with the same number touch, they merge into one
4. **Win Condition**: Reach the 2048 tile
5. **Game Over**: When no more moves are possible

## Game Statistics

The game tracks:
- **Games Played**: Total number of games started
- **Games Won**: Number of times you reached 2048
- **Win Rate**: Percentage of games won
- **Total Moves**: Cumulative moves across all games
- **Best Tile**: Highest tile ever achieved
- **Best Score**: Highest score ever achieved

## Project Structure

```
2048-mobile/
├── src/
│   ├── components/
│   │   ├── Grid.js          # Game grid component
│   │   └── Tile.js          # Individual tile component
│   ├── screens/
│   │   ├── LobbyScreen.js   # Main menu screen
│   │   └── GameScreen.js    # Game play screen
│   └── utils/
│       ├── gameLogic.js     # Core 2048 game logic
│       ├── storage.js       # AsyncStorage utilities
│       └── colors.js        # Color scheme definitions
├── App.js                   # Main app entry point
├── package.json
└── app.json
```

## Technical Details

- **Framework**: React Native with Expo
- **Gesture Handling**: react-native-gesture-handler for swipe detection
- **Data Persistence**: @react-native-async-storage/async-storage for statistics
- **Animations**: React Native Animated API

## Architecture & Development Principles

This project follows **SOLID principles** and **Clean Architecture** guidelines:

### SOLID Principles

1. **Single Responsibility Principle (SRP)**
   - Each module has one clear purpose:
     - `gameLogic.js` - Pure game mechanics only
     - `storage.js` - Data persistence only
     - `colors.js` - Styling constants only
   - Components are focused: `Tile` handles individual tiles, `Grid` handles layout

2. **Open/Closed Principle (OCP)**
   - Game logic functions are open for extension but closed for modification
   - Color scheme can be extended without modifying existing code
   - New game modes can be added without changing core logic

3. **Liskov Substitution Principle (LSP)**
   - Components accept props consistently
   - Functions maintain expected behavior with valid inputs

4. **Interface Segregation Principle (ISP)**
   - Components receive only the props they need
   - Utility functions are focused and specific

5. **Dependency Inversion Principle (DIP)**
   - UI components depend on abstractions (game logic functions), not implementations
   - Storage layer is abstracted from screens
   - Business logic is independent of UI framework

### Clean Architecture

**Separation of Concerns:**
```
┌─────────────────────────────────────┐
│  Presentation Layer (Screens/UI)   │  ← React components
├─────────────────────────────────────┤
│  Application Layer (Components)    │  ← Reusable UI components
├─────────────────────────────────────┤
│  Business Logic (Utils/Logic)      │  ← Pure functions, game rules
├─────────────────────────────────────┤
│  Data Layer (Storage)               │  ← Persistence abstraction
└─────────────────────────────────────┘
```

**Key Principles Applied:**
- **Pure Functions**: Game logic (`gameLogic.js`) contains pure, testable functions
- **Separation of Concerns**: UI, business logic, and data are in separate layers
- **Dependency Flow**: Dependencies point inward (UI → Logic → Data)
- **Testability**: Business logic can be tested independently of UI
- **Reusability**: Components and utilities are modular and reusable
- **Maintainability**: Changes to one layer don't affect others

### Development Guidelines

When extending this project, always:

1. **Keep business logic pure** - No side effects in game logic functions
2. **Separate UI from logic** - Components should orchestrate, not implement game rules
3. **Use single-purpose functions** - Each function should do one thing well
4. **Abstract external dependencies** - Wrap third-party libraries (e.g., AsyncStorage)
5. **Make code testable** - Write functions that are easy to unit test
6. **Follow consistent patterns** - Maintain the established architectural structure
7. **Document complex logic** - Add comments for non-obvious algorithms
8. **Keep components focused** - Break down large components into smaller ones

## Color Scheme

The game uses the classic 2048 color palette:
- Grid background: #bbada0
- Empty cells: #cdc1b4
- Tiles: Color-coded based on value (2, 4, 8, 16, ..., 2048)
- Background: #faf8ef

## Future Enhancements

Potential features to add:
- Undo move functionality
- Custom grid sizes (3x3, 5x5)
- Different game modes
- Sound effects
- Leaderboards
- Dark mode theme

## License

MIT License

## Credits

Based on the original 2048 game by Gabriele Cirulli.
