// Input handling for keyboard and mouse events

import { GRID_ROWS, GRID_COLS, JUMP_STRENGTH, PROJECTILE_SPEED } from './constants.js';
import { screenToGrid } from './grid.js';
import { playJumpSound, playPhaserSound } from './sound-effects.js';

// Keyboard state tracking
export const keys = {};

/**
 * Initialize input handlers for the game
 * @param {HTMLCanvasElement} canvas - The game canvas
 * @param {Object} gameState - The game state object
 * @returns {Object} The keys object for passing to physics update
 */
export function initInputHandlers(canvas, gameState) {
    // Keyboard input tracking
    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        
        // Shoot projectile with spacebar
        if (e.key === ' ') {
            shootProjectile(gameState);
            playPhaserSound();
            e.preventDefault();
        }
        
        // Jump with x key
        if (e.key === 'x' || e.key === 'X') {
            if (gameState.player.jump(JUMP_STRENGTH)) {
                playJumpSound();
            }
            e.preventDefault();
        }
        
        // Prevent arrow key scrolling
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }
    });

    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });

    // Handle mouse click
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const { row, col } = screenToGrid(mouseX, mouseY);
        
        // Check if clicked tile is within grid bounds
        if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
            // Move player to clicked position instantly
            gameState.player.teleportTo(row, col);
        }
    });

    // Handle mouse move for hover effect
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const { row, col } = screenToGrid(mouseX, mouseY);
        
        // Check if over valid tile
        if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
            canvas.style.cursor = 'pointer';
            
            // Update hovered tile if it changed
            if (!gameState.hoveredTile || gameState.hoveredTile.row !== row || gameState.hoveredTile.col !== col) {
                gameState.hoveredTile = { row, col };
            }
        } else {
            canvas.style.cursor = 'default';
            
            // Clear hovered tile if mouse left the grid
            if (gameState.hoveredTile) {
                gameState.hoveredTile = null;
            }
        }
    });
    
    return keys;
}

// Shoot a projectile in upward direction
function shootProjectile(gameState) {
    const playerPos = gameState.player.getGridPosition();
    gameState.projectiles.push({
        row: playerPos.row,
        col: playerPos.col,
        velRow: -PROJECTILE_SPEED, // Move up
        velCol: 0
    });
}
