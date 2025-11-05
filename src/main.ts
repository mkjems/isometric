// Main game orchestrator - ties all modules together

import "./styles.css";
import "./audio/musicToggle.ts";
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
import { WebSocketClient } from "./network/websocket-client.ts";

// Check for multiplayer mode (query parameter ?multiplayer=true)
const urlParams = new URLSearchParams(window.location.search);
const MULTIPLAYER_MODE = urlParams.get("multiplayer") === "true";

console.log(`🎮 Starting in ${MULTIPLAYER_MODE ? "MULTIPLAYER" : "SINGLE-PLAYER"} mode`);

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

  // Players - using Map for multiplayer support
  // In single-player, we use player ID 1
  players: new Map([[1, new Player(INITIAL_PLAYER_ROW, INITIAL_PLAYER_COL)]]),
};

// Command processor and command getter
let commandProcessor: ReturnType<typeof initInputHandlers>["processor"];
let getCommands: ReturnType<typeof initInputHandlers>["getCommands"];

// WebSocket client for multiplayer
let wsClient: WebSocketClient | null = null;
let myPlayerNumber: 1 | 2 | null = null;

// Initialize game
function init() {
  gameState.grid = initGrid();

  // Initialize multiplayer if enabled
  if (MULTIPLAYER_MODE) {
    wsClient = new WebSocketClient();

    // Handle game state updates from server
    wsClient.onGameState((serverState) => {
      // Replace local game state with server state
      gameState.players = serverState.players;
      gameState.projectiles = serverState.projectiles;
      gameState.selectedTile = serverState.selectedTile;
    });

    // Handle connection state changes
    wsClient.onConnectionChange((connectionState) => {
      console.log(`Connection: ${connectionState.status} - ${connectionState.message}`);
      myPlayerNumber = connectionState.playerNumber;
      updateConnectionUI(connectionState);
    });

    // Connect to server
    wsClient.connect();
  }

  // Initialize input handlers (pass wsClient for multiplayer)
  const handlers = initInputHandlers(canvas, gameState, wsClient);
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

// Game loop - single player mode
function gameLoopSinglePlayer() {
  // Get commands from this frame
  const commands = getCommands();

  // Process each command
  commands.forEach((command) => {
    commandProcessor.processCommand(command, gameState);
  });

  // Get current input state and update game (for player 1 in single-player)
  const inputState = commandProcessor.getInputState();
  updateGameState(gameState, inputState, 1);

  // Prepare players map for rendering
  const player = gameState.players.get(1)!;
  const playersForRender = new Map([[1, {
    row: player.row,
    col: player.col,
    jumpHeight: player.jumpHeight
  }]]);

  // Render
  drawGrid(
    ctx,
    gameState.grid,
    gameState.hoveredTile,
    gameState.projectiles,
    playersForRender,
    1 // My player number
  );
  drawDebugInfo(ctx, gameState);

  requestAnimationFrame(gameLoopSinglePlayer);
}

// Game loop - multiplayer mode (just renders, state comes from server)
function gameLoopMultiplayer() {
  // In multiplayer, we only render the state received from server
  // No local game logic processing

  // Prepare players map for rendering (convert Player objects to simple data)
  const playersForRender = new Map<number, { row: number; col: number; jumpHeight: number }>();
  for (const [playerId, player] of gameState.players.entries()) {
    playersForRender.set(playerId, {
      row: player.row,
      col: player.col,
      jumpHeight: player.jumpHeight
    });
  }

  drawGrid(
    ctx,
    gameState.grid,
    gameState.hoveredTile,
    gameState.projectiles,
    playersForRender,
    myPlayerNumber // Pass player number for correct coloring
  );
  drawDebugInfo(ctx, gameState);

  requestAnimationFrame(gameLoopMultiplayer);
}

// Update connection UI
function updateConnectionUI(connectionState: any) {
  const statusElement = document.getElementById("connection-status");
  const playerInfoElement = document.getElementById("player-info");

  if (statusElement) {
    statusElement.style.display = "block";

    // Color based on status
    const statusColors: Record<string, string> = {
      connecting: "#FFA500",
      waiting: "#2196F3",
      ready: "#4CAF50",
      disconnected: "#9E9E9E",
      error: "#F44336",
    };

    statusElement.style.color = statusColors[connectionState.status] || "#000";
    statusElement.textContent = connectionState.message;
  }

  if (playerInfoElement && connectionState.playerNumber) {
    playerInfoElement.style.display = "block";
    playerInfoElement.textContent = `You are Player ${connectionState.playerNumber}`;
    playerInfoElement.style.color = connectionState.playerNumber === 1 ? "#4CAF50" : "#2196F3";
  }
}

// Start the game
init();

if (MULTIPLAYER_MODE) {
  gameLoopMultiplayer();
} else {
  gameLoopSinglePlayer();
}

// Expose test API for Playwright (only in development mode)
if (import.meta.env.DEV) {
  (window as any).__gameTestAPI = {
    getPlayerPosition: () => {
      const player = gameState.players.get(1); // Get player 1 for tests
      return player ? { row: player.row, col: player.col } : null;
    },
    getPlayerGridPosition: () => {
      const player = gameState.players.get(1);
      return player ? player.getGridPosition() : null;
    },
    getPlayerJumpHeight: () => {
      const player = gameState.players.get(1);
      return player ? player.jumpHeight : 0;
    },
    getPlayerVelocity: () => {
      const player = gameState.players.get(1);
      return player ? { velRow: player.velRow, velCol: player.velCol } : null;
    },
    isPlayerOnGround: () => {
      const player = gameState.players.get(1);
      return player ? player.isOnGround() : true;
    },
    getGameState: () => ({
      gridSize: gameState.grid.length,
      hoveredTile: gameState.hoveredTile,
      selectedTile: gameState.selectedTile,
      projectileCount: gameState.projectiles.length,
    }),
    getCanvas: () => canvas,
    getContext: () => ctx,
  };
}
