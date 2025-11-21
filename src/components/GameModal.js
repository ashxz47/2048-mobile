/**
 * GameModal Component
 * Reusable modal for game events (win, game over, etc.)
 */
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../utils/colors';

export const GameModal = ({
  visible,
  title,
  message,
  stats = [],
  actions = [],
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalText}>{message}</Text>

          {/* Display stats */}
          {stats.map((stat, index) => (
            <Text key={index} style={styles.modalScore}>
              {stat.label}: {stat.value}
            </Text>
          ))}

          {/* Action buttons */}
          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.modalButton,
                action.secondary && styles.secondaryButton,
                action.disabled && styles.disabledButton,
                action.style,
              ]}
              onPress={action.onPress}
              disabled={action.disabled}
            >
              <Text style={styles.buttonText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 30,
    minWidth: 280,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalScore: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 5,
    textAlign: 'center',
    fontWeight: '600',
  },
  modalButton: {
    backgroundColor: colors.button,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#b89b7d',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.buttonText,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
