// Physics and game state update logic

import { PLAYER_SPEED, PLAYER_FRICTION, GRAVITY, GRID_ROWS, GRID_COLS } from './constants.js';
import { keys } from './input-handler.js';

const VELOCITY_THRESHOLD = 0.005;

// Update game state
export function update(gameState) {
    // Determine current movement state
    const hasRowVelocity = Math.abs(gameState.playerVelRow) >= VELOCITY_THRESHOLD;
    const hasColVelocity = Math.abs(gameState.playerVelCol) >= VELOCITY_THRESHOLD;
    const isMoving = hasRowVelocity || hasColVelocity;
    
    // Update movement axis based on current velocity
    if (!isMoving) {
        gameState.movementAxis = null;
    } else if (hasRowVelocity) {
        gameState.movementAxis = 'row';
    } else if (hasColVelocity) {
        gameState.movementAxis = 'col';
    }
    
    // Check what direction is being requested
    let newAxisRequested = null;
    if (keys['ArrowUp'] || keys['ArrowDown']) {
        newAxisRequested = 'row';
    } else if (keys['ArrowLeft'] || keys['ArrowRight']) {
        newAxisRequested = 'col';
    }
    
    // Check if player is on the ground
    const isOnGround = gameState.playerJumpHeight === 0;
    
    // Handle direction change (even when coasting with kinetic energy)
    // Only allow direction change when on the ground
    if (newAxisRequested && gameState.movementAxis && newAxisRequested !== gameState.movementAxis && isOnGround) {
        // Calculate total kinetic energy (speed)
        const currentSpeed = Math.sqrt(
            gameState.playerVelRow * gameState.playerVelRow + 
            gameState.playerVelCol * gameState.playerVelCol
        );
        
        // Snap position to grid on the OLD axis (the one we're leaving)
        if (gameState.movementAxis === 'row') {
            gameState.playerRow = Math.round(gameState.playerRow);
            gameState.playerVelRow = 0;
        } else {
            gameState.playerCol = Math.round(gameState.playerCol);
            gameState.playerVelCol = 0;
        }
        
        // Switch to new axis
        gameState.movementAxis = newAxisRequested;
        
        // Apply the speed to the new axis based on requested direction
        if (newAxisRequested === 'row') {
            if (keys['ArrowUp']) {
                gameState.playerVelRow = -currentSpeed;
            } else if (keys['ArrowDown']) {
                gameState.playerVelRow = currentSpeed;
            }
        } else {
            if (keys['ArrowLeft']) {
                gameState.playerVelCol = -currentSpeed;
            } else if (keys['ArrowRight']) {
                gameState.playerVelCol = currentSpeed;
            }
        }
    }
    
    // Apply input acceleration (only on current axis or when stopped)
    // Only allow acceleration/braking when on the ground
    if (isOnGround) {
        if (gameState.movementAxis === null || gameState.movementAxis === 'row') {
            if (keys['ArrowUp']) {
                gameState.playerVelRow -= PLAYER_SPEED;
                gameState.movementAxis = 'row';
                // Ensure no column velocity
                gameState.playerVelCol = 0;
            } else if (keys['ArrowDown']) {
                gameState.playerVelRow += PLAYER_SPEED;
                gameState.movementAxis = 'row';
                // Ensure no column velocity
                gameState.playerVelCol = 0;
            }
        }
        
        if (gameState.movementAxis === null || gameState.movementAxis === 'col') {
            if (keys['ArrowLeft']) {
                gameState.playerVelCol -= PLAYER_SPEED;
                gameState.movementAxis = 'col';
                // Ensure no row velocity
                gameState.playerVelRow = 0;
            } else if (keys['ArrowRight']) {
                gameState.playerVelCol += PLAYER_SPEED;
                gameState.movementAxis = 'col';
                // Ensure no row velocity
                gameState.playerVelRow = 0;
            }
        }
    }
    
    // Apply friction only to the active axis and only when on the ground
    if (isOnGround) {
        if (gameState.movementAxis === 'row') {
            gameState.playerVelRow *= PLAYER_FRICTION;
            gameState.playerVelCol = 0; // Ensure other axis is zero
        } else if (gameState.movementAxis === 'col') {
            gameState.playerVelCol *= PLAYER_FRICTION;
            gameState.playerVelRow = 0; // Ensure other axis is zero
        }
    } else {
        // In the air - no friction, maintain momentum
        // Just ensure one axis is zero
        if (gameState.movementAxis === 'row') {
            gameState.playerVelCol = 0;
        } else if (gameState.movementAxis === 'col') {
            gameState.playerVelRow = 0;
        }
    }
    
    // Update position
    gameState.playerRow += gameState.playerVelRow;
    gameState.playerCol += gameState.playerVelCol;
    
    // Clamp to grid boundaries
    gameState.playerRow = Math.max(0, Math.min(GRID_ROWS - 1, gameState.playerRow));
    gameState.playerCol = Math.max(0, Math.min(GRID_COLS - 1, gameState.playerCol));
    
    // Stop velocity if very small
    if (Math.abs(gameState.playerVelRow) < VELOCITY_THRESHOLD) gameState.playerVelRow = 0;
    if (Math.abs(gameState.playerVelCol) < VELOCITY_THRESHOLD) gameState.playerVelCol = 0;
    
    // Snap to grid when completely stopped
    if (gameState.playerVelRow === 0 && gameState.playerVelCol === 0) {
        const targetRow = Math.round(gameState.playerRow);
        const targetCol = Math.round(gameState.playerCol);
        
        // Smoothly interpolate to grid position
        const snapSpeed = 0.2;
        gameState.playerRow += (targetRow - gameState.playerRow) * snapSpeed;
        gameState.playerCol += (targetCol - gameState.playerCol) * snapSpeed;
        
        // If very close, snap exactly
        if (Math.abs(gameState.playerRow - targetRow) < 0.01 && 
            Math.abs(gameState.playerCol - targetCol) < 0.01) {
            gameState.playerRow = targetRow;
            gameState.playerCol = targetCol;
        }
    }
    
    // Update jump physics
    if (gameState.playerJumpHeight > 0 || gameState.playerJumpVelocity !== 0) {
        gameState.playerJumpVelocity -= GRAVITY;
        gameState.playerJumpHeight += gameState.playerJumpVelocity;
        
        // Land on ground
        if (gameState.playerJumpHeight <= 0) {
            gameState.playerJumpHeight = 0;
            gameState.playerJumpVelocity = 0;
        }
    }
    
    // Update projectiles
    gameState.projectiles.forEach(proj => {
        proj.row += proj.velRow;
        proj.col += proj.velCol;
    });
    
    // Remove projectiles that are off the board
    gameState.projectiles = gameState.projectiles.filter(proj => 
        proj.row >= 0 && proj.row < GRID_ROWS && 
        proj.col >= 0 && proj.col < GRID_COLS
    );
}
