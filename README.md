# Isometric Game

A fun isometric grid-based game built with TypeScript and Vite, featuring Wild West Nintendo-style background music.

## Features

- 🎮 Isometric grid-based gameplay
- 🎵 Interactive background music with 8-bit Wild West theme
- 🏃 Player movement with physics (WASD or Arrow keys)
- 🦘 Jump mechanics (X key)
- 🔫 Projectile shooting (Spacebar)
- 🎯 Click-to-move functionality
- 🐛 Debug mode with FPS counter and grid coordinates (D key)
- 🎨 Smooth rendering with hover effects

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm run dev
```

The game will open automatically in your browser at `http://localhost:3000`

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Linting

```bash
# Run TypeScript type checking
npm run lint
```

## Controls

| Key | Action |
|-----|--------|
| **WASD** or **Arrow Keys** | Move player |
| **X** | Jump |
| **Spacebar** | Shoot projectile |
| **D** | Toggle debug mode |
| **Mouse Click** | Teleport to clicked tile |

## Music Toggle

Click the music toggle button in the top-right corner to turn the background music on/off.

## Project Structure

```
isometric/
├── src/
│   ├── main.ts              # Game initialization and loop
│   ├── player.ts            # Player class with movement
│   ├── physics.ts           # Physics and game state updates
│   ├── renderer.ts          # Rendering functions
│   ├── grid.ts              # Grid utilities
│   ├── input-handler.ts     # Keyboard and mouse input
│   ├── backgroundMusic.ts   # 8-bit music system
│   ├── sound-effects.ts     # Sound effects
│   ├── musicToggle.ts       # Music UI control
│   ├── debug.ts             # Debug overlay
│   ├── constants.ts         # Game constants
│   ├── rendering-constants.ts # Rendering constants
│   └── types.ts             # TypeScript type definitions
├── public/
│   └── styles.css           # Game styles
├── index.html               # Entry HTML file
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Technology Stack

- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Web Audio API** - Music and sound effects
- **Canvas API** - Game rendering

## License

MIT
