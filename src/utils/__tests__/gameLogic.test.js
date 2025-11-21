import {
    initializeGrid,
    move,
    addRandomTile,
    hasWon,
    canMove,
    getHighestTile,
} from '../gameLogic';

describe('Game Logic', () => {
    describe('initializeGrid', () => {
        it('should create a 4x4 grid', () => {
            const grid = initializeGrid();
            expect(grid.length).toBe(4);
            grid.forEach(row => {
                expect(row.length).toBe(4);
            });
        });

        it('should start with 2 tiles', () => {
            const grid = initializeGrid();
            let tileCount = 0;
            grid.forEach(row => {
                row.forEach(cell => {
                    if (cell !== 0) tileCount++;
                });
            });
            expect(tileCount).toBe(2);
        });
    });

    describe('move', () => {
        it('should move tiles to the left', () => {
            const grid = [
                [0, 0, 2, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];
            const result = move(grid, 'left');
            expect(result.grid[0][0]).toBe(2);
            expect(result.moved).toBe(true);
        });

        it('should merge tiles', () => {
            const grid = [
                [2, 2, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];
            const result = move(grid, 'left');
            expect(result.grid[0][0]).toBe(4);
            expect(result.score).toBe(4);
            expect(result.moved).toBe(true);
        });

        it('should not move if no moves available in direction', () => {
            const grid = [
                [2, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];
            const result = move(grid, 'left');
            expect(result.moved).toBe(false);
        });
    });

    describe('hasWon', () => {
        it('should return true if 2048 tile exists', () => {
            const grid = [
                [2048, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];
            expect(hasWon(grid)).toBe(true);
        });

        it('should return false if no 2048 tile', () => {
            const grid = [
                [1024, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];
            expect(hasWon(grid)).toBe(false);
        });
    });

    describe('canMove', () => {
        it('should return true if empty cells exist', () => {
            const grid = [
                [2, 4, 8, 16],
                [32, 64, 128, 256],
                [512, 1024, 2, 4],
                [8, 16, 32, 0],
            ];
            expect(canMove(grid)).toBe(true);
        });

        it('should return true if merges are possible', () => {
            const grid = [
                [2, 2, 4, 8],
                [16, 32, 64, 128],
                [256, 512, 1024, 2],
                [4, 8, 16, 32],
            ];
            expect(canMove(grid)).toBe(true);
        });

        it('should return false if no moves possible', () => {
            const grid = [
                [2, 4, 8, 16],
                [32, 64, 128, 256],
                [512, 1024, 2, 4],
                [8, 16, 32, 64],
            ];
            expect(canMove(grid)).toBe(false);
        });
    });
});
