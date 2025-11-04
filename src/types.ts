// Type definitions for the isometric game

/**
 * Represents a tile in the grid
 */
export interface Tile {
  row: number;
  col: number;
  height: number;
  color: string;
}

/**
 * Position on the grid
 */
export interface GridPosition {
  row: number;
  col: number;
}

/**
 * Screen coordinates
 */
export interface ScreenCoordinates {
  x: number;
  y: number;
}

/**
 * A projectile fired by the player
 */
export interface Projectile {
  row: number;
  col: number;
  velRow: number;
  velCol: number;
}

/**
 * Movement axis type
 */
export type MovementAxis = "row" | "col" | null;

/**
 * Keyboard state - maps key names to their pressed state
 */
export interface KeyboardState {
  [key: string]: boolean;
}

/**
 * Game state containing all mutable game data
 */
export interface GameState {
  grid: Tile[][];
  selectedTile: GridPosition | null;
  hoveredTile: GridPosition | null;
  projectiles: Projectile[];
  player: Player;
}

/**
 * Player interface (for the Player class)
 */
export interface Player {
  row: number;
  col: number;
  velRow: number;
  velCol: number;
  movementAxis: MovementAxis;
  jumpHeight: number;
  jumpVelocity: number;

  getGridPosition(): GridPosition;
  isOnGround(): boolean;
  getSpeed(): number;
  snapToGrid(axis: "row" | "col"): void;
  clampToGrid(gridRows: number, gridCols: number): void;
  jump(jumpStrength: number): boolean;
  teleportTo(row: number, col: number): void;
}
