// Main game orchestrator - ties all modules together

import { CANVAS_WIDTH, CANVAS_HEIGHT, INITIAL_PLAYER_ROW, INITIAL_PLAYER_COL } from './constants.js';
import { initGrid } from './grid.js';
import { drawGrid } from './renderer.js';
import { initInputHandlers } from './input-handler.js';
import { update } from './physics.js';

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
    
    // Player state
    playerRow: INITIAL_PLAYER_ROW,
    playerCol: INITIAL_PLAYER_COL,
    playerVelRow: 0,
    playerVelCol: 0,
    movementAxis: null, // 'row' or 'col' or null when stopped
    playerJumpHeight: 0,
    playerJumpVelocity: 0
};

// Initialize game
function init() {
    gameState.grid = initGrid();
    initInputHandlers(canvas, gameState);
}

// Game loop
function gameLoop() {
    update(gameState);
    drawGrid(
        ctx, 
        gameState.grid, 
        gameState.hoveredTile, 
        gameState.projectiles, 
        gameState.playerRow, 
        gameState.playerCol, 
        gameState.playerJumpHeight
    );
    requestAnimationFrame(gameLoop);
}

// Start the game
init();
gameLoop();
