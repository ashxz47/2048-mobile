import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { colors } from '../utils/colors';
import {
  getLeaderboard,
  LEADERBOARD_STRATEGIES,
  getCurrentUserRank,
} from '../utils/leaderboard';
import { getUserProfile } from '../utils/profile';

// Build categories from strategies
const CATEGORIES = Object.keys(LEADERBOARD_STRATEGIES).map(id => ({
  id,
  label: LEADERBOARD_STRATEGIES[id].label,
  field: LEADERBOARD_STRATEGIES[id].field,
}));

const HallOfFameScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('score');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [selectedCategory]);

  const loadUserProfile = async () => {
    const profile = await getUserProfile();
    setUserProfile(profile);
  };

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      // Use unified getLeaderboard function with strategy pattern
      const data = await getLeaderboard(selectedCategory, 20);
      setLeaderboardData(data);

      // Get current user rank
      const rank = await getCurrentUserRank(selectedCategory);
      setCurrentUserRank(rank);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (category, value) => {
    const strategy = LEADERBOARD_STRATEGIES[category];
    return strategy ? strategy.formatter(value) : value;
  };

  const getRankStyle = (rank) => {
    switch (rank) {
      case 1:
        return styles.goldRank;
      case 2:
        return styles.silverRank;
      case 3:
        return styles.bronzeRank;
      default:
        return styles.defaultRank;
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return rank;
    }
  };

  const renderLeaderboardItem = ({ item, index }) => {
    const category = CATEGORIES.find(cat => cat.id === selectedCategory);
    const isCurrentUser = item.isCurrentUser;

    return (
      <View
        style={[
          styles.leaderboardItem,
          isCurrentUser && styles.currentUserItem,
          index === 0 && styles.firstItem,
        ]}
      >
        <View style={[styles.rankBadge, getRankStyle(item.rank)]}>
          <Text style={styles.rankText}>{getRankIcon(item.rank)}</Text>
        </View>

        <View style={styles.playerInfo}>
          <Text
            style={[styles.username, isCurrentUser && styles.currentUserText]}
            numberOfLines={1}
          >
            {item.username} {isCurrentUser && '(You)'}
          </Text>
          <Text style={styles.playerStats}>
            {selectedCategory === 'winRate' && `${item.gamesPlayed} games played`}
            {selectedCategory !== 'winRate' && `Win rate: ${item.winRate.toFixed(1)}%`}
          </Text>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreValue, isCurrentUser && styles.currentUserText]}>
            {formatValue(selectedCategory, item[category.field])}
          </Text>
        </View>
      </View>
    );
  };

  const renderCategoryButton = (category) => {
    const isSelected = selectedCategory === category.id;
    return (
      <TouchableOpacity
        key={category.id}
        style={[styles.categoryButton, isSelected && styles.selectedCategory]}
        onPress={() => setSelectedCategory(category.id)}
      >
        <Text style={[styles.categoryText, isSelected && styles.selectedCategoryText]}>
          {category.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Hall of Fame</Text>
        <View style={{ width: 60 }} />
      </View>

      {userProfile && currentUserRank && (
        <View style={styles.userRankCard}>
          <Text style={styles.userRankLabel}>Your Rank</Text>
          <Text style={styles.userRankValue}>
            #{currentUserRank.rank} of {currentUserRank.total}
          </Text>
        </View>
      )}

      {!userProfile && (
        <View style={styles.noProfileCard}>
          <Text style={styles.noProfileText}>
            Set up your username in the Statistics menu to see your ranking!
          </Text>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map(renderCategoryButton)}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
        </View>
      ) : (
        <FlatList
          data={leaderboardData}
          renderItem={renderLeaderboardItem}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No data available</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  userRankCard: {
    backgroundColor: colors.scoreBox,
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userRankLabel: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '600',
  },
  userRankValue: {
    fontSize: 20,
    color: colors.textLight,
    fontWeight: 'bold',
  },
  noProfileCard: {
    backgroundColor: '#f0e6d6',
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
  },
  noProfileText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
  categoriesContainer: {
    maxHeight: 50,
    marginVertical: 10,
  },
  categoriesContent: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  selectedCategory: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  selectedCategoryText: {
    color: colors.textLight,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  firstItem: {
    backgroundColor: '#fff9e6',
    borderWidth: 2,
    borderColor: '#ffd700',
  },
  currentUserItem: {
    backgroundColor: '#e8f4f8',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  rankBadge: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  goldRank: {
    backgroundColor: '#ffd700',
  },
  silverRank: {
    backgroundColor: '#c0c0c0',
  },
  bronzeRank: {
    backgroundColor: '#cd7f32',
  },
  defaultRank: {
    backgroundColor: colors.gridBackground,
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  playerInfo: {
    flex: 1,
    marginRight: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 3,
  },
  currentUserText: {
    color: colors.primary,
  },
  playerStats: {
    fontSize: 12,
    color: '#888',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: colors.text,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
});

export default HallOfFameScreen;
