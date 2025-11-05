# Playwright Testing for Isometric Game

This project uses [Playwright](https://playwright.dev/) for end-to-end testing of the canvas-based isometric game.

## Running Tests

```bash
# Run all tests (headless mode)
npm test

# Run tests with UI mode (recommended for debugging)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests in Chromium only
npm run test:chromium

# Debug tests step-by-step
npm run test:debug
```

## Test Structure

Tests are located in `tests/e2e/` and are organized by feature:

- **game-initialization.spec.ts** - Tests game startup, canvas rendering, and initial state
- **player-movement.spec.ts** - Tests player movement with keyboard controls and jumping
- **canvas-interactions.spec.ts** - Tests mouse interactions with the canvas (hover, click)
- **audio-system.spec.ts** - Tests background music toggle functionality
- **visual-regression.spec.ts** - Screenshot comparison tests for visual changes

## Test API

The game exposes a test API in development mode (`import.meta.env.DEV`) via `window.__gameTestAPI`:

```typescript
// Available test methods:
__gameTestAPI.getPlayerPosition(); // Get player's exact position
__gameTestAPI.getPlayerGridPosition(); // Get player's grid cell position
__gameTestAPI.getPlayerJumpHeight(); // Get current jump height
__gameTestAPI.getPlayerVelocity(); // Get velocity vector
__gameTestAPI.isPlayerOnGround(); // Check if player is on ground
__gameTestAPI.getGameState(); // Get overall game state info
__gameTestAPI.getCanvas(); // Get canvas element
__gameTestAPI.getContext(); // Get 2D rendering context
```

Music API is available via `window.__musicAPI`:

```typescript
__musicAPI.isPlaying(); // Check if music is playing
__musicAPI.toggle(); // Toggle music on/off
__musicAPI.start(); // Start music
__musicAPI.stop(); // Stop music
```

## Writing New Tests

Create new test files in `tests/e2e/` following this pattern:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(300); // Wait for initialization
  });

  test("should do something", async ({ page }) => {
    // Your test code here
  });
});
```

## Testing Canvas Content

### Visual Regression Testing

```typescript
const canvas = await page.locator("#gameCanvas");
await expect(canvas).toHaveScreenshot("my-screenshot.png");
```

### Pixel Color Testing

```typescript
const pixelData = await page.evaluate(() => {
  const canvas = document.querySelector("#gameCanvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;
  const imageData = ctx.getImageData(x, y, 1, 1);
  return Array.from(imageData.data); // [R, G, B, A]
});
```

### Content Verification

```typescript
const hasContent = await page.evaluate(() => {
  const canvas = document.querySelector("#gameCanvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return imageData.data.some((pixel) => pixel !== 0);
});
```

## CI/CD Integration

The tests are configured to work in CI environments:

- Runs in headless mode
- Retries failed tests (2 retries on CI)
- Captures traces and videos on failure
- Generates HTML reports

## Viewing Test Results

After running tests, open the HTML report:

```bash
npx playwright show-report
```

This shows detailed test results, screenshots, traces, and videos for failed tests.
