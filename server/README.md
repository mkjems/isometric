# Multiplayer Server Setup

## Phase 1 Complete! ✅

The server infrastructure is now ready for multiplayer gameplay.

## What's Been Built

### Server Components

1. **`server/main.ts`** - Main server entry point

   - Serves static files from `dist/`
   - Handles WebSocket upgrades
   - Runs on port 8000

2. **`server/types.ts`** - TypeScript types for client-server protocol

   - Message definitions (ClientMessage, ServerMessage)
   - Connection and session types

3. **`server/game-session.ts`** - Game session manager

   - Handles 2-player game rooms
   - Player connection/disconnection
   - Broadcasting messages

4. **`server/game-loop.ts`** - Authoritative game loop

   - Runs at 60 FPS (16.67ms per tick)
   - Processes player commands
   - Updates game state using shared logic
   - Broadcasts state to clients

5. **`server/websocket-handler.ts`** - WebSocket connection handler
   - Manages WebSocket lifecycle
   - Routes messages between clients and game loop
   - Handles ping/pong for connection health

## Installation

### Install Deno

```bash
# macOS/Linux
curl -fsSL https://deno.land/install.sh | sh

# Or using Homebrew
brew install deno
```

## Running the Server

### Development Mode (with auto-reload)

```bash
deno task dev
```

### Production Mode

```bash
deno task start
```

The server will:

- Serve static files at `http://localhost:8000`
- Accept WebSocket connections at `ws://localhost:8000`
- Wait for 2 players to connect before starting the game loop

## Architecture

```
Client (Browser)
      ↓
  WebSocket
      ↓
WebSocketHandler
      ↓
GameSessionManager ←→ GameLoop (60 FPS)
      ↓                    ↓
  Broadcasts         CommandProcessor
   State Updates     + Game Logic
```

## Message Protocol

### Client → Server

```json
{
  "type": "command",
  "command": {
    "type": "MOVE" | "STOP_MOVE" | "JUMP" | "SHOOT" | "TELEPORT",
    ...
  }
}
```

### Server → Client

```json
{
  "type": "gameState",
  "tick": 12345,
  "state": {
    /* full game state */
  }
}
```

## Next Steps (Phase 2)

Now that the server is ready, we need to:

1. **Update client to connect via WebSocket**

   - Create WebSocket connection manager
   - Send commands to server instead of processing locally
   - Receive and render server game state

2. **Add player differentiation**

   - Visual indicators for "you" vs "opponent"
   - Different colors for each player

3. **Add connection UI**
   - "Waiting for opponent" screen
   - Connection status indicator
   - Reconnection handling

## Testing

To test the server:

1. Build the client: `npm run build`
2. Start the server: `deno task dev`
3. Open two browser tabs to `http://localhost:8000`
4. Both should connect as Player 1 and Player 2

Currently, the game still runs locally in the browser. Phase 2 will connect it to the server.
