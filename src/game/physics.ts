// Physics and game state update logic
// This file now delegates to shared game logic

import type { GameState, KeyboardState, InputState } from "../types.ts";
import { updateGameState } from "../../shared/game-logic.js";

/**
 * Convert keyboard state to input state
 * @param keys - The current keyboard state
 * @returns InputState for game logic processing
 */
function keysToInputState(keys: KeyboardState): InputState {
  return {
    up: keys["ArrowUp"] || keys["w"] || keys["W"] || false,
    down: keys["ArrowDown"] || keys["s"] || keys["S"] || false,
    left: keys["ArrowLeft"] || keys["a"] || keys["A"] || false,
    right: keys["ArrowRight"] || keys["d"] || keys["D"] || false,
  };
}

/**
 * Update game state - handles player movement, jumping, and projectiles
 * @param gameState - The game state object
 * @param keys - The current keyboard state (key -> boolean)
 */
export function update(gameState: GameState, keys: KeyboardState): void {
  const inputState = keysToInputState(keys);
  updateGameState(gameState, inputState);
}
