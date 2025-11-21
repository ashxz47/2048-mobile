// Color scheme for different tile values
export const getTileColor = (value) => {
  const colors = {
    0: '#cdc1b4',
    2: '#eee4da',
    4: '#ede0c8',
    8: '#f2b179',
    16: '#f59563',
    32: '#f67c5f',
    64: '#f65e3b',
    128: '#edcf72',
    256: '#edcc61',
    512: '#edc850',
    1024: '#edc53f',
    2048: '#edc22e',
    4096: '#3c3a32',
    8192: '#3c3a32',
  };
  return colors[value] || '#3c3a32';
};

export const getTileTextColor = (value) => {
  return value <= 4 ? '#776e65' : '#f9f6f2';
};

export const colors = {
  background: '#faf8ef',
  gridBackground: '#bbada0',
  emptyCell: '#cdc1b4',
  text: '#776e65',
  textLight: '#f9f6f2',
  primary: '#8f7a66',
  button: '#8f7a66',
  buttonText: '#f9f6f2',
  scoreBox: '#bbada0',
  gameOver: 'rgba(238, 228, 218, 0.73)',
  // Premium UI Colors
  primaryDark: '#776e65',
  accent: '#edc22e',
  surface: '#ffffff',
  surfaceHighlight: '#f3f3f3',
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  success: '#5cb85c',
  danger: '#d9534f',
  gold: '#d4af37',
  bronze: '#cd7f32',
  silver: '#c0c0c0',
};
