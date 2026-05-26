import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-05-04T10:00'));
    await page.goto('/');
    await page.getByLabel('Username').fill("testuser");
    await page.getByLabel('Password').fill("testpass");
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/);
})

test("dashboard loads", async ({ page }) => {
    await expect(
        page.getByRole('heading', { name: 'Dashboard', exact: true })
    ).toBeVisible();
});

test("dashboard shows the 4 sections", async ({ page }) => {
    await expect(
        page.getByRole('heading', { name: 'Upcoming Meetings' })
    ).toBeVisible();
    await expect(
        page.getByRole('heading', { name: 'Calendar' })
    ).toBeVisible();
    await expect(
        page.getByRole('heading', { name: 'To-do' })
    ).toBeVisible();
    await expect(
        page.getByRole('heading', { name: 'Money' })
    ).toBeVisible();    
})

test("navigate to todo page from dashboard", async ({ page }) => {
    await page.getByRole('button', { name: 'View Full To-Do List' }).click();
    await expect(page).toHaveURL(/todo/);
});

test("navigate to meetings page from dashboard", async ({ page }) => {
    await page.getByRole('button', { name: 'View Previous Meetings' }).click();
    await expect(page).toHaveURL(/meetings/);
});

test("navigate to money page from dashboard", async ({ page }) => {
    await page.getByRole('button', { name: 'View Money Details' }).click();
    await expect(page).toHaveURL(/money/);
});

test("navigate to calendar page from dashboard", async ({ page }) => {
    await page.getByRole('button', { name: 'View Full Calendar' }).click();
    await expect(page).toHaveURL(/calendar/);
});

//meetings section
test("meetings empty state", async ({ page }) => {
    await page.route('**/api/meetings', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([]) //fill with empty meetings
        })
    });
    await page.goto('/');
    await page.getByLabel('Username').fill("testuser");
    await page.getByLabel('Password').fill("testpass");
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('No upcoming meetings!')).toBeVisible();
})

test("clickable meeting item", async ({ page }) => {
    await page.route("**/api/meetings", route =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([
                {
                    id: 5555,
                    due: "2027-01-01T16:45",
                    client: { name: "frontend test client" },
                    type: "meeting",
                    status: "Not Started",
                    meetingType: "pickup",
                    description: "testing frontend"
                }
            ])
        })
    );

    await page.goto('/');
    await page.getByLabel('Username').fill("testuser");
    await page.getByLabel('Password').fill("testpass");
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/);
    const meeting = page.locator(".group").first();
    await expect(meeting).toBeVisible();
    await expect(meeting).toContainText("Pickup: testing frontend");
    await meeting.click();
    await expect(page.getByRole("heading", { name: 'Meeting #5555' })).toBeVisible();
})

//todo stuff
test("todo empty state", async ({ page }) => {
    await page.route("**/api/todo", route =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([])
        })
    );


    await page.goto("/");
    await page.getByLabel("Username").fill("testuser");
    await page.getByLabel("Password").fill("testpass");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('No upcoming to-dos for the next 7 days!')).toBeVisible();
})

test("todo empty within 7 days", async ({ page }) => {
    await page.route("**/api/todo", route =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([
                {
                    id: 5555,
                    type: "alteration",
                    status: "Not Started",
                    due: "2040-01-01", 
                    client: { name: "test" },
                    description: "test",
                    price: 50
                }
            ])
        })
    );

    await page.goto("/");
    await page.getByLabel("Username").fill("testuser");
    await page.getByLabel("Password").fill("testpass");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('No upcoming to-dos for the next 7 days!')).toBeVisible();
})

test("clickable todo item", async ({ page }) => {
    await page.route("**/api/todo", route =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([
                {
                    id: 4444,
                    type: "alteration",
                    status: "Not Started",
                    due: "2025-01-01", 
                    client: { name: "test" },
                    description: "test",
                    price: 50
                }
            ])
        })
    );

    await page.goto('/');
    await page.getByLabel('Username').fill("testuser");
    await page.getByLabel('Password').fill("testpass");
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/);
    const todo = page.getByText("To-do").locator("..").locator(".group").first();
    await expect(todo).toBeVisible();
    await expect(todo).toContainText("#4444: test");
    await todo.click();
    await expect(page.getByRole("heading", { name: 'Todo #4444' })).toBeVisible();
})

//calendar stuff
test("calendar shows meeting and todo counts", async ({ page }) => {
    await page.route("**/api/todo", route =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([
                {
                    id: 4444,
                    type: "alteration",
                    status: "Complete",
                    due: "2026-05-05", 
                    client: { name: "test" },
                    description: "test",
                    price: 50
                }
            ])
        })
    );

    await page.route("**/api/meetings", route =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([
                {
                    id: 5555,
                    due: "2026-05-05T20:45",
                    client: { name: "frontend test client" },
                    type: "meeting",
                    status: "Not Started",
                    meetingType: "pickup",
                    description: "testing frontend"
                }
            ])
        })
    );

    await page.goto("/");
    await page.getByLabel("Username").fill("testuser");
    await page.getByLabel("Password").fill("testpass");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/);
    const cell = page.locator("text=5").filter({has: page.locator("div")}).first();
    await expect(page.getByText("M: 0 / 1")).toBeVisible();
    await expect(page.getByText("T: 1 / 1")).toBeVisible();
})

//money stuff
test("money shows ", async ({ page }) => {
    await page.route("**/api/todo", route =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([
                {
                    id: 4444,
                    type: "alteration",
                    status: "Complete",
                    due: "2026-05-01", 
                    client: { name: "test" },
                    description: "test",
                    price: 50
                },
                {
                    id: 4445,
                    type: "alteration",
                    status: "Not Started",
                    due: "2026-04-30", 
                    client: { name: "test2" },
                    description: "test",
                    price: 75
                },
            ])
        })
    );
    await page.goto("/");
    await page.getByLabel("Username").fill("testuser");
    await page.getByLabel("Password").fill("testpass");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText("May 2026 total: 50")).toBeVisible();
    await expect(page.getByText("April 2026 total: 75")).toBeVisible();
})

//late indicators
test("late meeting in red", async ({ page }) => {
    await page.route("**/api/meetings", route =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([
                {
                    id: 1111,
                    due: "2026-05-01T08:00",
                    client: { name: "test" },
                    type: "meeting",
                    status: "Not Started",
                    meetingType: "pickup",
                    description: "test"
                }
            ])
        })
    );

    await page.goto("/");
    await page.getByLabel("Username").fill("testuser");
    await page.getByLabel("Password").fill("testpass");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/);
    const meeting = page.locator(".group").first();
    await expect(meeting.locator(".text-red-600")).toBeVisible();
});

test("late todo in red", async ({ page }) => {
    await page.route("**/api/todo", route =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([
                {
                    id: 4444,
                    type: "alteration",
                    status: "Not Started",
                    due: "2025-01-01", 
                    client: { name: "test" },
                    description: "test",
                    price: 50
                }
            ])
        })
    );

    await page.goto('/');
    await page.getByLabel('Username').fill("testuser");
    await page.getByLabel('Password').fill("testpass");
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/);
    const todo = page.getByText("To-do").locator("..").locator(".group").first();
    await expect(todo.locator(".text-red-600")).toBeVisible();
});