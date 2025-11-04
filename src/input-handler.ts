// Input handling for keyboard and mouse events
// Now emits commands instead of directly manipulating state

import { GRID_ROWS, GRID_COLS } from "./constants.js";
import { screenToGrid } from "./grid.js";
import { playJumpSound, playPhaserSound } from "./sound-effects.js";
import type { GameCommand, GameState } from "./types.js";
import { CommandProcessor } from "../shared/command-processor.js";

// Command processor instance
const commandProcessor = new CommandProcessor();

// Command queue for this frame
const commandQueue: GameCommand[] = [];

/**
 * Initialize input handlers for the game
 * Returns the command processor and a function to get queued commands
 * @param {HTMLCanvasElement} canvas - The game canvas
 * @param {Object} gameState - The game state object
 * @returns {Object} Command processor and command getter
 */
export function initInputHandlers(
    canvas: HTMLCanvasElement,
    gameState: GameState
): {
    processor: CommandProcessor;
    getCommands: () => GameCommand[];
} {
    // Track which keys are currently pressed (for continuous movement)
    const pressedKeys = new Set<string>();

    // Keyboard input tracking
    document.addEventListener("keydown", (e: KeyboardEvent) => {
        // Prevent duplicate events while key is held
        if (pressedKeys.has(e.key)) {
            return;
        }
        pressedKeys.add(e.key);

        // Convert key to command
        const command = keyToCommand(e.key, true);
        if (command) {
            commandQueue.push(command);

            // Immediate action commands (non-movement)
            if (command.type === "JUMP") {
                playJumpSound();
                e.preventDefault();
            } else if (command.type === "SHOOT") {
                playPhaserSound();
                e.preventDefault();
            }
        }

        // Prevent arrow key scrolling
        if (
            ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
        ) {
            e.preventDefault();
        }
    });

    document.addEventListener("keyup", (e: KeyboardEvent) => {
        pressedKeys.delete(e.key);

        // Send stop movement command
        const command = keyToCommand(e.key, false);
        if (command) {
            commandQueue.push(command);
        }
    });

    // Handle mouse click for teleport
    canvas.addEventListener("click", (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const { row, col } = screenToGrid(mouseX, mouseY);

        // Check if clicked tile is within grid bounds
        if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
            commandQueue.push({ type: "TELEPORT", row, col });
        }
    });

    // Handle mouse move for hover effect
    canvas.addEventListener("mousemove", (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const { row, col } = screenToGrid(mouseX, mouseY);

        // Check if over valid tile
        if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
            canvas.style.cursor = "pointer";

            // Update hovered tile if it changed
            if (
                !gameState.hoveredTile ||
                gameState.hoveredTile.row !== row ||
                gameState.hoveredTile.col !== col
            ) {
                gameState.hoveredTile = { row, col };
            }
        } else {
            canvas.style.cursor = "default";

            // Clear hovered tile if mouse left the grid
            if (gameState.hoveredTile) {
                gameState.hoveredTile = null;
            }
        }
    });

    return {
        processor: commandProcessor,
        getCommands: () => {
            const commands = [...commandQueue];
            commandQueue.length = 0; // Clear queue
            return commands;
        },
    };
}

/**
 * Convert keyboard key to game command
 * @param key The keyboard key
 * @param pressed Whether key was pressed (true) or released (false)
 * @returns GameCommand or null if key doesn't map to a command
 */
function keyToCommand(key: string, pressed: boolean): GameCommand | null {
    // Movement keys
    if (key === "ArrowUp" || key === "w" || key === "W") {
        return pressed
            ? { type: "MOVE", direction: "up", pressed: true }
            : { type: "STOP_MOVE", direction: "up" };
    }
    if (key === "ArrowDown" || key === "s" || key === "S") {
        return pressed
            ? { type: "MOVE", direction: "down", pressed: true }
            : { type: "STOP_MOVE", direction: "down" };
    }
    if (key === "ArrowLeft" || key === "a" || key === "A") {
        return pressed
            ? { type: "MOVE", direction: "left", pressed: true }
            : { type: "STOP_MOVE", direction: "left" };
    }
    if (key === "ArrowRight" || key === "d" || key === "D") {
        return pressed
            ? { type: "MOVE", direction: "right", pressed: true }
            : { type: "STOP_MOVE", direction: "right" };
    }

    // Action keys (only on press, not release)
    if (pressed) {
        if (key === " ") {
            return { type: "SHOOT" };
        }
        if (key === "x" || key === "X") {
            return { type: "JUMP" };
        }
    }

    return null;
}

