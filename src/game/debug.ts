// Debug mode - displays useful development information

import { gridToScreen } from './grid.js';
import type { GameState } from '../types.js';
import type { Player } from './player.js';

// Debug state
let debugEnabled = false;
let frameCount = 0;
let lastFpsUpdate = performance.now();
let currentFps = 0;

/**
 * Toggle debug mode on/off
 */
export function toggleDebug() {
    debugEnabled = !debugEnabled;
    return debugEnabled;
}

/**
 * Check if debug mode is enabled
 */
export function isDebugEnabled() {
    return debugEnabled;
}

/**
 * Update FPS counter
 */
function updateFps() {
    frameCount++;
    const now = performance.now();
    const elapsed = now - lastFpsUpdate;

    if (elapsed >= 1000) { // Update every second
        currentFps = Math.round((frameCount * 1000) / elapsed);
        frameCount = 0;
        lastFpsUpdate = now;
    }
}

/**
 * Draw debug information on the canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} gameState - Game state object
 */
export function drawDebugInfo(ctx: CanvasRenderingContext2D, gameState: GameState): void {
    if (!debugEnabled) return;

    updateFps();

    // Get first player for debug display (or just show count if multiple)
    const player = gameState.players.get(1) || Array.from(gameState.players.values())[0];

    ctx.save();
    ctx.font = '14px monospace';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 300, 160);

    ctx.fillStyle = '#00ff00';
    let y = 30;
    const lineHeight = 20;

    // FPS
    ctx.fillText(`FPS: ${currentFps}`, 20, y);
    y += lineHeight;

    // Player position
    ctx.fillText(`Position: (${player.row.toFixed(2)}, ${player.col.toFixed(2)})`, 20, y);
    y += lineHeight;

    // Player grid position
    const gridPos = player.getGridPosition();
    ctx.fillText(`Grid Pos: (${gridPos.row}, ${gridPos.col})`, 20, y);
    y += lineHeight;

    // Player velocity
    ctx.fillText(`Velocity: (${player.velRow.toFixed(3)}, ${player.velCol.toFixed(3)})`, 20, y);
    y += lineHeight;

    // Player speed
    const speed = player.getSpeed();
    ctx.fillText(`Speed: ${speed.toFixed(3)}`, 20, y);
    y += lineHeight;

    // Movement axis
    ctx.fillText(`Axis: ${player.movementAxis || 'none'}`, 20, y);
    y += lineHeight;

    // Jump state
    ctx.fillText(`Jump: ${player.jumpHeight.toFixed(1)} (vel: ${player.jumpVelocity.toFixed(1)})`, 20, y);
    y += lineHeight;

    // Projectile count
    ctx.fillText(`Projectiles: ${gameState.projectiles.length}`, 20, y);

    // Draw grid coordinates on tiles
    drawGridCoordinates(ctx, player);

    ctx.restore();
}

/**
 * Draw grid coordinates on tiles near the player
 */
function drawGridCoordinates(ctx: CanvasRenderingContext2D, player: Player): void {
    const gridPos = player.getGridPosition();
    const range = 3; // Show coordinates for tiles within 3 tiles of player

    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let row = Math.max(0, gridPos.row - range); row <= gridPos.row + range; row++) {
        for (let col = Math.max(0, gridPos.col - range); col <= gridPos.col + range; col++) {
            const { x, y } = gridToScreen(row, col);

            // Draw semi-transparent background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(x - 20, y + 10, 40, 12);

            // Draw coordinates
            ctx.fillStyle = '#ffffff';
            ctx.fillText(`${row},${col}`, x, y + 16);
        }
    }

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
}
