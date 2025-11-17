import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  ScrollView,
} from 'react-native';
import { colors } from '../utils/colors';
import { getBestScore, getStats } from '../utils/storage';

const LobbyScreen = ({ navigation }) => {
  const [bestScore, setBestScore] = useState(0);
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const score = await getBestScore();
    const gameStats = await getStats();
    setBestScore(score);
    setStats(gameStats);
  };

  const startNewGame = () => {
    navigation.navigate('Game');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>2048</Text>
        <Text style={styles.subtitle}>Join the numbers and get to the 2048 tile!</Text>

        <View style={styles.scoreContainer}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>BEST SCORE</Text>
            <Text style={styles.scoreValue}>{bestScore}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={startNewGame}>
          <Text style={styles.buttonText}>NEW GAME</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => setShowStats(true)}
        >
          <Text style={styles.buttonText}>STATISTICS</Text>
        </TouchableOpacity>

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>HOW TO PLAY:</Text>
          <Text style={styles.instructionsText}>
            Swipe to move tiles. When two tiles with the same number touch, they merge into one!
          </Text>
        </View>

        {/* Statistics Modal */}
        <Modal
          visible={showStats}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowStats(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Statistics</Text>

              {stats && (
                <ScrollView style={styles.statsContainer}>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Games Played:</Text>
                    <Text style={styles.statValue}>{stats.gamesPlayed}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Games Won:</Text>
                    <Text style={styles.statValue}>{stats.gamesWon}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Win Rate:</Text>
                    <Text style={styles.statValue}>
                      {stats.gamesPlayed > 0
                        ? `${((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(1)}%`
                        : '0%'}
                    </Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Total Moves:</Text>
                    <Text style={styles.statValue}>{stats.totalMoves}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Best Tile:</Text>
                    <Text style={styles.statValue}>{stats.bestTile || 0}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Best Score:</Text>
                    <Text style={styles.statValue}>{bestScore}</Text>
                  </View>
                </ScrollView>
              )}

              <TouchableOpacity
                style={[styles.button, { marginTop: 20 }]}
                onPress={() => setShowStats(false)}
              >
                <Text style={styles.buttonText}>CLOSE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 80,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  scoreContainer: {
    marginBottom: 40,
  },
  scoreBox: {
    backgroundColor: colors.scoreBox,
    borderRadius: 8,
    padding: 15,
    minWidth: 120,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textLight,
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  button: {
    backgroundColor: colors.button,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 15,
    minWidth: 200,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#b89b7d',
  },
  buttonText: {
    color: colors.buttonText,
    fontSize: 18,
    fontWeight: 'bold',
  },
  instructions: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  instructionsText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 30,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  statsContainer: {
    marginBottom: 10,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default LobbyScreen;
