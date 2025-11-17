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
