// Main game orchestrator - ties all modules together

import "./styles.css";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  INITIAL_PLAYER_ROW,
  INITIAL_PLAYER_COL,
} from "./utils/constants.ts";
import { initGrid } from "./game/grid.ts";
import { drawGrid } from "./rendering/renderer.ts";
import { initInputHandlers } from "./utils/input-handler.ts";
import { Player } from "./game/player.ts";
import { drawDebugInfo, toggleDebug } from "./game/debug.ts";
import type { GameState } from "./types.ts";
import { updateGameState } from "../shared/game-logic.js";

// Get canvas and context
const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// Game state - central object holding all mutable state
const gameState: GameState = {
  grid: [],
  selectedTile: null,
  hoveredTile: null,
  projectiles: [],

  // Player - now using Player class
  player: new Player(INITIAL_PLAYER_ROW, INITIAL_PLAYER_COL),
};

// Command processor and command getter
let commandProcessor: ReturnType<typeof initInputHandlers>["processor"];
let getCommands: ReturnType<typeof initInputHandlers>["getCommands"];

// Initialize game
function init() {
  gameState.grid = initGrid();
  const handlers = initInputHandlers(canvas, gameState);
  commandProcessor = handlers.processor;
  getCommands = handlers.getCommands;

  // Add debug toggle listener (press 'D' key)
  document.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "d" || e.key === "D") {
      const enabled = toggleDebug();
      console.log(`Debug mode: ${enabled ? "ON" : "OFF"}`);
    }
  });
}

// Game loop
function gameLoop() {
  // Get commands from this frame
  const commands = getCommands();

  // Process each command
  commands.forEach((command) => {
    commandProcessor.processCommand(command, gameState);
  });

  // Get current input state and update game
  const inputState = commandProcessor.getInputState();
  updateGameState(gameState, inputState);

  // Render
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
