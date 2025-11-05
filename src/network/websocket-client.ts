// WebSocket client for connecting to multiplayer server

import type { GameCommand, GameState } from "../types.ts";

export type ConnectionStatus =
    | "disconnected"
    | "connecting"
    | "waiting"
    | "ready"
    | "error";

export interface ConnectionState {
    status: ConnectionStatus;
    playerId: number | null;
    playerNumber: 1 | 2 | null;
    message: string;
}

type ServerMessage =
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

export class WebSocketClient {
    private ws: WebSocket | null = null;
    private connectionState: ConnectionState;
    private gameStateCallback: ((state: GameState) => void) | null = null;
    private connectionCallback: ((state: ConnectionState) => void) | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 2000;

    constructor() {
        this.connectionState = {
            status: "disconnected",
            playerId: null,
            playerNumber: null,
            message: "",
        };
    }

    /**
     * Connect to the WebSocket server
     */
    connect(url: string = `ws://${window.location.host}`): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log("⚠️ Already connected");
            return;
        }

        this.updateConnectionState("connecting", "Connecting to server...");
        console.log(`🔌 Connecting to ${url}`);

        try {
            this.ws = new WebSocket(url);

            this.ws.onopen = () => {
                console.log("✅ WebSocket connected");
                this.reconnectAttempts = 0;
            };

            this.ws.onmessage = (event) => {
                try {
                    const message: ServerMessage = JSON.parse(event.data);
                    this.handleServerMessage(message);
                } catch (error) {
                    console.error("Error parsing server message:", error);
                }
            };

            this.ws.onclose = () => {
                console.log("🔌 WebSocket closed");
                this.updateConnectionState("disconnected", "Disconnected from server");
                this.attemptReconnect(url);
            };

            this.ws.onerror = (error) => {
                console.error("❌ WebSocket error:", error);
                this.updateConnectionState("error", "Connection error");
            };
        } catch (error) {
            console.error("Failed to create WebSocket:", error);
            this.updateConnectionState("error", "Failed to connect");
        }
    }

    /**
     * Disconnect from the server
     */
    disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.updateConnectionState("disconnected", "Disconnected");
    }

    /**
     * Send a command to the server
     */
    sendCommand(command: GameCommand): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.warn("Cannot send command: not connected");
            return;
        }

        try {
            this.ws.send(
                JSON.stringify({
                    type: "command",
                    command,
                })
            );
        } catch (error) {
            console.error("Error sending command:", error);
        }
    }

    /**
     * Register callback for game state updates
     */
    onGameState(callback: (state: GameState) => void): void {
        this.gameStateCallback = callback;
    }

    /**
     * Register callback for connection state changes
     */
    onConnectionChange(callback: (state: ConnectionState) => void): void {
        this.connectionCallback = callback;
    }

    /**
     * Get current connection state
     */
    getConnectionState(): ConnectionState {
        return { ...this.connectionState };
    }

    /**
     * Handle messages from the server
     */
    private handleServerMessage(message: ServerMessage): void {
        console.log("📨 Server message:", message.type);

        switch (message.type) {
            case "playerAssignment":
                this.connectionState.playerId = message.playerId;
                this.connectionState.playerNumber = message.playerNumber;
                console.log(`🎮 Assigned as Player ${message.playerNumber}`);
                break;

            case "waitingForPlayer":
                this.updateConnectionState("waiting", message.message);
                break;

            case "gameStart":
                this.updateConnectionState("ready", message.message);
                break;

            case "gameState":
                // Forward game state to callback
                console.log("🎮 Received gameState:", message.state);
                console.log("  Players in state:", message.state.players);

                if (this.gameStateCallback) {
                    // Convert players object back to Map
                    const playersMap = new Map<number, any>();
                    if (message.state.players) {
                        const playersObj = message.state.players as any;
                        for (const [key, value] of Object.entries(playersObj)) {
                            playersMap.set(Number(key), value);
                        }
                    }

                    const gameState: GameState = {
                        ...message.state,
                        players: playersMap,
                    };

                    this.gameStateCallback(gameState);
                }
                break;

            case "playerDisconnected":
                this.updateConnectionState("waiting", message.message);
                break;

            case "pong":
                // Health check response
                break;

            default:
                console.warn("Unknown message type:", message);
        }
    }

    /**
     * Update connection state and notify listeners
     */
    private updateConnectionState(
        status: ConnectionStatus,
        message: string
    ): void {
        this.connectionState.status = status;
        this.connectionState.message = message;

        if (this.connectionCallback) {
            this.connectionCallback(this.getConnectionState());
        }
    }

    /**
     * Attempt to reconnect after disconnection
     */
    private attemptReconnect(url: string): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log("❌ Max reconnect attempts reached");
            this.updateConnectionState(
                "error",
                "Failed to reconnect. Please refresh the page."
            );
            return;
        }

        this.reconnectAttempts++;
        console.log(
            `🔄 Reconnecting in ${this.reconnectDelay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
        );

        setTimeout(() => {
            this.connect(url);
        }, this.reconnectDelay);
    }

    /**
     * Send ping to keep connection alive
     */
    ping(): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: "ping" }));
        }
    }
}
