import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import LobbyScreen from './src/screens/LobbyScreen';
import GameScreen from './src/screens/GameScreen';
import HallOfFameScreen from './src/screens/HallOfFameScreen';
import UsernameSetupScreen from './src/screens/UsernameSetupScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Lobby');
  const [listeners, setListeners] = useState({});

  // Create stable navigation object
  const [navigation] = useState(() => ({
    navigate: (screen) => {
      setCurrentScreen(screen);
    },
    goBack: () => {
      setCurrentScreen('Lobby');
    },
    addListener: (event, callback) => {
      if (event === 'focus') {
        // Capture the current screen at listener registration time
        // This is set correctly by the useEffect that will pass the screen context
        setCurrentScreen(current => {
          const screenName = current;
          setListeners(prev => ({
            ...prev,
            [screenName]: [...(prev[screenName] || []), callback]
          }));
          return current; // Don't actually change the screen
        });

        // Return unsubscribe function
        return () => {
          setCurrentScreen(current => {
            const screenName = current;
            setListeners(prev => ({
              ...prev,
              [screenName]: (prev[screenName] || []).filter(cb => cb !== callback)
            }));
            return current;
          });
        };
      }
      return () => { }; // Return empty unsubscribe for other events
    },
  }));

  // Trigger focus listeners when screen changes
  useEffect(() => {
    if (listeners[currentScreen]) {
      listeners[currentScreen].forEach(callback => callback());
    }
  }, [currentScreen, listeners]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Lobby':
        return <LobbyScreen navigation={navigation} />;
      case 'Game':
        return <GameScreen navigation={navigation} />;
      case 'HallOfFame':
        return <HallOfFameScreen navigation={navigation} />;
      case 'UsernameSetup':
        return <UsernameSetupScreen navigation={navigation} />;
      default:
        return <LobbyScreen navigation={navigation} />;
    }
  };

  return (
    <ErrorBoundary>
      <View style={{ flex: 1 }}>
        <StatusBar style="dark" />
        {renderScreen()}
      </View>
    </ErrorBoundary>
  );
}
