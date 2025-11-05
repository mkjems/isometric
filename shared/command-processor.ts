// Command processor - converts commands to input state and processes game actions
// This is shared code that runs on both client and server

import type { GameCommand, InputState, GameState } from "../src/types.js";
import {
    JUMP_STRENGTH,
    PROJECTILE_SPEED,
    GRID_ROWS,
    GRID_COLS,
} from "../src/utils/constants.ts";

/**
 * Maintains input state based on commands
 */
export class CommandProcessor {
    private inputState: InputState = {
        up: false,
        down: false,
        left: false,
        right: false,
    };

    private playerId: number; // Which player this processor is for

    constructor(playerId: number = 1) {
        this.playerId = playerId;
    }

    /**
     * Process a command and update input state or trigger actions
     * @param command The command to process
     * @param gameState The current game state
     * @returns true if command was processed successfully
     */
    processCommand(command: GameCommand, gameState: GameState): boolean {
        const player = gameState.players.get(this.playerId);
        if (!player) {
            console.warn(`CommandProcessor: Player ${this.playerId} not found`);
            return false;
        }

        switch (command.type) {
            case "MOVE":
                this.inputState[command.direction] = command.pressed;
                return true;

            case "STOP_MOVE":
                this.inputState[command.direction] = false;
                return true;

            case "JUMP":
                return player.jump(JUMP_STRENGTH);

            case "SHOOT":
                this.shootProjectile(gameState, player);
                return true;

            case "TELEPORT":
                // Validate teleport location is within bounds
                if (
                    command.row >= 0 &&
                    command.row < GRID_ROWS &&
                    command.col >= 0 &&
                    command.col < GRID_COLS
                ) {
                    player.teleportTo(command.row, command.col);
                    return true;
                }
                return false;

            default:
                return false;
        }
    }

    /**
     * Get the current input state for physics updates
     */
    getInputState(): InputState {
        return { ...this.inputState };
    }

    /**
     * Reset all input state (useful for cleanup)
     */
    reset(): void {
        this.inputState.up = false;
        this.inputState.down = false;
        this.inputState.left = false;
        this.inputState.right = false;
    }

    /**
     * Shoot a projectile from player's position
     * @private
     */
    private shootProjectile(gameState: GameState, player: import("../src/types.js").Player): void {
        const playerPos = player.getGridPosition();
        gameState.projectiles.push({
            row: playerPos.row,
            col: playerPos.col,
            velRow: -PROJECTILE_SPEED, // Move up
            velCol: 0,
        });
    }
}
