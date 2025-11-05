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
import type { GameState } from "./types.ts";
import { WebSocketClient } from "./network/websocket-client.ts";

console.log("🎮 Starting MULTIPLAYER mode");

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

// WebSocket client for multiplayer
let wsClient: WebSocketClient | null = null;
let myPlayerNumber: 1 | 2 | null = null;

// Initialize game
function init() {
  gameState.grid = initGrid();

  // Initialize WebSocket client for multiplayer
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

  // Initialize input handlers (pass wsClient for multiplayer)
  initInputHandlers(canvas, gameState, wsClient);
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
gameLoopMultiplayer();

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
