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
  players: Map<number, Player>; // Changed from single player to map of players (by player ID)
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

// ============================================================================
// COMMAND TYPES - For network-serializable game actions
// ============================================================================

/**
 * Direction commands for player movement
 */
export type Direction = "up" | "down" | "left" | "right";

/**
 * Game commands that can be sent from client to server
 * These represent player intentions and are network-serializable
 */
export type GameCommand =
  | { type: "MOVE"; direction: Direction; pressed: boolean }
  | { type: "JUMP" }
  | { type: "SHOOT" }
  | { type: "TELEPORT"; row: number; col: number }
  | { type: "STOP_MOVE"; direction: Direction };

/**
 * Input state derived from commands
 * Used for processing movement in physics
 */
export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

