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
        console.log("\n" + "=".repeat(60));
        console.log("🔌 handleConnection() - New WebSocket connection attempt");
        console.log("=".repeat(60));

        // Add player to session
        const connection = this.sessionManager.addPlayer(socket);

        if (!connection) {
            console.log("❌ Connection rejected - session full");
            socket.close(1000, "Game session is full");
            return;
        }

        const playerId = connection.id;
        const playerNumber = connection.playerNumber;
        console.log(`✅ Connection accepted: Player ${playerId} (Player ${playerNumber})`);

        // Wait for socket to open before sending messages
        socket.onopen = () => {
            console.log(`\n🟢 socket.onopen fired for Player ${playerId}`);
            console.log(`   Socket readyState: ${socket.readyState}`);

            // Send player assignment
            console.log(`   → Sending playerAssignment to Player ${playerId}`);
            this.sessionManager.sendToPlayer(playerId, {
                type: "playerAssignment",
                playerId,
                playerNumber,
            });

            // Check if we have 2 players
            const session = this.sessionManager.getSession();
            console.log(`   Current session status: ${session?.players.size || 0}/2 players`);

            if (session && session.players.size === 2) {
                console.log(`   → Both players connected! Starting game...`);
                this.sessionManager.startGame();

                // Start the game loop now that game is active
                if (!this.gameLoop.isRunning()) {
                    console.log(`▶️ Starting game loop...`);
                    this.gameLoop.start();
                }
            } else {
                console.log(`   → Waiting for second player...`);
                this.sessionManager.sendToPlayer(playerId, {
                    type: "waitingForPlayer",
                    message: "Waiting for second player to join...",
                });
            }
        };

        console.log(`📝 Event handlers registered for Player ${playerId}`);
        console.log(`   Game loop running: ${this.gameLoop.isRunning()}`);
        console.log(`   Game active: ${this.sessionManager.isGameActive()}`);

        // Handle incoming messages
        socket.onmessage = (event) => {
            console.log(`📨 Message from Player ${playerId}: ${event.data.substring(0, 100)}...`);
            try {
                const message: ClientMessage = JSON.parse(event.data);
                this.handleMessage(playerId, message);
            } catch (error) {
                console.error(`❌ Error parsing message from player ${playerId}:`, error);
            }
        };

        // Handle disconnection
        socket.onclose = () => {
            console.log(`\n� socket.onclose - Player ${playerId} WebSocket closed`);
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
        console.log(`💬 handleMessage from Player ${playerId}: type=${message.type}`);

        switch (message.type) {
            case "command":
                console.log(`   → Queueing command: ${message.command.type}`);
                this.gameLoop.queueCommand(playerId, message.command);
                break;

            case "ping":
                console.log(`   → Responding with pong`);
                this.sessionManager.sendToPlayer(playerId, { type: "pong" });
                break;

            default:
                console.warn(`   ⚠️ Unknown message type:`, message);
        }
    }
}
