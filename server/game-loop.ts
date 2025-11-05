// Server-side authoritative game loop running at 60 FPS

import type { GameCommand } from "../src/types.ts";
import type { GameSessionManager } from "./game-session.ts";
import { CommandProcessor } from "../shared/command-processor.ts";
import { updateGameState } from "../shared/game-logic.ts";

const TICK_RATE = 60; // 60 FPS
const TICK_INTERVAL = 1000 / TICK_RATE; // ~16.67ms

export class GameLoop {
    private sessionManager: GameSessionManager;
    private commandProcessors: Map<number, CommandProcessor>; // One processor per player
    private running = false;
    private intervalId: number | null = null;
    private commandQueue: Array<{ playerId: number; command: GameCommand }> = [];

    constructor(sessionManager: GameSessionManager) {
        this.sessionManager = sessionManager;
        this.commandProcessors = new Map();
        // Initialize processors for both players with their respective IDs
        this.commandProcessors.set(1, new CommandProcessor(1));
        this.commandProcessors.set(2, new CommandProcessor(2));
        console.log(`🔄 GameLoop initialized (${TICK_RATE} FPS) with 2 command processors`);
    }

    /**
     * Add a command to the queue to be processed on next tick
     */
    queueCommand(playerId: number, command: GameCommand): void {
        console.log(`⚡ queueCommand: Player ${playerId} - ${command.type}`);
        this.commandQueue.push({ playerId, command });
        console.log(`   Queue length: ${this.commandQueue.length}`);
    }

    /**
     * Start the game loop
     */
    start(): void {
        if (this.running) {
            console.log("⚠️ GameLoop.start() called but already running");
            return;
        }

        this.running = true;
        console.log(`▶️ GameLoop.start() - Starting at ${TICK_RATE} FPS (${TICK_INTERVAL}ms per tick)`);

        // Use setInterval for server-side game loop
        this.intervalId = setInterval(() => {
            this.tick();
        }, TICK_INTERVAL);
    }

    /**
     * Stop the game loop
     */
    stop(): void {
        if (!this.running) return;

        this.running = false;

        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        console.log("⏸️ GameLoop stopped");
    }

    /**
     * Single game tick - processes all commands and updates state
     */
    private tick(): void {
        const session = this.sessionManager.getSession();

        // Only run if we have an active game
        if (!session || !this.sessionManager.isGameActive()) {
            return;
        }

        // Log first few ticks for debugging
        if (session.tickCounter < 3) {
            console.log(`🔄 Tick ${session.tickCounter + 1}: Processing ${this.commandQueue.length} commands`);
        }

        // Process all queued commands for this tick
        while (this.commandQueue.length > 0) {
            const { playerId, command } = this.commandQueue.shift()!;

            // Get the processor for this player
            const processor = this.commandProcessors.get(playerId);
            if (processor) {
                // Process command for this specific player's state
                processor.processCommand(command, session.gameState);
            }
        }

        // Update each player's physics using their own processor's input state
        for (const [playerId, processor] of this.commandProcessors.entries()) {
            const inputState = processor.getInputState();
            updateGameState(session.gameState, inputState, playerId);
        }

        // Increment tick counter
        session.tickCounter++;

        // Convert players Map to a plain object for JSON serialization
        const playersObject: Record<number, any> = {};
        for (const [playerId, player] of session.gameState.players.entries()) {
            playersObject[playerId] = {
                row: player.row,
                col: player.col,
                velRow: player.velRow,
                velCol: player.velCol,
                movementAxis: player.movementAxis,
                jumpHeight: player.jumpHeight,
                jumpVelocity: player.jumpVelocity,
            };
        }

        // Broadcast game state to all connected players
        this.sessionManager.broadcast({
            type: "gameState",
            tick: session.tickCounter,
            state: {
                grid: session.gameState.grid,
                selectedTile: session.gameState.selectedTile,
                hoveredTile: session.gameState.hoveredTile,
                projectiles: session.gameState.projectiles,
                players: playersObject as any, // Will be deserialized on client
            },
        });
    }

    /**
     * Check if the loop is running
     */
    isRunning(): boolean {
        return this.running;
    }
}
