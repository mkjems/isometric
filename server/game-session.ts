// Game session manager - handles multiplayer game room with 2 players

import type { GameState } from "../src/types.ts";
import type { GameSession, PlayerConnection, ServerMessage } from "./types.ts";
import { Player } from "../src/game/player.ts";
import { initGrid } from "../src/game/grid.ts";
import {
    INITIAL_PLAYER_ROW,
    INITIAL_PLAYER_COL,
} from "../src/utils/constants.ts";

export class GameSessionManager {
    private session: GameSession | null = null;
    private nextPlayerId = 1;

    constructor() {
        console.log("🎮 GameSessionManager initialized");
    }

    /**
     * Add a new player to the session
     */
    addPlayer(socket: WebSocket): PlayerConnection | null {
        console.log("📋 addPlayer() called");

        // Create session if it doesn't exist
        if (!this.session) {
            console.log("  → Creating new session");
            this.session = this.createNewSession();
        }

        // Check if session is full (max 2 players)
        if (this.session.players.size >= 2) {
            console.log("  ❌ Session full, rejecting new player");
            return null;
        }

        const playerId = this.nextPlayerId++;
        const playerNumber = (this.session.players.size + 1) as 1 | 2;

        console.log(`  → Creating connection for Player ${playerId} (Player ${playerNumber})`);

        const connection: PlayerConnection = {
            id: playerId,
            socket,
            playerNumber,
            connected: true,
        };

        this.session.players.set(playerId, connection);

        console.log(
            `  ✅ Player ${playerId} added as Player ${playerNumber} (${this.session.players.size}/2 players in session)`
        );

        // Note: Initial messages (playerAssignment, waitingForPlayer) are sent
        // by WebSocketHandler.onopen to ensure socket is ready

        return connection;
    }

    /**
     * Remove a player from the session
     */
    removePlayer(playerId: number): void {
        if (!this.session) return;

        const player = this.session.players.get(playerId);
        if (!player) return;

        player.connected = false;
        this.session.players.delete(playerId);

        console.log(
            `👋 Player ${playerId} disconnected (${this.session.players.size}/2 remaining)`
        );

        // Notify remaining player
        this.broadcast({
            type: "playerDisconnected",
            playerId,
            message: `Player ${playerId} disconnected`,
        });

        // Reset session if empty
        if (this.session.players.size === 0) {
            console.log("🔄 All players disconnected, resetting session");
            this.session = null;
        }
    }

    /**
     * Get the current game session
     */
    getSession(): GameSession | null {
        return this.session;
    }

    /**
     * Send message to a specific player
     */
    sendToPlayer(playerId: number, message: ServerMessage): void {
        console.log(`📤 sendToPlayer(${playerId}, ${message.type})`);

        if (!this.session) {
            console.log("  ⚠️ No session exists");
            return;
        }

        const player = this.session.players.get(playerId);
        if (!player) {
            console.log(`  ⚠️ Player ${playerId} not found in session`);
            return;
        }

        if (!player.connected) {
            console.log(`  ⚠️ Player ${playerId} is marked as disconnected`);
            return;
        }

        console.log(`  → Socket readyState: ${player.socket.readyState} (0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED)`);

        try {
            // Check if socket is open before sending
            if (player.socket.readyState === WebSocket.OPEN) {
                player.socket.send(JSON.stringify(message));
                console.log(`  ✅ Message sent to player ${playerId}`);
            } else {
                console.log(`  ⏳ Socket not ready for player ${playerId}, readyState=${player.socket.readyState}`);
            }
        } catch (error) {
            console.error(`  ❌ Error sending to player ${playerId}:`, error);
        }
    }

    /**
     * Broadcast message to all connected players
     */
    broadcast(message: ServerMessage): void {
        console.log(`📢 broadcast(${message.type}) to ${this.session?.players.size || 0} players`);

        if (!this.session) {
            console.log("  ⚠️ No session exists");
            return;
        }

        let sentCount = 0;
        for (const player of this.session.players.values()) {
            if (player.connected) {
                try {
                    if (player.socket.readyState === WebSocket.OPEN) {
                        player.socket.send(JSON.stringify(message));
                        sentCount++;
                        console.log(`  ✅ Sent to player ${player.id}`);
                    } else {
                        console.log(`  ⏳ Player ${player.id} socket not ready (state=${player.socket.readyState})`);
                    }
                } catch (error) {
                    console.error(`  ❌ Error broadcasting to player ${player.id}:`, error);
                }
            }
        }
        console.log(`  📊 Broadcast complete: ${sentCount}/${this.session.players.size} messages sent`);
    }

    /**
     * Create a new game session
     */
    private createNewSession(): GameSession {
        console.log("🆕 Creating new game session");

        // Create players map with two players at different starting positions
        const players = new Map<number, Player>();
        players.set(1, new Player(INITIAL_PLAYER_ROW - 3, INITIAL_PLAYER_COL - 3)); // Player 1 (top-left)
        players.set(2, new Player(INITIAL_PLAYER_ROW + 3, INITIAL_PLAYER_COL + 3)); // Player 2 (bottom-right)

        console.log(`  → Player 1 spawned at (${INITIAL_PLAYER_ROW - 3}, ${INITIAL_PLAYER_COL - 3})`);
        console.log(`  → Player 2 spawned at (${INITIAL_PLAYER_ROW + 3}, ${INITIAL_PLAYER_COL + 3})`);

        const gameState: GameState = {
            grid: initGrid(),
            selectedTile: null,
            hoveredTile: null,
            projectiles: [],
            players: players,
        };

        return {
            id: crypto.randomUUID(),
            players: new Map(),
            gameState,
            tickCounter: 0,
            started: false,
        };
    }

    /**
     * Start the game when both players are connected
     */
    startGame(): void {
        console.log("🎮 startGame() called");

        if (!this.session) {
            console.log("  ⚠️ No session exists");
            return;
        }

        this.session.started = true;
        console.log(`  ✅ Game started! Players in session: ${this.session.players.size}`);

        this.broadcast({
            type: "gameStart",
            message: "Game starting! Both players connected.",
        });
    }

    /**
     * Check if the session has 2 players and is started
     */
    isGameActive(): boolean {
        return this.session !== null && this.session.started;
    }
}
