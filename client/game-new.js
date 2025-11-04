// Main game orchestrator - ties all modules together

import { CANVAS_WIDTH, CANVAS_HEIGHT, INITIAL_PLAYER_ROW, INITIAL_PLAYER_COL } from './constants.js';
import { initGrid } from './grid.js';
import { drawGrid } from './renderer.js';
import { initInputHandlers } from './input-handler.js';
import { update } from './physics.js';
import { Player } from './player.js';
import { drawDebugInfo, toggleDebug } from './debug.js';

// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// Game state - central object holding all mutable state
const gameState = {
    grid: [],
    selectedTile: null,
    hoveredTile: null,
    projectiles: [],
    
    // Player - now using Player class
    player: new Player(INITIAL_PLAYER_ROW, INITIAL_PLAYER_COL)
};

// Keyboard state (returned from input handler)
let keys;

// Initialize game
function init() {
    gameState.grid = initGrid();
    keys = initInputHandlers(canvas, gameState);
    
    // Add debug toggle listener (press 'D' key)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'd' || e.key === 'D') {
            const enabled = toggleDebug();
            console.log(`Debug mode: ${enabled ? 'ON' : 'OFF'}`);
        }
    });
}

// Game loop
function gameLoop() {
    update(gameState, keys);
    drawGrid(
        ctx, 
        gameState.grid, 
        gameState.hoveredTile, 
        gameState.projectiles, 
        gameState.player.row, 
        gameState.player.col, 
        gameState.player.jumpHeight
    );
    drawDebugInfo(ctx, gameState);
    requestAnimationFrame(gameLoop);
}

// Start the game
init();
gameLoop();
