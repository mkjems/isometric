// Physics and game state update logic

import {
  PLAYER_SPEED,
  PLAYER_FRICTION,
  GRAVITY,
  GRID_ROWS,
  GRID_COLS,
  VELOCITY_THRESHOLD,
  SNAP_SPEED,
  SNAP_THRESHOLD,
} from "./constants.ts";
import type { GameState, KeyboardState } from "./types.ts";

/**
 * Update game state - handles player movement, jumping, and projectiles
 * @param gameState - The game state object
 * @param keys - The current keyboard state (key -> boolean)
 */
export function update(gameState: GameState, keys: KeyboardState): void {
  const player = gameState.player;

  // Determine current movement state
  const hasRowVelocity = Math.abs(player.velRow) >= VELOCITY_THRESHOLD;
  const hasColVelocity = Math.abs(player.velCol) >= VELOCITY_THRESHOLD;
  const isMoving = hasRowVelocity || hasColVelocity;

  // Update movement axis based on current velocity
  if (!isMoving) {
    player.movementAxis = null;
  } else if (hasRowVelocity) {
    player.movementAxis = "row";
  } else if (hasColVelocity) {
    player.movementAxis = "col";
  }

  // Check what direction is being requested
  let newAxisRequested: "row" | "col" | null = null;
  if (keys["ArrowUp"] || keys["ArrowDown"]) {
    newAxisRequested = "row";
  } else if (keys["ArrowLeft"] || keys["ArrowRight"]) {
    newAxisRequested = "col";
  }

  // Check if player is on the ground
  const isOnGround = player.isOnGround();

  // Handle direction change (even when coasting with kinetic energy)
  // Only allow direction change when on the ground
  if (
    newAxisRequested &&
    player.movementAxis &&
    newAxisRequested !== player.movementAxis &&
    isOnGround
  ) {
    // Calculate total kinetic energy (speed)
    const currentSpeed = player.getSpeed();

    // Snap position to grid on the OLD axis (the one we're leaving)
    player.snapToGrid(player.movementAxis);

    // Switch to new axis
    player.movementAxis = newAxisRequested;

    // Apply the speed to the new axis based on requested direction
    if (newAxisRequested === "row") {
      if (keys["ArrowUp"]) {
        player.velRow = -currentSpeed;
      } else if (keys["ArrowDown"]) {
        player.velRow = currentSpeed;
      }
    } else {
      if (keys["ArrowLeft"]) {
        player.velCol = -currentSpeed;
      } else if (keys["ArrowRight"]) {
        player.velCol = currentSpeed;
      }
    }
  }

  // Apply input acceleration (only on current axis or when stopped)
  // Only allow acceleration/braking when on the ground
  if (isOnGround) {
    if (player.movementAxis === null || player.movementAxis === "row") {
      if (keys["ArrowUp"]) {
        player.velRow -= PLAYER_SPEED;
        player.movementAxis = "row";
        // Ensure no column velocity
        player.velCol = 0;
      } else if (keys["ArrowDown"]) {
        player.velRow += PLAYER_SPEED;
        player.movementAxis = "row";
        // Ensure no column velocity
        player.velCol = 0;
      }
    }

    if (player.movementAxis === null || player.movementAxis === "col") {
      if (keys["ArrowLeft"]) {
        player.velCol -= PLAYER_SPEED;
        player.movementAxis = "col";
        // Ensure no row velocity
        player.velRow = 0;
      } else if (keys["ArrowRight"]) {
        player.velCol += PLAYER_SPEED;
        player.movementAxis = "col";
        // Ensure no row velocity
        player.velRow = 0;
      }
    }
  }

  // Apply friction only to the active axis and only when on the ground
  if (isOnGround) {
    if (player.movementAxis === "row") {
      player.velRow *= PLAYER_FRICTION;
      player.velCol = 0; // Ensure other axis is zero
    } else if (player.movementAxis === "col") {
      player.velCol *= PLAYER_FRICTION;
      player.velRow = 0; // Ensure other axis is zero
    }
  } else {
    // In the air - no friction, maintain momentum
    // Just ensure one axis is zero
    if (player.movementAxis === "row") {
      player.velCol = 0;
    } else if (player.movementAxis === "col") {
      player.velRow = 0;
    }
  }

  // Update position
  player.row += player.velRow;
  player.col += player.velCol;

  // Clamp to grid boundaries
  player.clampToGrid(GRID_ROWS, GRID_COLS);

  // Stop velocity if very small
  if (Math.abs(player.velRow) < VELOCITY_THRESHOLD) player.velRow = 0;
  if (Math.abs(player.velCol) < VELOCITY_THRESHOLD) player.velCol = 0;

  // Snap to grid when completely stopped
  if (player.velRow === 0 && player.velCol === 0) {
    const targetRow = Math.round(player.row);
    const targetCol = Math.round(player.col);

    // Smoothly interpolate to grid position
    player.row += (targetRow - player.row) * SNAP_SPEED;
    player.col += (targetCol - player.col) * SNAP_SPEED;

    // If very close, snap exactly
    if (
      Math.abs(player.row - targetRow) < SNAP_THRESHOLD &&
      Math.abs(player.col - targetCol) < SNAP_THRESHOLD
    ) {
      player.row = targetRow;
      player.col = targetCol;
    }
  }

  // Update jump physics
  if (player.jumpHeight > 0 || player.jumpVelocity !== 0) {
    player.jumpVelocity -= GRAVITY;
    player.jumpHeight += player.jumpVelocity;

    // Land on ground
    if (player.jumpHeight <= 0) {
      player.jumpHeight = 0;
      player.jumpVelocity = 0;
    }
  }

  // Update projectiles
  gameState.projectiles.forEach((proj) => {
    proj.row += proj.velRow;
    proj.col += proj.velCol;
  });

  // Remove projectiles that are off the board
  gameState.projectiles = gameState.projectiles.filter(
    (proj) =>
      proj.row >= 0 &&
      proj.row < GRID_ROWS &&
      proj.col >= 0 &&
      proj.col < GRID_COLS
  );
}
