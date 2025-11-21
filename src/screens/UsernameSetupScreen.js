import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { colors } from '../utils/colors';
import { saveUserProfile } from '../utils/profile';
import { validateUsername } from '../utils/validators';

const UsernameSetupScreen = ({ navigation, onSetupComplete }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validate username using shared validator
    const validation = validateUsername(username);

    if (!validation.valid) {
      Alert.alert('Invalid Username', validation.errors.join('\n'));
      return;
    }

    setLoading(true);
    try {
      // Use the trimmed/validated username
      await saveUserProfile(validation.value);

      if (onSetupComplete) {
        onSetupComplete();
      } else if (navigation) {
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save username. Please try again.');
      console.error('Error saving username:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to 2048!</Text>
          <Text style={styles.subtitle}>Set up your username to compete on the leaderboard</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              placeholderTextColor="#999"
              maxLength={20}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
            <Text style={styles.hint}>3-20 characters, letters, numbers, spaces, _ and -</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Saving...' : 'Continue'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: colors.gridBackground,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: colors.text,
  },
  hint: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  button: {
    backgroundColor: colors.button,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.buttonText,
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#888',
    fontSize: 14,
  },
});

export default UsernameSetupScreen;
