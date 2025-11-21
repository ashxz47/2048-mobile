import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import LobbyScreen from './src/screens/LobbyScreen';
import GameScreen from './src/screens/GameScreen';
import HallOfFameScreen from './src/screens/HallOfFameScreen';
import UsernameSetupScreen from './src/screens/UsernameSetupScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Lobby');
  const [listeners, setListeners] = useState({});

  // Navigation object with listener support
  const navigation = {
    navigate: (screen) => {
      setCurrentScreen(screen);
      // Trigger focus listener when navigating back to a screen
      if (listeners[screen]) {
        listeners[screen].forEach(callback => callback());
      }
    },
    goBack: () => {
      setCurrentScreen('Lobby');
      // Trigger focus listener when going back to Lobby
      if (listeners['Lobby']) {
        listeners['Lobby'].forEach(callback => callback());
      }
    },
    addListener: (event, callback) => {
      if (event === 'focus') {
        const screenName = currentScreen;
        setListeners(prev => ({
          ...prev,
          [screenName]: [...(prev[screenName] || []), callback]
        }));
        // Return unsubscribe function
        return () => {
          setListeners(prev => ({
            ...prev,
            [screenName]: (prev[screenName] || []).filter(cb => cb !== callback)
          }));
        };
      }
      return () => { }; // Return empty unsubscribe for other events
    },
  };

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
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      {renderScreen()}
    </View>
  );
}
