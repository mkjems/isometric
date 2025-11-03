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
let playerJumpHeight = 0; // Current jump height
let playerJumpVelocity = 0; // Vertical jump velocity

// Game settings
const PLAYER_SPEED = 0.15;
const PLAYER_FRICTION = 0.85;
const PROJECTILE_SPEED = 0.5;
const JUMP_STRENGTH = 20;
const GRAVITY = 0.7;

// Audio context for sound effects
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Function to play "wheeeeeeee" sound
function playJumpSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Start high and sweep down for "wheeeee" effect
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.5);
    
    // Volume envelope - fade in and out
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.4);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.6);
    
    oscillator.type = 'sine';
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.6);
}

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
    
    // Draw shadow if player is jumping
    if (playerJumpHeight > 0) {
        drawShadow(playerRow, playerCol);
    }
    
    // Draw player (green box) at fractional position with jump offset
    const tile = grid[Math.floor(playerRow)][Math.floor(playerCol)];
    drawTileWithJump(playerRow, playerCol, tile.color, true, false, playerJumpHeight);
}

// Draw a shadow under the player when jumping
function drawShadow(row, col) {
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
function drawTileWithJump(row, col, color, highlight = false, hover = false, jumpHeight = 0) {
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
    
    // Jump with x key
    if (e.key === 'x' || e.key === 'X') {
        if (playerJumpHeight === 0 && playerJumpVelocity === 0) {
            playerJumpVelocity = JUMP_STRENGTH;
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
    const velocityThreshold = 0.005;
    
    // Determine current movement state
    const hasRowVelocity = Math.abs(playerVelRow) >= velocityThreshold;
    const hasColVelocity = Math.abs(playerVelCol) >= velocityThreshold;
    const isMoving = hasRowVelocity || hasColVelocity;
    
    // Update movement axis based on current velocity
    if (!isMoving) {
        movementAxis = null;
    } else if (hasRowVelocity) {
        movementAxis = 'row';
    } else if (hasColVelocity) {
        movementAxis = 'col';
    }
    
    // Check what direction is being requested
    let newAxisRequested = null;
    if (keys['ArrowUp'] || keys['ArrowDown']) {
        newAxisRequested = 'row';
    } else if (keys['ArrowLeft'] || keys['ArrowRight']) {
        newAxisRequested = 'col';
    }
    
    // Check if player is on the ground
    const isOnGround = playerJumpHeight === 0;
    
    // Handle direction change (even when coasting with kinetic energy)
    // Only allow direction change when on the ground
    if (newAxisRequested && movementAxis && newAxisRequested !== movementAxis && isOnGround) {
        // Calculate total kinetic energy (speed)
        const currentSpeed = Math.sqrt(playerVelRow * playerVelRow + playerVelCol * playerVelCol);
        
        // Snap position to grid on the OLD axis (the one we're leaving)
        if (movementAxis === 'row') {
            playerRow = Math.round(playerRow);
            playerVelRow = 0;
        } else {
            playerCol = Math.round(playerCol);
            playerVelCol = 0;
        }
        
        // Switch to new axis
        movementAxis = newAxisRequested;
        
        // Apply the speed to the new axis based on requested direction
        if (newAxisRequested === 'row') {
            if (keys['ArrowUp']) {
                playerVelRow = -currentSpeed;
            } else if (keys['ArrowDown']) {
                playerVelRow = currentSpeed;
            }
        } else {
            if (keys['ArrowLeft']) {
                playerVelCol = -currentSpeed;
            } else if (keys['ArrowRight']) {
                playerVelCol = currentSpeed;
            }
        }
    }
    
    // Apply input acceleration (only on current axis or when stopped)
    // Only allow acceleration/braking when on the ground
    if (isOnGround) {
        if (movementAxis === null || movementAxis === 'row') {
            if (keys['ArrowUp']) {
                playerVelRow -= PLAYER_SPEED;
                movementAxis = 'row';
                // Ensure no column velocity
                playerVelCol = 0;
            } else if (keys['ArrowDown']) {
                playerVelRow += PLAYER_SPEED;
                movementAxis = 'row';
                // Ensure no column velocity
                playerVelCol = 0;
            }
        }
        
        if (movementAxis === null || movementAxis === 'col') {
            if (keys['ArrowLeft']) {
                playerVelCol -= PLAYER_SPEED;
                movementAxis = 'col';
                // Ensure no row velocity
                playerVelRow = 0;
            } else if (keys['ArrowRight']) {
                playerVelCol += PLAYER_SPEED;
                movementAxis = 'col';
                // Ensure no row velocity
                playerVelRow = 0;
            }
        }
    }
    
    // Apply friction only to the active axis and only when on the ground
    if (isOnGround) {
        if (movementAxis === 'row') {
            playerVelRow *= PLAYER_FRICTION;
            playerVelCol = 0; // Ensure other axis is zero
        } else if (movementAxis === 'col') {
            playerVelCol *= PLAYER_FRICTION;
            playerVelRow = 0; // Ensure other axis is zero
        }
    } else {
        // In the air - no friction, maintain momentum
        // Just ensure one axis is zero
        if (movementAxis === 'row') {
            playerVelCol = 0;
        } else if (movementAxis === 'col') {
            playerVelRow = 0;
        }
    }
    
    // Update position
    playerRow += playerVelRow;
    playerCol += playerVelCol;
    
    // Clamp to grid boundaries
    playerRow = Math.max(0, Math.min(GRID_ROWS - 1, playerRow));
    playerCol = Math.max(0, Math.min(GRID_COLS - 1, playerCol));
    
    // Stop velocity if very small
    if (Math.abs(playerVelRow) < velocityThreshold) playerVelRow = 0;
    if (Math.abs(playerVelCol) < velocityThreshold) playerVelCol = 0;
    
    // Snap to grid when completely stopped
    if (playerVelRow === 0 && playerVelCol === 0) {
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
        }
    }
    
    // Update jump physics
    if (playerJumpHeight > 0 || playerJumpVelocity !== 0) {
        playerJumpVelocity -= GRAVITY;
        playerJumpHeight += playerJumpVelocity;
        
        // Land on ground
        if (playerJumpHeight <= 0) {
            playerJumpHeight = 0;
            playerJumpVelocity = 0;
        }
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
