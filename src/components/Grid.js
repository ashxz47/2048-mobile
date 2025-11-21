import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Tile from './Tile';
import { colors } from '../utils/colors';
import { GAME_CONFIG } from '../utils/constants';

const { width } = Dimensions.get('window');

const Grid = ({ grid }) => {
  // Memoize grid size calculations for better performance
  const gridSize = useMemo(() => width - 40, [width]); // 20px margin on each side
  const cellSize = useMemo(
    () => (gridSize - GAME_CONFIG.GRID_PADDING * 2 - GAME_CONFIG.CELL_MARGIN * 3) / 4,
    [gridSize]
  );

  return (
    <View style={[styles.grid, { width: gridSize, height: gridSize, padding: GAME_CONFIG.GRID_PADDING }]}>
      {grid.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((cell, colIndex) => (
            <View
              key={`${rowIndex}-${colIndex}`}
              style={[
                styles.cell,
                {
                  width: cellSize,
                  height: cellSize,
                  marginRight: colIndex < 3 ? GAME_CONFIG.CELL_MARGIN : 0,
                  marginBottom: rowIndex < 3 ? GAME_CONFIG.CELL_MARGIN : 0,
                },
              ]}
            >
              <Tile value={cell} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(Grid);

const styles = StyleSheet.create({
  grid: {
    backgroundColor: colors.gridBackground,
    borderRadius: 10,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Grid;
