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
            const isSelected = selectedTile && 
                              selectedTile.row === row && 
                              selectedTile.col === col;
            const isHovered = hoveredTile &&
                             hoveredTile.row === row &&
                             hoveredTile.col === col &&
                             !isSelected;
            // Draw tiles without the green box first
            drawTile(row, col, tile.color, false, isHovered);
        }
    }
    
    // Draw projectiles
    projectiles.forEach(proj => {
        drawProjectile(proj.row, proj.col);
    });
    
    // Draw selected tile (green box) last so it's always on top
    if (selectedTile) {
        const tile = grid[selectedTile.row][selectedTile.col];
        drawTile(selectedTile.row, selectedTile.col, tile.color, true, false);
    }
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
        selectedTile = { row, col };
        drawGrid();
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

// Handle arrow key navigation
document.addEventListener('keydown', (e) => {
    if (!selectedTile) return;
    
    let newRow = selectedTile.row;
    let newCol = selectedTile.col;
    
    switch(e.key) {
        case 'ArrowUp':
            newRow--;
            e.preventDefault();
            break;
        case 'ArrowDown':
            newRow++;
            e.preventDefault();
            break;
        case 'ArrowLeft':
            newCol--;
            e.preventDefault();
            break;
        case 'ArrowRight':
            newCol++;
            e.preventDefault();
            break;
        case ' ':
            // Shoot projectile in northeast direction (row decreases, col increases)
            shootProjectile(selectedTile.row, selectedTile.col);
            e.preventDefault();
            return;
        default:
            return;
    }
    
    // Check if new position is within grid bounds
    if (newRow >= 0 && newRow < GRID_ROWS && newCol >= 0 && newCol < GRID_COLS) {
        selectedTile = { row: newRow, col: newCol };
        drawGrid();
    }
});

// Shoot a projectile in northeast direction
function shootProjectile(startRow, startCol) {
    let row = startRow - 1; // Move up (same as arrow up)
    let col = startCol;
    
    const animateProjectile = () => {
        // Check if projectile is still on the board
        if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
            projectiles = [{ row, col }]; // Only show current projectile position
            drawGrid();
            
            // Move to next position along the grid line
            row--;
            
            setTimeout(animateProjectile, 100); // Move every 100ms
        } else {
            // Projectile went off board
            projectiles = [];
            drawGrid();
        }
    };
    
    animateProjectile();
}

// Initialize and render
initGrid();
drawGrid();
