import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { getTileColor, getTileTextColor } from '../utils/colors';

const Tile = ({ value }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (value !== 0) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [value]);

  if (value === 0) {
    return <View style={styles.emptyTile} />;
  }

  return (
    <Animated.View
      style={[
        styles.tile,
        {
          backgroundColor: getTileColor(value),
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Text
        style={[
          styles.tileText,
          {
            color: getTileTextColor(value),
            fontSize: value >= 1000 ? 30 : value >= 100 ? 35 : 40,
          },
        ]}
      >
        {value}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tile: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTile: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#cdc1b4',
    opacity: 0.35,
  },
  tileText: {
    fontWeight: 'bold',
  },
});

// Memoize the component to prevent unnecessary re-renders
// Only re-render when the value prop changes
export default React.memo(Tile);
