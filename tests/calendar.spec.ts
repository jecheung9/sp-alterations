import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-05-04T10:00'));
    await page.goto('/');
    await page.getByLabel('Username').fill("testuser");
    await page.getByLabel('Password').fill("testpass");
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.getByRole('link', { name: /Calendar/i }).click();
    await expect(page).toHaveURL(/calendar/);
})

test("calendar loads", async ({ page }) => {
    await expect(
        page.getByRole('heading', { name: 'Calendar', exact: true })
    ).toBeVisible();
});

test("today, left right buttons", async ({ page }) => {
    const heading = page.getByRole("heading", { level: 2 });
    await expect(heading).toHaveText("May 2026");
    await page.getByRole("button", { name: ">" }).click();
    await expect(heading).toHaveText("June 2026");

    await page.getByRole("button", { name: "<" }).click();
    await page.getByRole("button", { name: "<" }).click();
    await expect(heading).toHaveText("April 2026");

    await page.getByRole("button", { name: "Today" }).click();
    await expect(heading).toHaveText("May 2026");
})

test("correct calendar days", async ({ page }) => {
    const today = page.getByText("4", { exact: true })
    await expect(today).toHaveClass(/text-green-600/);

    const day13 = page.getByText("13", { exact: true }).first();
    await expect(day13).toBeVisible();

    const grid = page.locator("div").filter({ hasText: /Sun/ }).first().locator("..");

    const gridBox = await grid.boundingBox();
    const dayBox = await day13.boundingBox();

    expect(gridBox).not.toBeNull();
    expect(dayBox).not.toBeNull();

    const relativeX = dayBox!.x - gridBox!.x;
    const columnWidth = gridBox!.width / 7;

    const columnIndex = Math.floor(relativeX / columnWidth);

    expect(columnIndex).toBe(4);
})

test("inside calendar cells", async ({ page }) => {
    await page.setViewportSize({
        width: 1512,
        height: 900,
    });
    await page.route("**/api/meetings", async route => {
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([
            {
                id: 1,
                due: "2026-05-04T16:45",
                client: { name: "frontend test client" },
                type: "meeting",
                status: "Complete",
                meetingType: "pickup",
                description: "testing frontend"
            },
            {
                id: 2,
                due: "2026-05-04T17:45",
                client: { name: "frontend test client" },
                type: "meeting",
                status: "Not Started",
                meetingType: "pickup",
                description: "testing frontend"
            },
            {
                id: 3,
                due: "2026-05-04T18:45",
                client: { name: "frontend test client" },
                type: "meeting",
                status: "Not Started",
                meetingType: "pickup",
                description: "testing frontend"
            },
            ])
        });
    });

    await page.route("**/api/todo", async route => {
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([
            {
                id: 1,
                type: "alteration",
                status: "Complete",
                due: "2026-05-04", 
                client: { name: "test" },
                description: "test",
                price: 50
            },
            {
                id: 2,
                type: "alteration",
                status: "Not Started",
                due: "2026-05-04", 
                client: { name: "test" },
                description: "test",
                price: 50
            },
            ])
        });
    });

    await page.goto('/');
    await page.getByLabel('Username').fill("testuser");
    await page.getByLabel('Password').fill("testpass");
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.getByRole('link', { name: /Calendar/i }).click();


    await expect(page.getByText("4:45 PM Meeting 1")).toBeVisible();
    await expect(page.getByText("5:45 PM Meeting 2")).toBeVisible();
    await expect(page.getByText("+1 meeting, +2 todos")).toBeVisible();

    const meeting1 = page.getByText("4:45 PM Meeting 1");
    await expect(meeting1).toHaveClass(/line-through/);
    await expect(meeting1).toHaveClass(/bg-red-300/);

    const meeting2 = page.getByText("5:45 PM Meeting 2");
    await expect(meeting2).not.toHaveClass(/line-through/);
    await expect(meeting2).toHaveClass(/bg-red-300/);

    await page.getByText("4:45 PM Meeting 1").click();
    await expect(page).toHaveURL(/\/meetings\/1/);
    await expect(page.getByRole("heading", { name: 'Meeting #1' })).toBeVisible();

    await page.goBack();

    await page.getByText("+1 meeting, +2 todos").click();
    await expect(page.getByText("6:45 PM Meeting 3").nth(1)).toBeVisible();
    await expect(page.getByText("Todo id 1").nth(1)).toBeVisible();
    await expect(page.getByText("Todo id 2").nth(1)).toBeVisible();
    
    const todo1 = page.getByText("Todo id 1").nth(1);
    await expect(todo1).toHaveClass(/line-through/);
    await expect(todo1).toHaveClass(/bg-blue-300/);

    await page.getByText("Todo id 2").nth(1).click();
    await expect(page).toHaveURL(/\/todo\/2/);
    await expect(page.getByRole("heading", { name: 'Todo #2' })).toBeVisible();
})