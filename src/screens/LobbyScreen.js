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
  Dimensions,
  Platform,
} from 'react-native';
import { colors } from '../utils/colors';
import { getBestScore, getStats } from '../utils/storage';
import { getUserProfile, updateUsername } from '../utils/profile';

const { width } = Dimensions.get('window');

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
    // Load all data in parallel for better performance
    const [score, gameStats, profile] = await Promise.all([
      getBestScore(),
      getStats(),
      getUserProfile(),
    ]);
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
        <View style={styles.header}>
          <Text style={styles.title}>2048</Text>
          <Text style={styles.subtitle}>Join the numbers to win!</Text>
        </View>

        <View style={styles.heroSection}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>BEST SCORE</Text>
            <Text style={styles.scoreValue}>{bestScore}</Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={[styles.menuButton, styles.primaryButton]}
            onPress={startNewGame}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>NEW GAME</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuButton, styles.accentButton]}
            onPress={openHallOfFame}
            activeOpacity={0.8}
          >
            <Text style={styles.accentButtonText}>🏆 HALL OF FAME</Text>
          </TouchableOpacity>

          <View style={styles.rowButtons}>
            <TouchableOpacity
              style={[styles.menuButton, styles.secondaryButton, styles.halfButton]}
              onPress={() => setShowStats(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>STATS</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuButton, styles.secondaryButton, styles.halfButton]}
              onPress={openUsernameSetup}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>
                {userProfile ? 'PROFILE' : 'SETUP'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Swipe to move tiles. Merge same numbers!
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
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Statistics</Text>
                <TouchableOpacity
                  onPress={() => setShowStats(false)}
                  style={styles.closeIcon}
                >
                  <Text style={styles.closeIconText}>✕</Text>
                </TouchableOpacity>
              </View>

              {stats && (
                <ScrollView style={styles.statsContainer} showsVerticalScrollIndicator={false}>
                  {/* Username Section */}
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>PLAYER PROFILE</Text>
                    {userProfile ? (
                      <View style={styles.profileCard}>
                        {editingUsername ? (
                          <View style={styles.editContainer}>
                            <TextInput
                              style={styles.usernameInput}
                              value={newUsername}
                              onChangeText={setNewUsername}
                              maxLength={20}
                              autoFocus
                              placeholder="Username"
                              placeholderTextColor="#999"
                            />
                            <View style={styles.editActions}>
                              <TouchableOpacity
                                style={[styles.actionButton, styles.saveButton]}
                                onPress={handleSaveUsername}
                              >
                                <Text style={styles.actionButtonText}>Save</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[styles.actionButton, styles.cancelButton]}
                                onPress={() => setEditingUsername(false)}
                              >
                                <Text style={styles.actionButtonText}>Cancel</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ) : (
                          <View style={styles.profileRow}>
                            <Text style={styles.usernameText}>{userProfile.username}</Text>
                            <TouchableOpacity
                              style={styles.editIcon}
                              onPress={handleEditUsername}
                            >
                              <Text style={styles.editIconText}>EDIT</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.setupCard}
                        onPress={() => {
                          setShowStats(false);
                          openUsernameSetup();
                        }}
                      >
                        <Text style={styles.setupText}>Tap to set username</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>GAME STATS</Text>
                    <View style={styles.statsGrid}>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats.gamesPlayed}</Text>
                        <Text style={styles.statLabel}>Played</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats.gamesWon}</Text>
                        <Text style={styles.statLabel}>Won</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>
                          {stats.gamesPlayed > 0
                            ? `${((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(0)}%`
                            : '0%'}
                        </Text>
                        <Text style={styles.statLabel}>Win Rate</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{bestScore}</Text>
                        <Text style={styles.statLabel}>Best</Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              )}
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
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 20 : 40,
  },
  title: {
    fontSize: 72,
    fontWeight: '800',
    color: colors.primaryDark,
    letterSpacing: 2,
    includeFontPadding: false,
  },
  subtitle: {
    fontSize: 18,
    color: colors.text,
    marginTop: 8,
    fontWeight: '500',
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: 30,
  },
  scoreCard: {
    backgroundColor: colors.scoreBox,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 40,
    alignItems: 'center',
    minWidth: 200,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
    letterSpacing: 1,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.textLight,
  },
  menuContainer: {
    width: '100%',
    gap: 16,
  },
  menuButton: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  primaryButton: {
    backgroundColor: colors.button,
  },
  primaryButtonText: {
    color: colors.buttonText,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
  accentButton: {
    backgroundColor: colors.gold || '#d4af37',
  },
  accentButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  rowButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  halfButton: {
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: colors.gridBackground,
  },
  secondaryButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    color: colors.text,
    fontSize: 14,
    opacity: 0.6,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay || 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  closeIcon: {
    padding: 8,
  },
  closeIconText: {
    fontSize: 24,
    color: colors.text,
    fontWeight: 'bold',
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
    opacity: 0.5,
    letterSpacing: 1,
  },
  profileCard: {
    backgroundColor: colors.surface || '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  usernameText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  editIcon: {
    backgroundColor: colors.gridBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editIconText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  setupCard: {
    backgroundColor: colors.surfaceHighlight || '#f3f3f3',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  setupText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface || '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  // Edit Mode
  editContainer: {
    gap: 12,
  },
  usernameInput: {
    fontSize: 18,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingVertical: 8,
    color: colors.primaryDark,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: colors.success || '#5cb85c',
  },
  cancelButton: {
    backgroundColor: colors.danger || '#d9534f',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default LobbyScreen;
