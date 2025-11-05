// Rendering functions for the isometric game

import { TILE_WIDTH, TILE_HEIGHT, GRID_ROWS, GRID_COLS, CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/constants.ts';
import { gridToScreen } from '../game/grid.js';
import type { Tile, Projectile } from '../types.js';
import {
    BOX_HEIGHT,
    TILE_HOVER_COLOR,
    TILE_HOVER_BORDER,
    TILE_BORDER_COLOR,
    BOX_COLOR_LEFT,
    BOX_COLOR_RIGHT,
    BOX_COLOR_TOP,
    BOX_BORDER_COLOR,
    PLAYER1_COLOR_LEFT,
    PLAYER1_COLOR_RIGHT,
    PLAYER1_COLOR_TOP,
    PLAYER1_BORDER_COLOR,
    PLAYER2_COLOR_LEFT,
    PLAYER2_COLOR_RIGHT,
    PLAYER2_COLOR_TOP,
    PLAYER2_BORDER_COLOR,
    PROJECTILE_FILL_COLOR,
    PROJECTILE_GLOW_COLOR,
    PROJECTILE_GLOW_WIDTH,
    SHADOW_COLOR,
    SHADOW_OPACITY,
    TILE_BORDER_WIDTH,
    TILE_HOVER_BORDER_WIDTH,
    BOX_BORDER_WIDTH
} from './rendering-constants.ts';

// Draw a single isometric tile
export function drawTile(ctx: CanvasRenderingContext2D, row: number, col: number, color: string, highlight = false, hover = false): void {
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
        ctx.fillStyle = TILE_HOVER_COLOR;
    } else {
        ctx.fillStyle = color;
    }
    ctx.fill();

    // Draw outline
    ctx.strokeStyle = hover && !highlight ? TILE_HOVER_BORDER : TILE_BORDER_COLOR;
    ctx.lineWidth = hover && !highlight ? TILE_HOVER_BORDER_WIDTH : TILE_BORDER_WIDTH;
    ctx.stroke();

    // Draw 3D green box if highlighted
    if (highlight) {
        const boxHeight = BOX_HEIGHT;

        // Left face (vertical)
        ctx.beginPath();
        ctx.moveTo(x - TILE_WIDTH / 2, y + TILE_HEIGHT / 2);
        ctx.lineTo(x, y + TILE_HEIGHT);
        ctx.lineTo(x, y + TILE_HEIGHT - boxHeight);
        ctx.lineTo(x - TILE_WIDTH / 2, y + TILE_HEIGHT / 2 - boxHeight);
        ctx.closePath();
        ctx.fillStyle = BOX_COLOR_LEFT;
        ctx.fill();
        ctx.strokeStyle = BOX_BORDER_COLOR;
        ctx.lineWidth = BOX_BORDER_WIDTH;
        ctx.stroke();

        // Right face (vertical)
        ctx.beginPath();
        ctx.moveTo(x + TILE_WIDTH / 2, y + TILE_HEIGHT / 2);
        ctx.lineTo(x, y + TILE_HEIGHT);
        ctx.lineTo(x, y + TILE_HEIGHT - boxHeight);
        ctx.lineTo(x + TILE_WIDTH / 2, y + TILE_HEIGHT / 2 - boxHeight);
        ctx.closePath();
        ctx.fillStyle = BOX_COLOR_RIGHT;
        ctx.fill();
        ctx.strokeStyle = BOX_BORDER_COLOR;
        ctx.lineWidth = BOX_BORDER_WIDTH;
        ctx.stroke();

        // Top face (diamond)
        ctx.beginPath();
        ctx.moveTo(x, y - boxHeight);
        ctx.lineTo(x + TILE_WIDTH / 2, y + TILE_HEIGHT / 2 - boxHeight);
        ctx.lineTo(x, y + TILE_HEIGHT - boxHeight);
        ctx.lineTo(x - TILE_WIDTH / 2, y + TILE_HEIGHT / 2 - boxHeight);
        ctx.closePath();
        ctx.fillStyle = BOX_COLOR_TOP;
        ctx.fill();
        ctx.strokeStyle = BOX_BORDER_COLOR;
        ctx.lineWidth = BOX_BORDER_WIDTH;
        ctx.stroke();
    }

    ctx.restore();
}

// Draw a shadow under the player when jumping
export function drawShadow(ctx: CanvasRenderingContext2D, row: number, col: number): void {
    const { x, y } = gridToScreen(row, col);

    ctx.save();
    ctx.globalAlpha = SHADOW_OPACITY;
    ctx.beginPath();

    // Draw shadow as a full tile-sized diamond
    ctx.moveTo(x, y);
    ctx.lineTo(x + TILE_WIDTH / 2, y + TILE_HEIGHT / 2);
    ctx.lineTo(x, y + TILE_HEIGHT);
    ctx.lineTo(x - TILE_WIDTH / 2, y + TILE_HEIGHT / 2);
    ctx.closePath();

    ctx.fillStyle = SHADOW_COLOR;
    ctx.fill();
    ctx.restore();
}

