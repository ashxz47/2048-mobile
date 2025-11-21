/**
 * useInputController Hook
 * Unified input handling for keyboard, mouse, and touch gestures
 * Eliminates duplicate input logic across the application
 */
import { useEffect, useRef, useCallback } from 'react';
import { PanResponder } from 'react-native';
import { GAME_CONFIG } from '../utils/constants';

/**
 * Custom hook to handle all input methods for the game
 * @param {Function} onSwipe - Callback function when a swipe is detected
 * @param {boolean} enabled - Whether input should be enabled
 * @returns {Object} - Pan responder handlers
 */
export const useInputController = (onSwipe, enabled = true) => {
  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!enabled) return;

      const keyMap = {
        'ArrowUp': 'up',
        'ArrowDown': 'down',
        'ArrowLeft': 'left',
        'ArrowRight': 'right',
        'w': 'up',
        's': 'down',
        'a': 'left',
        'd': 'right',
      };

      const direction = keyMap[e.key];
      if (direction) {
        e.preventDefault();
        onSwipe(direction);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyPress);
      return () => {
        window.removeEventListener('keydown', handleKeyPress);
      };
    }
  }, [onSwipe, enabled]);

  // Mouse drag controls for web
  useEffect(() => {
    let startX = 0;
    let startY = 0;

    const handleMouseDown = (e) => {
      if (!enabled) return;
      startX = e.clientX;
      startY = e.clientY;
    };

    const handleMouseUp = (e) => {
      if (!enabled) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (absX < GAME_CONFIG.MIN_SWIPE_DISTANCE && absY < GAME_CONFIG.MIN_SWIPE_DISTANCE) {
        return;
      }

      if (absX > absY) {
        onSwipe(dx > 0 ? 'right' : 'left');
      } else {
        onSwipe(dy > 0 ? 'down' : 'up');
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
  }, [onSwipe, enabled]);

  // Touch gesture handling with PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => enabled,
      onPanResponderRelease: (evt, gestureState) => {
        if (!enabled) return;

        const { dx, dy } = gestureState;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);

        if (absX < GAME_CONFIG.MIN_SWIPE_DISTANCE && absY < GAME_CONFIG.MIN_SWIPE_DISTANCE) {
          return;
        }

        if (absX > absY) {
          onSwipe(dx > 0 ? 'right' : 'left');
        } else {
          onSwipe(dy > 0 ? 'down' : 'up');
        }
      },
    })
  ).current;

  return panResponder.panHandlers;
};
