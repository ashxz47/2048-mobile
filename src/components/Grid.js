import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Tile from './Tile';
import { colors } from '../utils/colors';

const { width } = Dimensions.get('window');
const GRID_PADDING = 10;
const CELL_MARGIN = 8;

const Grid = ({ grid }) => {
  const gridSize = width - 40; // 20px margin on each side
  const cellSize = (gridSize - GRID_PADDING * 2 - CELL_MARGIN * 3) / 4;

  return (
    <View style={[styles.grid, { width: gridSize, height: gridSize, padding: GRID_PADDING }]}>
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
                  marginRight: colIndex < 3 ? CELL_MARGIN : 0,
                  marginBottom: rowIndex < 3 ? CELL_MARGIN : 0,
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
