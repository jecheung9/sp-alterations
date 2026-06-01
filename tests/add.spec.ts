import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-05-04T10:00'));

    await page.route("**/api/clients", async route => {
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([
                { _id: "1", name: "test client" }
            ])
        });
    });

    await page.route("**/api/todo", async route => {
        if (route.request().method() === "POST") {
            return route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    id: 1,
                    type: "alteration",
                    status: "Not Started",
                    due: "2026-05-10",
                    client: { name: "test client" },
                    description: "new alteration test",
                    price: 100
                })
            });
        }

        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([])
        });
    });

    await page.route("**/api/meetings", async route => {
        if (route.request().method() === "POST") {
            return route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    id: 1,
                    due: "2026-05-10T13:50",
                    client: { _id: "1", name: "test client" },
                    type: "meeting",
                    status: "Not Started",
                    meetingType: "pickup",
                    description: "fill description"
                })
            });
        }

        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([])
        });
    });

    await page.goto('/');
    await page.getByLabel('Username').fill("testuser");
    await page.getByLabel('Password').fill("testpass");
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/);
})

test("add entry button, add alteration", async ({ page }) => {
    await page.getByText('Add Entry').click();
    const clientSelect = page.locator('select[name="client"]');
    await clientSelect.click();
    await clientSelect.selectOption({ label: "test client" });
    await page.locator('input[name="date"]').fill("2026-05-10");
    await page.locator('#price').fill("100");
    await page.locator('textarea[name="description"]').fill("new alteration test");

    await page.getByRole('button', { name: 'Submit Entry' }).click();

    await expect(page.locator('form')).not.toBeVisible();
    await page.pause();
    const todo = page.locator('.group', { hasText: '#1: new alteration test' });
    await expect(todo).toBeVisible();
})

test("add entry button, add pickup meeting", async ({ page }) => {
    await page.getByText('Add Entry').click();
    await page.getByRole('button', { name: 'Meeting', exact: true }).click();

    const clientSelect = page.locator('select[name="client"]');
    await clientSelect.click();
    await clientSelect.selectOption({ label: "test client" });
    await page.locator('input[name="date"]').fill("2026-05-10T13:50");
    await page.getByLabel('Pickup').click();
    await page.locator('textarea').fill("fill description");
    await page.getByRole('button', { name: 'Submit Entry' }).click();
    await expect(page.locator('form')).not.toBeVisible();
    await page.pause();
    const meeting = page.locator('.group', { hasText: 'Pickup: fill description' });
    await expect(meeting).toBeVisible();
})

test("add entry button, add dropoff meeting", async ({ page }) => {
    await page.route("**/api/todo", async route => {
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([
                {
                    id: 2,
                    type: "alteration",
                    status: "Not Started",
                    due: "2026-05-10",
                    client: { _id: "1", name: "test client" },
                    description: "test2",
                    price: 50
                }
            ])
        });
    });

    await page.route("**/api/meetings", async route => {
        if (route.request().method() === "POST") {
            return route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    id: 1,
                    due: "2026-05-10T13:50",
                    client: { _id: "1", name: "test client" },
                    type: "meeting",
                    status: "Not Started",
                    meetingType: "dropoff",
                    alterationIds: [2]
                })
            });
        }

        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([])
        });
    });

    await page.goto('/');
    await page.getByLabel('Username').fill("testuser");
    await page.getByLabel('Password').fill("testpass");
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/);

    await page.getByText('Add Entry').click();
    await page.getByRole('button', { name: 'Meeting', exact: true }).click();

    const clientSelect = page.locator('select[name="client"]');
    await clientSelect.click();
    await clientSelect.selectOption({ label: "test client" });

    await page.locator('input[name="date"]').fill("2026-05-10T13:50");
    await page.getByLabel('Drop Off').click();
    await page.getByRole('checkbox', { name: '#2: test2' }).click();
    await page.getByRole('button', { name: 'Submit Entry' }).click();

    const meeting = page.locator('.group', { hasText: 'Dropoff: 2' });
    await expect(meeting).toBeVisible();
})

