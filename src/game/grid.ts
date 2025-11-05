// Grid initialization and coordinate conversion utilities

import {
  TILE_WIDTH,
  TILE_HEIGHT,
  GRID_ROWS,
  GRID_COLS,
  OFFSET_X,
  OFFSET_Y,
} from "../utils/constants.ts";
import {
  TILE_COLOR_PRIMARY,
  TILE_COLOR_SECONDARY,
} from "../rendering/rendering-constants.ts";
import type { Tile, GridPosition, ScreenCoordinates } from "../types.ts";

// Initialize the grid with tiles
export function initGrid(): Tile[][] {
  const grid: Tile[][] = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    grid[row] = [];
    for (let col = 0; col < GRID_COLS; col++) {
      grid[row][col] = {
        row,
        col,
        height: 0,
        color: getColorForTile(row, col),
      };
    }
  }
  return grid;
}

// Get color based on position (checkerboard pattern)
export function getColorForTile(row: number, col: number): string {
  return (row + col) % 2 === 0 ? TILE_COLOR_PRIMARY : TILE_COLOR_SECONDARY;
}

// Convert grid coordinates to screen coordinates
export function gridToScreen(row: number, col: number): ScreenCoordinates {
  const x = OFFSET_X + (col - row) * (TILE_WIDTH / 2);
  const y = OFFSET_Y + (col + row) * (TILE_HEIGHT / 2);
  return { x, y };
}

// Convert screen coordinates to grid coordinates
export function screenToGrid(screenX: number, screenY: number): GridPosition {
  const relX = screenX - OFFSET_X;
  const relY = screenY - OFFSET_Y;

  const col = (relX / (TILE_WIDTH / 2) + relY / (TILE_HEIGHT / 2)) / 2;
  const row = (relY / (TILE_HEIGHT / 2) - relX / (TILE_WIDTH / 2)) / 2;

  return {
    row: Math.floor(row),
    col: Math.floor(col),
  };
}
