import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.route("**/api/clients", async route => {
        const method = route.request().method();
        if (method === "GET") {
            return route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify([])
            });
        }
        if (method === "POST") {
            const body = JSON.parse(route.request().postData() || "{}");
            return route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                _id: Math.random().toString(),
                name: body.name,
                }),
            });
        }
        if (method === "DELETE") {
            return route.fulfill({
                status: 200,
                body: "",
            });
        }
        return route.continue();
    });

    await page.goto('/');
    await page.getByLabel('Username').fill("testuser");
    await page.getByLabel('Password').fill("testpass");
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/dashboard/);

    await page.getByRole('link', { name: /Settings/i }).click();
    await expect(page).toHaveURL(/settings/);
});

test("no clients test", async ({ page }) => {
    await expect(page.getByText('No clients yet. Add some!')).toBeVisible();
})

test("add and delete a client", async ({ page }) => {
    //add 
    await page.getByPlaceholder("Add a client").fill("Testing add Client");
    await page.getByRole('button', { name: /add/i }).click();
    await expect(page.getByText("Testing add Client")).toBeVisible();

    //delete
    await page.getByRole('button', { name: "✕" }).click();
    await expect(page.getByText("No clients yet. Add some!")).toBeVisible();
});