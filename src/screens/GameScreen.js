import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  Alert,
} from 'react-native';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import Grid from '../components/Grid';
import { colors } from '../utils/colors';
import {
  initializeGrid,
  move,
  addRandomTile,
  canMove,
  hasWon,
  getHighestTile,
} from '../utils/gameLogic';
import { getBestScore, saveBestScore, updateStats } from '../utils/storage';

const GameScreen = ({ navigation }) => {
  const [grid, setGrid] = useState([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [continueAfterWin, setContinueAfterWin] = useState(false);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = async () => {
    const newGrid = initializeGrid();
    setGrid(newGrid);
    setScore(0);
    setMoves(0);
    setGameOver(false);
    setWon(false);
    setContinueAfterWin(false);

    const best = await getBestScore();
    setBestScore(best);
  };

  const handleMove = (direction) => {
    if (gameOver || (won && !continueAfterWin)) return;

    const result = move(grid, direction);

    if (!result.moved) return;

    const newGrid = addRandomTile(result.grid);
    const newScore = score + result.score;
    const newMoves = moves + 1;

    setGrid(newGrid);
    setScore(newScore);
    setMoves(newMoves);

    // Update best score
    if (newScore > bestScore) {
      setBestScore(newScore);
      saveBestScore(newScore);
    }

    // Check for win
    if (!won && hasWon(newGrid)) {
      setWon(true);
    }

    // Check for game over
    if (!canMove(newGrid)) {
      setGameOver(true);
      handleGameEnd(newGrid, newScore, newMoves, false);
    }
  };

  const handleGameEnd = async (finalGrid, finalScore, finalMoves, playerWon) => {
    const highestTile = getHighestTile(finalGrid);
    await updateStats({
      won: playerWon,
      moves: finalMoves,
      highestTile,
    });
  };

  const continueGame = () => {
    setContinueAfterWin(true);
  };

  const restartGame = () => {
    initGame();
  };

  const goToLobby = () => {
    navigation.goBack();
  };

  // Gesture handling
  const gesture = Gesture.Pan()
    .onEnd((event) => {
      const { translationX, translationY } = event;
      const absX = Math.abs(translationX);
      const absY = Math.abs(translationY);

      // Minimum swipe distance
      const minSwipeDistance = 50;

      if (absX < minSwipeDistance && absY < minSwipeDistance) {
        return;
      }

      if (absX > absY) {
        // Horizontal swipe
        if (translationX > 0) {
          handleMove('right');
        } else {
          handleMove('left');
        }
      } else {
        // Vertical swipe
        if (translationY > 0) {
          handleMove('down');
        } else {
          handleMove('up');
        }
      }
    });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>2048</Text>

          <View style={styles.scoreContainer}>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>SCORE</Text>
              <Text style={styles.scoreValue}>{score}</Text>
            </View>
            <View style={[styles.scoreBox, { marginLeft: 10 }]}>
              <Text style={styles.scoreLabel}>BEST</Text>
              <Text style={styles.scoreValue}>{bestScore}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Moves</Text>
            <Text style={styles.statValue}>{moves}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Highest Tile</Text>
            <Text style={styles.statValue}>{getHighestTile(grid)}</Text>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.button} onPress={restartGame}>
            <Text style={styles.buttonText}>NEW GAME</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={goToLobby}>
            <Text style={styles.buttonText}>MENU</Text>
          </TouchableOpacity>
        </View>

        <GestureDetector gesture={gesture}>
          <View style={styles.gameContainer}>
            {grid.length > 0 && <Grid grid={grid} />}
          </View>
        </GestureDetector>

        <Text style={styles.instructions}>Swipe to move tiles!</Text>

        {/* Win Modal */}
        <Modal visible={won && !continueAfterWin && !gameOver} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>You Win!</Text>
              <Text style={styles.modalText}>You reached 2048!</Text>
              <Text style={styles.modalScore}>Score: {score}</Text>

              <TouchableOpacity style={styles.modalButton} onPress={continueGame}>
                <Text style={styles.buttonText}>CONTINUE</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.secondaryButton]}
                onPress={restartGame}
              >
                <Text style={styles.buttonText}>NEW GAME</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Game Over Modal */}
        <Modal visible={gameOver} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Game Over!</Text>
              <Text style={styles.modalText}>No more moves available</Text>
              <Text style={styles.modalScore}>Final Score: {score}</Text>
              <Text style={styles.modalScore}>Moves: {moves}</Text>
              <Text style={styles.modalScore}>Highest Tile: {getHighestTile(grid)}</Text>

              <TouchableOpacity style={styles.modalButton} onPress={restartGame}>
                <Text style={styles.buttonText}>NEW GAME</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.secondaryButton]}
                onPress={goToLobby}
              >
                <Text style={styles.buttonText}>MENU</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 50,
    fontWeight: 'bold',
    color: colors.primary,
  },
  scoreContainer: {
    flexDirection: 'row',
  },
  scoreBox: {
    backgroundColor: colors.scoreBox,
    borderRadius: 8,
    padding: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.textLight,
    marginBottom: 2,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.text,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.button,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#b89b7d',
  },
  buttonText: {
    color: colors.buttonText,
    fontSize: 14,
    fontWeight: 'bold',
  },
  gameContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  instructions: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 30,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 10,
  },
  modalScore: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 5,
    fontWeight: '500',
  },
  modalButton: {
    backgroundColor: colors.button,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 15,
    minWidth: 200,
    alignItems: 'center',
  },
});

export default GameScreen;
