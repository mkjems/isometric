// Rendering functions for the isometric game

import { TILE_WIDTH, TILE_HEIGHT, GRID_ROWS, GRID_COLS, CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';
import { gridToScreen } from './grid.js';

// Draw a single isometric tile
export function drawTile(ctx, row, col, color, highlight = false, hover = false) {
    const { x, y } = gridToScreen(row, col);
    
    ctx.save();
    ctx.beginPath();
    
    // Draw diamond shape (base tile)
    ctx.moveTo(x, y);
    ctx.lineTo(x + TILE_WIDTH / 2, y + TILE_HEIGHT / 2);
    ctx.lineTo(x, y + TILE_HEIGHT);
    ctx.lineTo(x - TILE_WIDTH / 2, y + TILE_HEIGHT / 2);
    ctx.closePath();
    
    // Fill tile
    if (hover && !highlight) {
        ctx.fillStyle = '#90d5ff';
    } else {
        ctx.fillStyle = color;
    }
    ctx.fill();
    
    // Draw outline
    ctx.strokeStyle = hover && !highlight ? '#5599ff' : '#2a2a2a';
    ctx.lineWidth = hover && !highlight ? 2 : 1;
    ctx.stroke();

    // Draw 3D green box if highlighted
    if (highlight) {
        const boxHeight = 40;
        
        // Left face (vertical)
        ctx.beginPath();
        ctx.moveTo(x - TILE_WIDTH / 2, y + TILE_HEIGHT / 2);
        ctx.lineTo(x, y + TILE_HEIGHT);
        ctx.lineTo(x, y + TILE_HEIGHT - boxHeight);
        ctx.lineTo(x - TILE_WIDTH / 2, y + TILE_HEIGHT / 2 - boxHeight);
        ctx.closePath();
        ctx.fillStyle = '#44cc44';
        ctx.fill();
        ctx.strokeStyle = '#228822';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Right face (vertical)
        ctx.beginPath();
        ctx.moveTo(x + TILE_WIDTH / 2, y + TILE_HEIGHT / 2);
        ctx.lineTo(x, y + TILE_HEIGHT);
        ctx.lineTo(x, y + TILE_HEIGHT - boxHeight);
        ctx.lineTo(x + TILE_WIDTH / 2, y + TILE_HEIGHT / 2 - boxHeight);
        ctx.closePath();
        ctx.fillStyle = '#55dd55';
        ctx.fill();
        ctx.strokeStyle = '#228822';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Top face (diamond)
        ctx.beginPath();
        ctx.moveTo(x, y - boxHeight);
        ctx.lineTo(x + TILE_WIDTH / 2, y + TILE_HEIGHT / 2 - boxHeight);
        ctx.lineTo(x, y + TILE_HEIGHT - boxHeight);
        ctx.lineTo(x - TILE_WIDTH / 2, y + TILE_HEIGHT / 2 - boxHeight);
        ctx.closePath();
        ctx.fillStyle = '#66ff66';
        ctx.fill();
        ctx.strokeStyle = '#228822';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    ctx.restore();
}

// Draw a shadow under the player when jumping
export function drawShadow(ctx, row, col) {
    const { x, y } = gridToScreen(row, col);
    
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    
    // Draw shadow as a full tile-sized diamond
    ctx.moveTo(x, y);
    ctx.lineTo(x + TILE_WIDTH / 2, y + TILE_HEIGHT / 2);
    ctx.lineTo(x, y + TILE_HEIGHT);
    ctx.lineTo(x - TILE_WIDTH / 2, y + TILE_HEIGHT / 2);
    ctx.closePath();
    
    ctx.fillStyle = '#000000';
    ctx.fill();
    ctx.restore();
}

// Draw tile with jump offset
export function drawTileWithJump(ctx, row, col, color, highlight = false, hover = false, jumpHeight = 0) {
    const { x, y } = gridToScreen(row, col);
    const yOffset = -jumpHeight; // Negative to go up
    
    ctx.save();
    ctx.beginPath();
    
    // Draw diamond shape (base tile) with offset
    ctx.moveTo(x, y + yOffset);
    ctx.lineTo(x + TILE_WIDTH / 2, y + TILE_HEIGHT / 2 + yOffset);
    ctx.lineTo(x, y + TILE_HEIGHT + yOffset);
    ctx.lineTo(x - TILE_WIDTH / 2, y + TILE_HEIGHT / 2 + yOffset);
    ctx.closePath();
    
    // Fill tile
    if (hover && !highlight) {
        ctx.fillStyle = '#90d5ff';
    } else {
        ctx.fillStyle = color;
    }
    ctx.fill();
    
    // Draw outline
    ctx.strokeStyle = hover && !highlight ? '#5599ff' : '#2a2a2a';
    ctx.lineWidth = hover && !highlight ? 2 : 1;
    ctx.stroke();

    // Draw 3D green box if highlighted
    if (highlight) {
        const boxHeight = 40;
        
        // Left face (vertical)
        ctx.beginPath();
        ctx.moveTo(x - TILE_WIDTH / 2, y + TILE_HEIGHT / 2 + yOffset);
        ctx.lineTo(x, y + TILE_HEIGHT + yOffset);
        ctx.lineTo(x, y + TILE_HEIGHT - boxHeight + yOffset);
        ctx.lineTo(x - TILE_WIDTH / 2, y + TILE_HEIGHT / 2 - boxHeight + yOffset);
        ctx.closePath();
        ctx.fillStyle = '#44cc44';
        ctx.fill();
        ctx.strokeStyle = '#228822';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Right face (vertical)
        ctx.beginPath();
        ctx.moveTo(x + TILE_WIDTH / 2, y + TILE_HEIGHT / 2 + yOffset);
        ctx.lineTo(x, y + TILE_HEIGHT + yOffset);
        ctx.lineTo(x, y + TILE_HEIGHT - boxHeight + yOffset);
        ctx.lineTo(x + TILE_WIDTH / 2, y + TILE_HEIGHT / 2 - boxHeight + yOffset);
        ctx.closePath();
        ctx.fillStyle = '#55dd55';
        ctx.fill();
        ctx.strokeStyle = '#228822';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Top face (diamond)
        ctx.beginPath();
        ctx.moveTo(x, y - boxHeight + yOffset);
        ctx.lineTo(x + TILE_WIDTH / 2, y + TILE_HEIGHT / 2 - boxHeight + yOffset);
        ctx.lineTo(x, y + TILE_HEIGHT - boxHeight + yOffset);
        ctx.lineTo(x - TILE_WIDTH / 2, y + TILE_HEIGHT / 2 - boxHeight + yOffset);
        ctx.closePath();
        ctx.fillStyle = '#66ff66';
        ctx.fill();
        ctx.strokeStyle = '#228822';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    ctx.restore();
}

// Draw a projectile
export function drawProjectile(ctx, row, col) {
    const { x, y } = gridToScreen(row, col);
    
    ctx.save();
    ctx.beginPath();
    
    // Draw diamond shape (highlighted tile)
    ctx.moveTo(x, y);
    ctx.lineTo(x + TILE_WIDTH / 2, y + TILE_HEIGHT / 2);
    ctx.lineTo(x, y + TILE_HEIGHT);
    ctx.lineTo(x - TILE_WIDTH / 2, y + TILE_HEIGHT / 2);
    ctx.closePath();
    
    // Fill with bright light color
    ctx.fillStyle = '#ffff99';
    ctx.fill();
    
    // Draw glowing outline
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.restore();
}

// Draw the entire grid
export function drawGrid(ctx, grid, hoveredTile, projectiles, playerRow, playerCol, playerJumpHeight) {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw tiles back to front for proper layering
    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
            const tile = grid[row][col];
            const isHovered = hoveredTile &&
                             hoveredTile.row === row &&
                             hoveredTile.col === col;
            // Draw tiles without the green box first
            drawTile(ctx, row, col, tile.color, false, isHovered);
        }
    }
    
    // Draw projectiles
    projectiles.forEach(proj => {
        drawProjectile(ctx, proj.row, proj.col);
    });
    
    // Draw shadow if player is jumping
    if (playerJumpHeight > 0) {
        drawShadow(ctx, playerRow, playerCol);
    }
    
    // Draw player (green box) at fractional position with jump offset
    const tile = grid[Math.floor(playerRow)][Math.floor(playerCol)];
    drawTileWithJump(ctx, playerRow, playerCol, tile.color, true, false, playerJumpHeight);
}
