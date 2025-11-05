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
        // Create session if it doesn't exist
        if (!this.session) {
            this.session = this.createNewSession();
        }

        // Check if session is full (max 2 players)
        if (this.session.players.size >= 2) {
            return null;
        }

        const playerId = this.nextPlayerId++;
        const playerNumber = (this.session.players.size + 1) as 1 | 2;

        const connection: PlayerConnection = {
            id: playerId,
            socket,
            playerNumber,
            connected: true,
        };

        this.session.players.set(playerId, connection);
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

        // Notify remaining player
        this.broadcast({
            type: "playerDisconnected",
            playerId,
            message: `Player ${playerId} disconnected`,
        });

        // Reset session if empty
        if (this.session.players.size === 0) {
            console.log("🔄 Session reset - all players disconnected");
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
        if (!this.session) return;

        const player = this.session.players.get(playerId);
        if (!player || !player.connected) return;

        try {
            if (player.socket.readyState === WebSocket.OPEN) {
                player.socket.send(JSON.stringify(message));
            }
        } catch (error) {
            console.error(`❌ Error sending to player ${playerId}:`, error);
        }
    }

    /**
     * Broadcast message to all connected players
     */
    broadcast(message: ServerMessage): void {
        if (!this.session) return;

        for (const player of this.session.players.values()) {
            if (player.connected && player.socket.readyState === WebSocket.OPEN) {
                try {
                    player.socket.send(JSON.stringify(message));
                } catch (error) {
                    console.error(`❌ Error broadcasting to player ${player.id}:`, error);
                }
            }
        }
    }

    /**
     * Create a new game session
     */
    private createNewSession(): GameSession {
        // Create players map with two players at different starting positions
        const players = new Map<number, Player>();
        players.set(1, new Player(INITIAL_PLAYER_ROW - 3, INITIAL_PLAYER_COL - 3)); // Player 1 (top-left)
        players.set(2, new Player(INITIAL_PLAYER_ROW + 3, INITIAL_PLAYER_COL + 3)); // Player 2 (bottom-right)

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
        if (!this.session) return;

        this.session.started = true;

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
