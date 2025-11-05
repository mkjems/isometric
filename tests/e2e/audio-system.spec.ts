import { test, expect } from '@playwright/test';

test.describe('Isometric Game - Audio System', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(300);
    });

    test('should have music toggle button', async ({ page }) => {
        const musicToggle = await page.locator('#musicToggle');
        await expect(musicToggle).toBeVisible();
    });

    test('should show music OFF by default', async ({ page }) => {
        const musicToggle = await page.locator('#musicToggle');
        const text = await musicToggle.textContent();

        expect(text).toContain('OFF');
    });

    test('should toggle music on when clicked', async ({ page }) => {
        const musicToggle = await page.locator('#musicToggle');

        // Click to turn ON
        await musicToggle.click();
        await page.waitForTimeout(100);

        const textAfter = await musicToggle.textContent();
        expect(textAfter).toContain('ON');

        const isPlaying = await page.evaluate(() => {
            const api = (window as any).__musicAPI;
            return api ? api.isPlaying() : false;
        });

        expect(isPlaying).toBe(true);
    });

    test('should toggle music off when clicked twice', async ({ page }) => {
        const musicToggle = await page.locator('#musicToggle');

        // Click to turn ON
        await musicToggle.click();
        await page.waitForTimeout(100);

        // Click again to turn OFF
        await musicToggle.click();
        await page.waitForTimeout(100);

        const textAfter = await musicToggle.textContent();
        expect(textAfter).toContain('OFF');

        const isPlaying = await page.evaluate(() => {
            const api = (window as any).__musicAPI;
            return api ? api.isPlaying() : false;
        });

        expect(isPlaying).toBe(false);
    });

    test('should apply playing class when music is on', async ({ page }) => {
        const musicToggle = await page.locator('#musicToggle');

        await musicToggle.click();
        await page.waitForTimeout(100);

        const hasPlayingClass = await musicToggle.evaluate((el) => {
            return el.classList.contains('playing');
        });

        expect(hasPlayingClass).toBe(true);
    });
});
