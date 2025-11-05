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
        // Add player to session
        const connection = this.sessionManager.addPlayer(socket);

        if (!connection) {
            console.log("❌ Session full - connection rejected");
            socket.close(1000, "Game session is full");
            return;
        }

        const playerId = connection.id;
        const playerNumber = connection.playerNumber;
        console.log(`✅ Player ${playerNumber} connected (ID: ${playerId})`);

        // Wait for socket to open before sending messages
        socket.onopen = () => {
            // Send player assignment
            this.sessionManager.sendToPlayer(playerId, {
                type: "playerAssignment",
                playerId,
                playerNumber,
            });

            // Check if we have 2 players
            const session = this.sessionManager.getSession();

            if (session && session.players.size === 2) {
                console.log(`🎮 Both players ready - game starting!`);
                this.sessionManager.startGame();

                // Start the game loop now that game is active
                if (!this.gameLoop.isRunning()) {
                    this.gameLoop.start();
                }
            } else {
                this.sessionManager.sendToPlayer(playerId, {
                    type: "waitingForPlayer",
                    message: "Waiting for second player to join...",
                });
            }
        };

        // Handle incoming messages
        socket.onmessage = (event) => {
            try {
                const message: ClientMessage = JSON.parse(event.data);
                this.handleMessage(playerId, message);
            } catch (error) {
                console.error(`❌ Error parsing message from player ${playerId}:`, error);
            }
        };

        // Handle disconnection
        socket.onclose = () => {
            console.log(`👋 Player ${playerNumber} disconnected`);
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
                this.gameLoop.queueCommand(playerId, message.command);
                break;

            case "ping":
                this.sessionManager.sendToPlayer(playerId, { type: "pong" });
                break;

            default:
                console.warn(`⚠️ Unknown message type from player ${playerId}:`, message);
        }
    }
}
