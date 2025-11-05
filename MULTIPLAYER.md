# Multiplayer Client - Phase 2 Complete! ✅

## How to Test Multiplayer

### 1. Start the Deno Server

```bash
deno task dev
```

The server will start on `http://localhost:8000`

### 2. Test Single-Player Mode

Open in browser:

```
http://localhost:8000
```

This runs the game locally (original mode) - no networking.

### 3. Test Multiplayer Mode

Open **TWO browser tabs/windows** with:

```
http://localhost:8000?multiplayer=true
```

**What happens:**

1. First tab connects as **Player 1** (green box)
2. Second tab connects as **Player 2** (blue box)
3. Game starts automatically when both players connect
4. All inputs go through the server
5. Game state is synchronized across both clients

## Features Implemented

### ✅ Phase 2 Complete:

- [x] WebSocket connection manager (`src/network/websocket-client.ts`)
- [x] Multiplayer game loop (server authoritative)
- [x] Command routing (inputs sent to server in multiplayer mode)
- [x] Connection UI (status and player assignment displayed)
- [x] Player differentiation (Player 1 = Green, Player 2 = Blue)
- [x] Automatic reconnection on disconnect
- [x] Dual-mode support (single-player and multiplayer)

### Server-Side (Phase 1):

- [x] WebSocket handler
- [x] Game session manager (2-player rooms)
- [x] Authoritative game loop at 60 FPS
- [x] Command processing
- [x] State broadcasting

## How It Works

### Single-Player Mode (Default)

```
User Input → Local Command Queue → Local Game Logic → Render
```

### Multiplayer Mode (?multiplayer=true)

```
User Input → WebSocket → Server Game Loop → Broadcast State → Render
```

## Controls

Same as single-player:

- **Arrow Keys / WASD** - Move
- **Space** - Jump
- **X** - Shoot projectile
- **Click** - Teleport to tile
- **D** - Toggle debug mode

## Visual Indicators

### Connection Status Colors:

- 🟠 **Orange** - Connecting
- 🔵 **Blue** - Waiting for second player
- 🟢 **Green** - Game ready (both players connected)
- ⚫ **Gray** - Disconnected
- 🔴 **Red** - Error

### Player Colors:

- 🟩 **Player 1** - Green box
- 🔵 **Player 2** - Blue box

## Testing Checklist

- [ ] Single player works (`http://localhost:8000`)
- [ ] Multiplayer connection (`http://localhost:8000?multiplayer=true`)
- [ ] "Waiting for player" message shown for first player
- [ ] Second player joins and game starts
- [ ] Movement is synchronized between both clients
- [ ] Jump and shoot work in multiplayer
- [ ] Reconnection works if one player disconnects
- [ ] Player colors are correct (P1=green, P2=blue)

## Known Limitations

1. **Single game session only** - Server currently supports only one 2-player game at a time
2. **No player persistence** - Refreshing loses your player slot
3. **Basic UI** - Connection status shown as simple text
4. **No collision** - Players can overlap (this is by design for now)

## Next Steps (Future Enhancements)

- [ ] Multiple game rooms/sessions
- [ ] Player persistence/reconnection to same slot
- [ ] Better UI/HUD for multiplayer
- [ ] Spectator mode
- [ ] Game lobby system
- [ ] Player names/avatars
- [ ] Chat system
- [ ] Leaderboard/scoring

## Troubleshooting

**"Cannot connect" error:**

- Make sure Deno server is running (`deno task dev`)
- Check that port 8000 is not blocked

**Second player can't join:**

- Only 2 players maximum per session
- Refresh both browsers to reset

**Movement not synchronized:**

- Check browser console for WebSocket errors
- Verify both clients show "ready" status

## Architecture

The game now supports two modes via a query parameter:

```typescript
// Detect mode
const MULTIPLAYER_MODE = urlParams.get("multiplayer") === "true";

// Different game loops
if (MULTIPLAYER_MODE) {
  gameLoopMultiplayer(); // Just renders server state
} else {
  gameLoopSinglePlayer(); // Runs full game logic locally
}
```

This allows gradual testing and backwards compatibility!
