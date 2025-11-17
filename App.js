import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import LobbyScreen from './src/screens/LobbyScreen';
import GameScreen from './src/screens/GameScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Lobby');

  const navigation = {
    navigate: (screen) => setCurrentScreen(screen),
    goBack: () => setCurrentScreen('Lobby'),
  };

  return (
    <>
      <StatusBar style="dark" />
      {currentScreen === 'Lobby' ? (
        <LobbyScreen navigation={navigation} />
      ) : (
        <GameScreen navigation={navigation} />
      )}
    </>
  );
}
