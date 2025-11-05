// WebSocket handler for player connections

import type { ClientMessage } from "./types.ts";
import type { GameSessionManager } from "./game-session.ts";
import type { GameLoop } from "./game-loop.ts";

export class WebSocketHandler {
    private sessionManager: GameSessionManager;
    private gameLoop: GameLoop;

    constructor(sessionManager: GameSessionManager, gameLoop: GameLoop) {
        this.sessionManager = sessionManager;
        this.gameLoop = gameLoop;
    }

    /**
     * Handle a new WebSocket connection
     */
    handleConnection(socket: WebSocket): void {
        console.log("🔌 New WebSocket connection attempt");

        // Add player to session
        const connection = this.sessionManager.addPlayer(socket);

        if (!connection) {
            console.log("❌ Failed to add player (session full)");
            socket.close(1000, "Game session is full");
            return;
        }

        const playerId = connection.id;

        // Start game loop if not already running
        if (!this.gameLoop.isRunning() && this.sessionManager.isGameActive()) {
            this.gameLoop.start();
        }

        // Handle incoming messages
        socket.onmessage = (event) => {
            try {
                const message: ClientMessage = JSON.parse(event.data);
                this.handleMessage(playerId, message);
            } catch (error) {
                console.error(`Error parsing message from player ${playerId}:`, error);
            }
        };

        // Handle disconnection
        socket.onclose = () => {
            console.log(`🔌 Player ${playerId} WebSocket closed`);
            this.sessionManager.removePlayer(playerId);

            // Stop game loop if no players remain
            if (!this.sessionManager.getSession()) {
                this.gameLoop.stop();
            }
        };

        // Handle errors
        socket.onerror = (error) => {
            console.error(`❌ WebSocket error for player ${playerId}:`, error);
        };
    }

    /**
     * Handle messages from a player
     */
    private handleMessage(playerId: number, message: ClientMessage): void {
        switch (message.type) {
            case "command":
                // Queue the command for processing on next game tick
                this.gameLoop.queueCommand(playerId, message.command);
                break;

            case "ping":
                // Respond to ping with pong
                this.sessionManager.sendToPlayer(playerId, { type: "pong" });
                break;

            default:
                console.warn(`Unknown message type from player ${playerId}:`, message);
        }
    }
}
