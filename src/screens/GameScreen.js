import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  Alert,
  PanResponder,
} from 'react-native';
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
  const [previousStates, setPreviousStates] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    initGame();
  }, []);

  // Keyboard controls for web
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleMove('up');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleMove('down');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleMove('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleMove('right');
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyPress);
      return () => {
        window.removeEventListener('keydown', handleKeyPress);
      };
    }
  }, [grid, score, moves, gameOver, won, continueAfterWin]);

  // Mouse drag controls for web
  useEffect(() => {
    let startX = 0;
    let startY = 0;

    const handleMouseDown = (e) => {
      startX = e.clientX;
      startY = e.clientY;
    };

    const handleMouseUp = (e) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      const minSwipeDistance = 50;

      if (absX < minSwipeDistance && absY < minSwipeDistance) return;

      if (absX > absY) {
        if (dx > 0) handleMove('right');
        else handleMove('left');
      } else {
        if (dy > 0) handleMove('down');
        else handleMove('up');
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [grid, score, moves, gameOver, won, continueAfterWin]);

  const initGame = async () => {
    try {
      const newGrid = initializeGrid();
      setGrid(newGrid);
      setScore(0);
      setMoves(0);
      setGameOver(false);
      setWon(false);
      setContinueAfterWin(false);
      setPreviousStates([]);

      const best = await getBestScore();
      setBestScore(best);
    } catch (e) {
      setError(e.toString());
    }
  };

  const handleMove = (direction) => {
    if (gameOver || (won && !continueAfterWin)) return;

    const result = move(grid, direction);

    if (!result.moved) return;

    // Save current state for undo
    setPreviousStates(prev => [...prev, {
      grid: grid.map(row => [...row]), // Efficient deep clone of 2D array
      score,
      moves,
      gameOver,
      won,
      continueAfterWin
    }]);

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

  const handleUndo = () => {
    if (previousStates.length === 0) return;

    const lastState = previousStates[previousStates.length - 1];

    setGrid(lastState.grid);
    setScore(lastState.score);
    setMoves(lastState.moves);
    setGameOver(lastState.gameOver);
    setWon(lastState.won);
    setContinueAfterWin(lastState.continueAfterWin);

    setPreviousStates(prev => prev.slice(0, -1));
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

  // PanResponder for gesture handling
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        const minSwipeDistance = 50;

        if (absX < minSwipeDistance && absY < minSwipeDistance) return;

        if (absX > absY) {
          if (dx > 0) handleMove('right');
          else handleMove('left');
        } else {
          if (dy > 0) handleMove('down');
          else handleMove('up');
        }
      },
    })
  ).current;

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      {error && (
        <View style={{ padding: 20, backgroundColor: 'red' }}>
          <Text style={{ color: 'white', fontSize: 20 }}>Error: {error}</Text>
        </View>
      )}
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
            <Text style={styles.statValue}>{grid.length > 0 ? getHighestTile(grid) : 0}</Text>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.button} onPress={restartGame}>
            <Text style={styles.buttonText}>NEW GAME</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, previousStates.length === 0 && styles.disabledButton]}
            onPress={handleUndo}
            disabled={previousStates.length === 0}
          >
            <Text style={styles.buttonText}>UNDO</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={goToLobby}>
            <Text style={styles.buttonText}>MENU</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gameContainer}>
          {grid.length > 0 && <Grid grid={grid} />}
        </View>

        <Text style={styles.instructions}>
          {typeof window !== 'undefined'
            ? 'Use arrow keys or click & drag to move tiles!'
            : 'Swipe to move tiles!'}
        </Text>

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
              <Text style={styles.modalScore}>Highest Tile: {grid.length > 0 ? getHighestTile(grid) : 0}</Text>

              <TouchableOpacity style={styles.modalButton} onPress={handleUndo}>
                <Text style={styles.buttonText}>UNDO</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.modalButton, styles.secondaryButton]} onPress={restartGame}>
                <Text style={styles.buttonText}>NEW GAME</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.secondaryButton, { marginTop: 10 }]}
                onPress={goToLobby}
              >
                <Text style={styles.buttonText}>MENU</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
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
    paddingHorizontal: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#b89b7d',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  disabledButton: {
    opacity: 0.5,
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
