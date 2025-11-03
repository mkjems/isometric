const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 1200;
canvas.height = 800;

// Isometric grid settings
const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;
const GRID_ROWS = 20;
const GRID_COLS = 20;

// Offset to center the grid
const OFFSET_X = canvas.width / 2;
const OFFSET_Y = 150;

// Grid data
const grid = [];
let selectedTile = null;
let hoveredTile = null;
let projectiles = [];

// Player position (using fractional coordinates for smooth movement)
let playerRow = 10;
let playerCol = 10;
let playerVelRow = 0;
let playerVelCol = 0;
let movementAxis = null; // 'row' or 'col' or null when stopped

// Game settings
const PLAYER_SPEED = 0.15;
const PLAYER_FRICTION = 0.85;
const PROJECTILE_SPEED = 0.3;

// Initialize grid
function initGrid() {
    for (let row = 0; row < GRID_ROWS; row++) {
        grid[row] = [];
        for (let col = 0; col < GRID_COLS; col++) {
            grid[row][col] = {
                row,
                col,
                height: 0,
                color: getColorForTile(row, col)
            };
        }
    }
}

// Get color based on position (checkerboard pattern)
function getColorForTile(row, col) {
    return (row + col) % 2 === 0 ? '#4a9eff' : '#4598f6ff';
}

// Convert grid coordinates to screen coordinates
function gridToScreen(row, col) {
    const x = OFFSET_X + (col - row) * (TILE_WIDTH / 2);
    const y = OFFSET_Y + (col + row) * (TILE_HEIGHT / 2);
    return { x, y };
}

// Convert screen coordinates to grid coordinates
function screenToGrid(screenX, screenY) {
    const relX = screenX - OFFSET_X;
    const relY = screenY - OFFSET_Y;
    
    const col = (relX / (TILE_WIDTH / 2) + relY / (TILE_HEIGHT / 2)) / 2;
    const row = (relY / (TILE_HEIGHT / 2) - relX / (TILE_WIDTH / 2)) / 2;
    
    return {
        row: Math.floor(row),
        col: Math.floor(col)
    };
}

// Draw a single isometric tile
function drawTile(row, col, color, highlight = false, hover = false) {
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

// Draw the entire grid
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw tiles back to front for proper layering
    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
            const tile = grid[row][col];
            const isHovered = hoveredTile &&
                             hoveredTile.row === row &&
                             hoveredTile.col === col;
            // Draw tiles without the green box first
            drawTile(row, col, tile.color, false, isHovered);
        }
    }
    
    // Draw projectiles
    projectiles.forEach(proj => {
        drawProjectile(proj.row, proj.col);
    });
    
    // Draw player (green box) at fractional position
    const tile = grid[Math.floor(playerRow)][Math.floor(playerCol)];
    drawTile(playerRow, playerCol, tile.color, true, false);
}

// Draw a projectile
function drawProjectile(row, col) {
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

// Handle mouse click
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const { row, col } = screenToGrid(mouseX, mouseY);
    
    // Check if clicked tile is within grid bounds
    if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
        // Move player to clicked position instantly
        playerRow = row;
        playerCol = col;
        playerVelRow = 0;
        playerVelCol = 0;
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
        if (!hoveredTile || hoveredTile.row !== row || hoveredTile.col !== col) {
            hoveredTile = { row, col };
            drawGrid();
        }
    } else {
        canvas.style.cursor = 'default';
        
        // Clear hovered tile if mouse left the grid
        if (hoveredTile) {
            hoveredTile = null;
            drawGrid();
        }
    }
});

// Keyboard input tracking
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    // Shoot projectile with spacebar
    if (e.key === ' ') {
        shootProjectile(Math.floor(playerRow), Math.floor(playerCol));
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

// Shoot a projectile in northeast direction
function shootProjectile(startRow, startCol) {
    // Create a new projectile object with position and velocity
    projectiles.push({
        row: startRow,
        col: startCol,
        velRow: -PROJECTILE_SPEED, // Move up
        velCol: 0
    });
}

// Update game state
function update() {
    const velocityThreshold = 0.01;
    const isMoving = Math.abs(playerVelRow) >= velocityThreshold || Math.abs(playerVelCol) >= velocityThreshold;
    
    // Determine if player is stopped
    if (!isMoving) {
        movementAxis = null;
    }
    
    // Handle input and apply velocity
    let inputApplied = false;
    
    // Only allow movement if stopped or continuing on same axis
    if (keys['ArrowUp'] || keys['ArrowDown']) {
        if (movementAxis === null || movementAxis === 'row') {
            if (keys['ArrowUp']) {
                playerVelRow -= PLAYER_SPEED;
                inputApplied = true;
                movementAxis = 'row';
            }
            if (keys['ArrowDown']) {
                playerVelRow += PLAYER_SPEED;
                inputApplied = true;
                movementAxis = 'row';
            }
        }
    }
    
    if (keys['ArrowLeft'] || keys['ArrowRight']) {
        if (movementAxis === null || movementAxis === 'col') {
            if (keys['ArrowLeft']) {
                playerVelCol -= PLAYER_SPEED;
                inputApplied = true;
                movementAxis = 'col';
            }
            if (keys['ArrowRight']) {
                playerVelCol += PLAYER_SPEED;
                inputApplied = true;
                movementAxis = 'col';
            }
        }
    }
    
    // Apply friction
    playerVelRow *= PLAYER_FRICTION;
    playerVelCol *= PLAYER_FRICTION;
    
    // Update position
    playerRow += playerVelRow;
    playerCol += playerVelCol;
    
    // Clamp to grid boundaries
    playerRow = Math.max(0, Math.min(GRID_ROWS - 1, playerRow));
    playerCol = Math.max(0, Math.min(GRID_COLS - 1, playerCol));
    
    // Snap to grid when stopped and no input
    if (!inputApplied && Math.abs(playerVelRow) < velocityThreshold && Math.abs(playerVelCol) < velocityThreshold) {
        // Snap to nearest grid position
        const targetRow = Math.round(playerRow);
        const targetCol = Math.round(playerCol);
        
        // Smoothly interpolate to grid position
        const snapSpeed = 0.2;
        playerRow += (targetRow - playerRow) * snapSpeed;
        playerCol += (targetCol - playerCol) * snapSpeed;
        
        // If very close, snap exactly
        if (Math.abs(playerRow - targetRow) < 0.01 && Math.abs(playerCol - targetCol) < 0.01) {
            playerRow = targetRow;
            playerCol = targetCol;
            playerVelRow = 0;
            playerVelCol = 0;
        }
    } else {
        // Stop velocity if very small during movement
        if (Math.abs(playerVelRow) < 0.001) playerVelRow = 0;
        if (Math.abs(playerVelCol) < 0.001) playerVelCol = 0;
    }
    
    // Update projectiles
    projectiles.forEach(proj => {
        proj.row += proj.velRow;
        proj.col += proj.velCol;
    });
    
    // Remove projectiles that are off the board
    projectiles = projectiles.filter(proj => 
        proj.row >= 0 && proj.row < GRID_ROWS && 
        proj.col >= 0 && proj.col < GRID_COLS
    );
}

// Game loop
function gameLoop() {
    update();
    drawGrid();
    requestAnimationFrame(gameLoop);
}

// Initialize and start game loop
initGrid();
gameLoop();