test("add todo button in todo page", async ({ page }) => {
    await page.goto('/todo');
    await page.getByText('Add Todo').click();
    const clientSelect = page.locator('select[name="client"]');
    await clientSelect.click();
    await clientSelect.selectOption({ label: "test client" });
    await page.locator('input[name="date"]').fill("2026-05-10");
    await page.locator('#price').fill("100");
    await page.locator('textarea[name="description"]').fill("new alteration test");

    await page.getByRole('button', { name: 'Submit Entry' }).click();

    await expect(
        page.getByRole("heading", { name: /To-Do/i })
    ).toContainText("To-Do (1)");

    const header = page.locator("table").first().locator("thead th");
    await expect(header.nth(0)).toHaveText("id");
    await expect(header.nth(1)).toHaveText("Due Date");
    await expect(header.nth(2)).toHaveText("Status");
    await expect(header.nth(3)).toHaveText("Client");
    await expect(header.nth(4)).toHaveText("Price");
    await expect(header.nth(5)).toHaveText("Description");

    const rows = page.locator("table").first().locator("tbody tr");
    await expect(rows).toHaveCount(1);

    const firstRow = rows.nth(0);
    const firstRowCells = firstRow.getByRole("cell");
    await expect(firstRowCells.nth(0)).toHaveText("1");
    await expect(firstRowCells.nth(1)).toHaveText("Sun, 5/10/26");
    await expect(firstRowCells.nth(2)).toHaveText("Not Started");
    await expect(firstRowCells.nth(3)).toHaveText("test client");
    await expect(firstRowCells.nth(4)).toHaveText("100");
    await expect(firstRowCells.nth(5)).toHaveText("new alteration test");
})

test("add meeting button in meetings page, add pickup meeting", async ({ page }) => {
    await page.goto('/meetings');
    await page.getByText('Add Meeting').click();
    const clientSelect = page.locator('select[name="client"]');
    await clientSelect.click();
    await clientSelect.selectOption({ label: "test client" });
    await page.locator('input[name="date"]').fill("2026-05-10T13:50");
    await page.getByLabel('Pickup').click();
    await page.locator('textarea').fill("fill description");
    await page.getByRole('button', { name: 'Submit Entry' }).click();

    await expect(
        page.getByRole("heading", { name: /Upcoming Meetings/ })
    ).toContainText("Upcoming Meetings (1)");

    const header = page.locator("table").first().locator("thead th");
    await expect(header.nth(0)).toHaveText("id");
    await expect(header.nth(1)).toHaveText("Meeting Time");
    await expect(header.nth(2)).toHaveText("Client");
    await expect(header.nth(3)).toHaveText("Notes");

    const rows = page.locator("table").first().locator("tbody tr");
    await expect(rows).toHaveCount(1);

    const firstRow = rows.nth(0);
    const firstRowCells = firstRow.getByRole("cell");
    await expect(firstRowCells.nth(0)).toHaveText("1");
    await expect(firstRowCells.nth(1)).toHaveText("Sun, 5/10/26, 01:50 PM");
    await expect(firstRowCells.nth(2)).toHaveText("test client");
    await expect(firstRowCells.nth(3)).toHaveText("Pickup: fill description");
})

test("add meeting button in meetings page, add dropoff meeting", async ({ page }) => {
    await page.route("**/api/todo", async route => {
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([
                {
                    id: 2,
                    type: "alteration",
                    status: "Not Started",
                    due: "2026-05-10",
                    client: { _id: "1", name: "test client" },
                    description: "test2",
                    price: 50
                }
            ])
        });
    });

    await page.route("**/api/meetings", async route => {
        if (route.request().method() === "POST") {
            return route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    id: 1,
                    due: "2026-05-10T13:50",
                    client: { _id: "1", name: "test client" },
                    type: "meeting",
                    status: "Not Started",
                    meetingType: "dropoff",
                    alterationIds: [2]
                })
            });
        }

        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([])
        });
    });

    await page.goto('/');
    await page.getByLabel('Username').fill("testuser");
    await page.getByLabel('Password').fill("testpass");
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/);

    await page.goto('/meetings');
    await page.getByText('Add Meeting').click();

    const clientSelect = page.locator('select[name="client"]');
    await clientSelect.click();
    await clientSelect.selectOption({ label: "test client" });

    await page.locator('input[name="date"]').fill("2026-05-10T13:50");
    await page.getByLabel('Drop Off').click();
    await page.getByRole('checkbox', { name: '#2: test2' }).click();
    await page.getByRole('button', { name: 'Submit Entry' }).click();

    await expect(
        page.getByRole("heading", { name: /Upcoming Meetings/ })
    ).toContainText("Upcoming Meetings (1)");

    const header = page.locator("table").first().locator("thead th");
    await expect(header.nth(0)).toHaveText("id");
    await expect(header.nth(1)).toHaveText("Meeting Time");
    await expect(header.nth(2)).toHaveText("Client");
    await expect(header.nth(3)).toHaveText("Notes");

    const rows = page.locator("table").first().locator("tbody tr");
    await expect(rows).toHaveCount(1);

    const firstRow = rows.nth(0);
    const firstRowCells = firstRow.getByRole("cell");
    await expect(firstRowCells.nth(0)).toHaveText("1");
    await expect(firstRowCells.nth(1)).toHaveText("Sun, 5/10/26, 01:50 PM");
    await expect(firstRowCells.nth(2)).toHaveText("test client");
    await expect(firstRowCells.nth(3)).toHaveText("Dropoff: 2");

})