// Server-side authoritative game loop running at 60 FPS

import type { GameCommand } from "../src/types.ts";
import type { GameSessionManager } from "./game-session.ts";
import { CommandProcessor } from "../shared/command-processor.ts";
import { updateGameState } from "../shared/game-logic.ts";

const TICK_RATE = 60; // 60 FPS
const TICK_INTERVAL = 1000 / TICK_RATE; // ~16.67ms

export class GameLoop {
    private sessionManager: GameSessionManager;
    private commandProcessor: CommandProcessor;
    private running = false;
    private intervalId: number | null = null;
    private commandQueue: Array<{ playerId: number; command: GameCommand }> = [];

    constructor(sessionManager: GameSessionManager) {
        this.sessionManager = sessionManager;
        this.commandProcessor = new CommandProcessor();
        console.log(`🔄 GameLoop initialized (${TICK_RATE} FPS)`);
    }

    /**
     * Add a command to the queue to be processed on next tick
     */
    queueCommand(playerId: number, command: GameCommand): void {
        this.commandQueue.push({ playerId, command });
    }

    /**
     * Start the game loop
     */
    start(): void {
        if (this.running) {
            console.log("⚠️ GameLoop already running");
            return;
        }

        this.running = true;
        console.log("▶️ GameLoop started");

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

        // Process all queued commands for this tick
        while (this.commandQueue.length > 0) {
            const { playerId, command } = this.commandQueue.shift()!;

            // TODO: In full multiplayer, we'd have separate command processors
            // for each player. For now, using shared processor for single player.
            this.commandProcessor.processCommand(command, session.gameState);
        }

        // Get current input state and update game physics
        const inputState = this.commandProcessor.getInputState();
        updateGameState(session.gameState, inputState);

        // Increment tick counter
        session.tickCounter++;

        // Broadcast game state to all connected players
        this.sessionManager.broadcast({
            type: "gameState",
            tick: session.tickCounter,
            state: session.gameState,
        });
    }

    /**
     * Check if the loop is running
     */
    isRunning(): boolean {
        return this.running;
    }
}
