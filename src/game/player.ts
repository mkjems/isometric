// Player class to encapsulate player state and behavior

import type { GridPosition, MovementAxis } from "../types.ts";

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

  getGridPosition(): GridPosition {
    return {
      row: Math.floor(this.row),
      col: Math.floor(this.col),
    };
  }

  isOnGround(): boolean {
    return this.jumpHeight === 0;
  }

  getSpeed(): number {
    return Math.sqrt(this.velRow * this.velRow + this.velCol * this.velCol);
  }

  snapToGrid(axis: "row" | "col"): void {
    if (axis === "row") {
      this.row = Math.round(this.row);
      this.velRow = 0;
    } else if (axis === "col") {
      this.col = Math.round(this.col);
      this.velCol = 0;
    }
  }

  clampToGrid(gridRows: number, gridCols: number): void {
    this.row = Math.max(0, Math.min(gridRows - 1, this.row));
    this.col = Math.max(0, Math.min(gridCols - 1, this.col));
  }

  jump(jumpStrength: number): boolean {
    if (this.isOnGround() && this.jumpVelocity === 0) {
      this.jumpVelocity = jumpStrength;
      return true;
    }
    return false;
  }

  teleportTo(row: number, col: number): void {
    this.row = row;
    this.col = col;
    this.velRow = 0;
    this.velCol = 0;
    this.movementAxis = null;
  }
}
