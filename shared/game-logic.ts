// Core game logic - Pure functions that update game state
// This is shared code that runs on both client and server
// No browser-specific dependencies

import type { GameState, InputState } from "../src/types.js";
import {
    PLAYER_SPEED,
    PLAYER_FRICTION,
    GRAVITY,
    GRID_ROWS,
    GRID_COLS,
    VELOCITY_THRESHOLD,
    SNAP_SPEED,
    SNAP_THRESHOLD,
} from "../src/utils/constants.js";

/**
 * Update game state based on input - handles player movement, jumping, and projectiles
 * This is the core game tick that should run identically on client and server
 * @param gameState - The game state object (mutated in place)
 * @param input - The current input state
 */
export function updateGameState(
    gameState: GameState,
    input: InputState
): void {
    updatePlayerMovement(gameState, input);
    updatePlayerJump(gameState);
    updateProjectiles(gameState);
}

/**
 * Update player movement based on input
 * @private
 */
function updatePlayerMovement(
    gameState: GameState,
    input: InputState
): void {
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
    if (input.up || input.down) {
        newAxisRequested = "row";
    } else if (input.left || input.right) {
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
            if (input.up) {
                player.velRow = -currentSpeed;
            } else if (input.down) {
                player.velRow = currentSpeed;
            }
        } else {
            if (input.left) {
                player.velCol = -currentSpeed;
            } else if (input.right) {
                player.velCol = currentSpeed;
            }
        }
    }

    // Apply input acceleration (only on current axis or when stopped)
    // Only allow acceleration/braking when on the ground
    if (isOnGround) {
        if (player.movementAxis === null || player.movementAxis === "row") {
            if (input.up) {
                player.velRow -= PLAYER_SPEED;
                player.movementAxis = "row";
                // Ensure no column velocity
                player.velCol = 0;
            } else if (input.down) {
                player.velRow += PLAYER_SPEED;
                player.movementAxis = "row";
                // Ensure no column velocity
                player.velCol = 0;
            }
        }

        if (player.movementAxis === null || player.movementAxis === "col") {
            if (input.left) {
                player.velCol -= PLAYER_SPEED;
                player.movementAxis = "col";
                // Ensure no row velocity
                player.velRow = 0;
            } else if (input.right) {
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
}

/**
 * Update player jump physics
 * @private
 */
function updatePlayerJump(gameState: GameState): void {
    const player = gameState.player;

    if (player.jumpHeight > 0 || player.jumpVelocity !== 0) {
        player.jumpVelocity -= GRAVITY;
        player.jumpHeight += player.jumpVelocity;

        // Land on ground
        if (player.jumpHeight <= 0) {
            player.jumpHeight = 0;
            player.jumpVelocity = 0;
        }
    }
}

/**
 * Update projectile positions and remove out-of-bounds ones
 * @private
 */
function updateProjectiles(gameState: GameState): void {
    // Update projectile positions
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
