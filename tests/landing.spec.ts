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

test("user can logout", async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Username').fill("testuser");
    await page.getByLabel('Password').fill("testpass");
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/);
    await page.getByText('Log Out').click();
    await expect(
        page.getByRole('heading', { name: 'Login', exact: true })
    ).toBeVisible();
})

test("page not found", async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Username').fill("testuser");
    await page.getByLabel('Password').fill("testpass");
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/);
    await page.goto('/fhjalsdfhasdfhkj');
    await expect(page.getByText('Alterations Dashboard Page Not Found')).toBeVisible();
    await page.getByText('Back to Dashboard').click();
    await expect(page).toHaveURL(/dashboard/);
})