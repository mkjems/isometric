// Server-side type definitions for multiplayer protocol

import type { GameCommand, GameState } from "../src/types.ts";

// Client -> Server messages
export type ClientMessage =
    | { type: "command"; command: GameCommand }
    | { type: "ping" };

// Server -> Client messages
export type ServerMessage =
    | {
        type: "playerAssignment";
        playerId: number;
        playerNumber: 1 | 2;
    }
    | {
        type: "waitingForPlayer";
        message: string;
    }
    | {
        type: "gameStart";
        message: string;
    }
    | {
        type: "gameState";
        tick: number;
        state: GameState;
    }
    | {
        type: "playerDisconnected";
        playerId: number;
        message: string;
    }
    | { type: "pong" };

// Connection info
export interface PlayerConnection {
    id: number;
    socket: WebSocket;
    playerNumber: 1 | 2;
    connected: boolean;
}

// Game session
export interface GameSession {
    id: string;
    players: Map<number, PlayerConnection>;
    gameState: GameState;
    tickCounter: number;
    started: boolean;
}