// Draw tile with jump offset
export function drawTileWithJump(
    ctx: CanvasRenderingContext2D,
    row: number,
    col: number,
    color: string,
    highlight = false,
    hover = false,
    jumpHeight = 0,
    playerColors = {
        left: BOX_COLOR_LEFT,
        right: BOX_COLOR_RIGHT,
        top: BOX_COLOR_TOP,
        border: BOX_BORDER_COLOR
    }
): void {
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
        ctx.fillStyle = TILE_HOVER_COLOR;
    } else {
        ctx.fillStyle = color;
    }
    ctx.fill();

    // Draw outline
    ctx.strokeStyle = hover && !highlight ? TILE_HOVER_BORDER : TILE_BORDER_COLOR;
    ctx.lineWidth = hover && !highlight ? TILE_HOVER_BORDER_WIDTH : TILE_BORDER_WIDTH;
    ctx.stroke();

    // Draw 3D green box if highlighted
    if (highlight) {
        const boxHeight = BOX_HEIGHT;

        // Left face (vertical)
        ctx.beginPath();
        ctx.moveTo(x - TILE_WIDTH / 2, y + TILE_HEIGHT / 2 + yOffset);
        ctx.lineTo(x, y + TILE_HEIGHT + yOffset);
        ctx.lineTo(x, y + TILE_HEIGHT - boxHeight + yOffset);
        ctx.lineTo(x - TILE_WIDTH / 2, y + TILE_HEIGHT / 2 - boxHeight + yOffset);
        ctx.closePath();
        ctx.fillStyle = playerColors.left;
        ctx.fill();
        ctx.strokeStyle = playerColors.border;
        ctx.lineWidth = BOX_BORDER_WIDTH;
        ctx.stroke();

        // Right face (vertical)
        ctx.beginPath();
        ctx.moveTo(x + TILE_WIDTH / 2, y + TILE_HEIGHT / 2 + yOffset);
        ctx.lineTo(x, y + TILE_HEIGHT + yOffset);
        ctx.lineTo(x, y + TILE_HEIGHT - boxHeight + yOffset);
        ctx.lineTo(x + TILE_WIDTH / 2, y + TILE_HEIGHT / 2 - boxHeight + yOffset);
        ctx.closePath();
        ctx.fillStyle = playerColors.right;
        ctx.fill();
        ctx.strokeStyle = playerColors.border;
        ctx.lineWidth = BOX_BORDER_WIDTH;
        ctx.stroke();

        // Top face (diamond)
        ctx.beginPath();
        ctx.moveTo(x, y - boxHeight + yOffset);
        ctx.lineTo(x + TILE_WIDTH / 2, y + TILE_HEIGHT / 2 - boxHeight + yOffset);
        ctx.lineTo(x, y + TILE_HEIGHT - boxHeight + yOffset);
        ctx.lineTo(x - TILE_WIDTH / 2, y + TILE_HEIGHT / 2 - boxHeight + yOffset);
        ctx.closePath();
        ctx.fillStyle = playerColors.top;
        ctx.fill();
        ctx.strokeStyle = playerColors.border;
        ctx.lineWidth = BOX_BORDER_WIDTH;
        ctx.stroke();
    }

    ctx.restore();
}

// Draw a projectile
export function drawProjectile(ctx: CanvasRenderingContext2D, row: number, col: number): void {
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
    ctx.fillStyle = PROJECTILE_FILL_COLOR;
    ctx.fill();

    // Draw glowing outline
    ctx.strokeStyle = PROJECTILE_GLOW_COLOR;
    ctx.lineWidth = PROJECTILE_GLOW_WIDTH;
    ctx.stroke();

    ctx.restore();
}

// Draw the entire grid
export function drawGrid(
    ctx: CanvasRenderingContext2D,
    grid: Tile[][],
    hoveredTile: { row: number; col: number } | null,
    projectiles: Projectile[],
    players: Map<number, { row: number; col: number; jumpHeight: number }>,
    _myPlayerNumber: number | null = null // Underscore prefix indicates intentionally unused
): void {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw tiles back to front for proper layering
    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
            const tile = grid[row][col];
            const isHovered = hoveredTile &&
                hoveredTile.row === row &&
                hoveredTile.col === col;
            // Draw tiles without the green box first
            drawTile(ctx, row, col, tile.color, false, !!isHovered);
        }
    }

    // Draw projectiles
    projectiles.forEach((proj: Projectile) => {
        drawProjectile(ctx, proj.row, proj.col);
    });

    // Draw all players
    for (const [playerId, player] of players.entries()) {
        // Draw shadow if player is jumping
        if (player.jumpHeight > 0) {
            drawShadow(ctx, player.row, player.col);
        }

        // Draw player box at fractional position with jump offset
        const tile = grid[Math.floor(player.row)][Math.floor(player.col)];

        // Determine player colors based on player number
        const playerColors = playerId === 2
            ? {
                left: PLAYER2_COLOR_LEFT,
                right: PLAYER2_COLOR_RIGHT,
                top: PLAYER2_COLOR_TOP,
                border: PLAYER2_BORDER_COLOR
            }
            : {
                left: PLAYER1_COLOR_LEFT,
                right: PLAYER1_COLOR_RIGHT,
                top: PLAYER1_COLOR_TOP,
                border: PLAYER1_BORDER_COLOR
            };

        drawTileWithJump(ctx, player.row, player.col, tile.color, true, false, player.jumpHeight, playerColors);
    }
}
