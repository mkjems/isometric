// Player class to encapsulate player state and behavior

import type { GridPosition, MovementAxis } from "./types.ts";

export class Player {
  row: number;
  col: number;
  velRow: number;
  velCol: number;
  movementAxis: MovementAxis;
  jumpHeight: number;
  jumpVelocity: number;

  constructor(row: number, col: number) {
    this.row = row;
    this.col = col;
    this.velRow = 0;
    this.velCol = 0;
    this.movementAxis = null; // 'row' or 'col' or null when stopped
    this.jumpHeight = 0;
    this.jumpVelocity = 0;
  }

  /**
   * Get the player's grid position as integers
   */
  getGridPosition(): GridPosition {
    return {
      row: Math.floor(this.row),
      col: Math.floor(this.col),
    };
  }

  /**
   * Check if player is on the ground
   */
  isOnGround(): boolean {
    return this.jumpHeight === 0;
  }

  /**
   * Get the player's current speed (magnitude of velocity vector)
   */
  getSpeed(): number {
    return Math.sqrt(this.velRow * this.velRow + this.velCol * this.velCol);
  }

  /**
   * Snap player position to grid on specified axis
   */
  snapToGrid(axis: "row" | "col"): void {
    if (axis === "row") {
      this.row = Math.round(this.row);
      this.velRow = 0;
    } else if (axis === "col") {
      this.col = Math.round(this.col);
      this.velCol = 0;
    }
  }

  /**
   * Clamp player position to grid boundaries
   */
  clampToGrid(gridRows: number, gridCols: number): void {
    this.row = Math.max(0, Math.min(gridRows - 1, this.row));
    this.col = Math.max(0, Math.min(gridCols - 1, this.col));
  }

  /**
   * Initiate a jump
   */
  jump(jumpStrength: number): boolean {
    if (this.isOnGround() && this.jumpVelocity === 0) {
      this.jumpVelocity = jumpStrength;
      return true;
    }
    return false;
  }

  /**
   * Teleport player to a specific position (for click-to-move)
   */
  teleportTo(row: number, col: number): void {
    this.row = row;
    this.col = col;
    this.velRow = 0;
    this.velCol = 0;
    this.movementAxis = null;
  }
}
