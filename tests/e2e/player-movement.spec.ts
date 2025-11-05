import { test, expect } from '@playwright/test';

test.describe('Isometric Game - Player Movement', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(300); // Wait for game initialization
    });

    test('should move player right on arrow key press', async ({ page }) => {
        const initialPos = await page.evaluate(() => {
            return (window as any).__gameTestAPI.getPlayerPosition();
        });

        // Hold the key down for movement
        await page.keyboard.down('ArrowRight');
        await page.waitForTimeout(200); // Wait for movement
        await page.keyboard.up('ArrowRight');
        await page.waitForTimeout(50); // Small delay after release

        const newPos = await page.evaluate(() => {
            return (window as any).__gameTestAPI.getPlayerPosition();
        });

        // Player should have moved (either row or col should change in isometric grid)
        const hasMoved = newPos.row !== initialPos.row || newPos.col !== initialPos.col;
        expect(hasMoved).toBe(true);
    });

    test('should move player left on arrow key press', async ({ page }) => {
        const initialPos = await page.evaluate(() => {
            return (window as any).__gameTestAPI.getPlayerPosition();
        });

        // Hold the key down for movement
        await page.keyboard.down('ArrowLeft');
        await page.waitForTimeout(200);
        await page.keyboard.up('ArrowLeft');
        await page.waitForTimeout(50);

        const newPos = await page.evaluate(() => {
            return (window as any).__gameTestAPI.getPlayerPosition();
        });

        const hasMoved = newPos.row !== initialPos.row || newPos.col !== initialPos.col;
        expect(hasMoved).toBe(true);
    });

    test('should move player up on arrow key press', async ({ page }) => {
        const initialPos = await page.evaluate(() => {
            return (window as any).__gameTestAPI.getPlayerPosition();
        });

        // Hold the key down for movement
        await page.keyboard.down('ArrowUp');
        await page.waitForTimeout(200);
        await page.keyboard.up('ArrowUp');
        await page.waitForTimeout(50);

        const newPos = await page.evaluate(() => {
            return (window as any).__gameTestAPI.getPlayerPosition();
        });

        const hasMoved = newPos.row !== initialPos.row || newPos.col !== initialPos.col;
        expect(hasMoved).toBe(true);
    });

    test('should move player down on arrow key press', async ({ page }) => {
        const initialPos = await page.evaluate(() => {
            return (window as any).__gameTestAPI.getPlayerPosition();
        });

        // Hold the key down for movement
        await page.keyboard.down('ArrowDown');
        await page.waitForTimeout(200);
        await page.keyboard.up('ArrowDown');
        await page.waitForTimeout(50);

        const newPos = await page.evaluate(() => {
            return (window as any).__gameTestAPI.getPlayerPosition();
        });

        const hasMoved = newPos.row !== initialPos.row || newPos.col !== initialPos.col;
        expect(hasMoved).toBe(true);
    });

    test('should allow player to jump', async ({ page }) => {
        // Press space to jump
        await page.keyboard.press('Space');
        await page.waitForTimeout(50);

        const jumpHeight = await page.evaluate(() => {
            return (window as any).__gameTestAPI.getPlayerJumpHeight();
        });

        // Player should be off the ground while jumping
        expect(jumpHeight).toBeGreaterThan(0);
    });

    test('should return player to ground after jump', async ({ page }) => {
        await page.keyboard.press('Space');
        await page.waitForTimeout(100); // Jump up

        // Wait for player to land
        await page.waitForTimeout(1000);

        const isOnGround = await page.evaluate(() => {
            return (window as any).__gameTestAPI.isPlayerOnGround();
        });

        expect(isOnGround).toBe(true);
    });
});
