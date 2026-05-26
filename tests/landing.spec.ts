import { test, expect } from "@playwright/test";

test("login page loads", async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/vite/i);
})

test("user can login", async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Username').fill("testuser");
    await page.getByLabel('Password').fill("testpass");
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/);
});