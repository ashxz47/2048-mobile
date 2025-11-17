import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { colors } from '../utils/colors';
import { getBestScore, getStats } from '../utils/storage';
import { getUserProfile, updateUsername } from '../utils/profile';

const LobbyScreen = ({ navigation }) => {
  const [bestScore, setBestScore] = useState(0);
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  // Reload data when returning from other screens
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    const score = await getBestScore();
    const gameStats = await getStats();
    const profile = await getUserProfile();
    setBestScore(score);
    setStats(gameStats);
    setUserProfile(profile);
  };

  const startNewGame = () => {
    navigation.navigate('Game');
  };

  const openHallOfFame = () => {
    navigation.navigate('HallOfFame');
  };

  const openUsernameSetup = () => {
    navigation.navigate('UsernameSetup');
  };

  const handleEditUsername = () => {
    if (userProfile) {
      setNewUsername(userProfile.username);
      setEditingUsername(true);
    }
  };

  const handleSaveUsername = async () => {
    const trimmed = newUsername.trim();
    if (trimmed.length < 3) {
      Alert.alert('Invalid Username', 'Username must be at least 3 characters');
      return;
    }

    try {
      await updateUsername(trimmed);
      const profile = await getUserProfile();
      setUserProfile(profile);
      setEditingUsername(false);
      Alert.alert('Success', 'Username updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update username');
    }
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
          style={[styles.button, styles.hallOfFameButton]}
          onPress={openHallOfFame}
        >
          <Text style={styles.buttonText}>🏆 HALL OF FAME</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => setShowStats(true)}
        >
          <Text style={styles.buttonText}>STATISTICS</Text>
        </TouchableOpacity>

        {!userProfile && (
          <TouchableOpacity
            style={[styles.button, styles.tertiaryButton]}
            onPress={openUsernameSetup}
          >
            <Text style={styles.buttonText}>SET USERNAME</Text>
          </TouchableOpacity>
        )}

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
                  {/* Username Section */}
                  <View style={styles.usernameSection}>
                    <Text style={styles.sectionTitle}>Player</Text>
                    {userProfile ? (
                      <View style={styles.usernameRow}>
                        {editingUsername ? (
                          <>
                            <TextInput
                              style={styles.usernameInput}
                              value={newUsername}
                              onChangeText={setNewUsername}
                              maxLength={20}
                              autoFocus
                            />
                            <TouchableOpacity
                              style={styles.saveButton}
                              onPress={handleSaveUsername}
                            >
                              <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.cancelButton}
                              onPress={() => setEditingUsername(false)}
                            >
                              <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                          </>
                        ) : (
                          <>
                            <Text style={styles.usernameText}>{userProfile.username}</Text>
                            <TouchableOpacity
                              style={styles.editButton}
                              onPress={handleEditUsername}
                            >
                              <Text style={styles.editButtonText}>Edit</Text>
                            </TouchableOpacity>
                          </>
                        )}
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.setUsernameButton}
                        onPress={() => {
                          setShowStats(false);
                          openUsernameSetup();
                        }}
                      >
                        <Text style={styles.setUsernameText}>Set up username to compete</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.divider} />

                  <Text style={styles.sectionTitle}>Statistics</Text>

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
  hallOfFameButton: {
    backgroundColor: '#d4af37', // Gold color for Hall of Fame
  },
  tertiaryButton: {
    backgroundColor: '#9b8b7d',
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
  usernameSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  usernameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    flex: 1,
  },
  editButton: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: colors.button,
    borderRadius: 5,
  },
  editButtonText: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: '600',
  },
  usernameInput: {
    flex: 1,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.gridBackground,
    borderRadius: 5,
    padding: 8,
    marginRight: 5,
    color: colors.text,
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: '#5cb85c',
    borderRadius: 5,
    marginRight: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: '#d9534f',
    borderRadius: 5,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  setUsernameButton: {
    backgroundColor: '#f0e6d6',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  setUsernameText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15,
  },
});

export default LobbyScreen;
