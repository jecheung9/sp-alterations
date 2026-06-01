import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.setViewportSize({
        width: 390,
        height: 844,
    });
    await page.clock.setFixedTime(new Date('2026-05-04T10:00'));
    await page.goto('/');
    await page.getByLabel('Username').fill("testuser");
    await page.getByLabel('Password').fill("testpass");
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/);
})

test("calendar section is first", async ({ page }) => {
    const calendar = page.getByRole('heading', { name: 'Calendar' });
    const meetings = page.getByRole('heading', { name: 'Upcoming Meetings' });

    const calendarY = (await calendar.boundingBox())!.y;
    const meetingsY = (await meetings.boundingBox())!.y;

    expect(calendarY).toBeLessThan(meetingsY);
})

test("nav bar buttons", async ({ page }) => {
    await page.getByRole('link', { name: 'Money' }).click();
    await expect(page).toHaveURL(/money/);

    await page.getByRole('link', { name: 'Calendar' }).click();
    await expect(page).toHaveURL(/calendar/);

    await page.getByRole('link', { name: 'Todo'}).click();
    await expect(page).toHaveURL(/todo/);

    await page.getByRole('link', { name: 'Meetings' }).click();
    await expect(page).toHaveURL(/meetings/);

    await page.getByRole('link', { name: 'Settings' }).click();
    await expect(page).toHaveURL(/settings/);

    await page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL(/dashboard/);

    await page.locator('[aria-label="Add Entry"]').click();
    await expect(page.getByText('Add an alteration')).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();

    await page.locator('[aria-label="Log Out"]').click();
    await expect(page.getByRole('heading', { name: 'Login', exact: true })).toBeVisible();

})

test("money page", async ({ page }) => {
    await page.route("**/api/todo", route =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([
                {
                    id: 7777,
                    type: "alteration",
                    status: "Not Started",
                    due: "2025-05-01", 
                    client: { name: "test" },
                    description: "test",
                    price: 50
                },
                {
                    id: 7778,
                    type: "alteration",
                    status: "Not Started",
                    due: "2024-12-31", 
                    client: { name: "test" },
                    description: "test",
                    price: 40
                },
                {
                    id: 7779,
                    type: "alteration",
                    status: "Not Started",
                    due: "2024-12-31", 
                    client: { name: "test" },
                    description: "test",
                    price: 30
                },
                {
                    id: 7780,
                    type: "alteration",
                    status: "Not Started",
                    due: "2025-12-31", 
                    client: { name: "test2" },
                    description: "test",
                    price: 80
                },
            ])
        })
    );

    await page.goto("/");
    await page.getByLabel("Username").fill("testuser");
    await page.getByLabel("Password").fill("testpass");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.getByRole('link', { name: 'Money' }).click();
    await expect(page).toHaveURL(/money/);
    
    //money page loads
    await expect(
        page.getByRole('heading', { name: 'Money', exact: true })
    ).toBeVisible();

    //summary table
    const summaryRow = page.getByRole("row", { name: /Client/ });
    const summaryCells = summaryRow.getByRole("columnheader");
    await expect(summaryCells.nth(0)).toHaveText("Client");
    await expect(summaryCells.nth(1)).toHaveText("2025");
    await expect(summaryCells.nth(2)).toHaveText("2024");
    await expect(summaryCells.nth(3)).toHaveText("Total");

    const clientRow = page.getByRole("row").filter({
        has: page.getByRole("cell", { name: "test", exact: true })
    });
    const clientCells = clientRow.getByRole("cell");
    await expect(clientCells.nth(0)).toHaveText("test");
    await expect(clientCells.nth(1)).toHaveText("50");
    await expect(clientCells.nth(2)).toHaveText("70");
    await expect(clientCells.nth(3)).toHaveText("120");

    
    const clientRow2 = page.getByRole("row").filter({
        has: page.getByRole("cell", { name: "test2", exact: true })
    });
    const clientCells2 = clientRow2.getByRole("cell");
    await expect(clientCells2.nth(0)).toHaveText("test2");
    await expect(clientCells2.nth(1)).toHaveText("80");
    await expect(clientCells2.nth(2)).toHaveText("0");
    await expect(clientCells2.nth(3)).toHaveText("80");

    const totalRow = page.getByRole("row", { name: /Total/ });
    const totalCells = totalRow.getByRole("cell");
    await expect(totalCells.nth(0)).toHaveText("Total");
    await expect(totalCells.nth(1)).toHaveText("130");
    await expect(totalCells.nth(2)).toHaveText("70");
    await expect(totalCells.nth(3)).toHaveText("200");

});

test("calendar page", async ({ page }) => {
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
    await page.getByRole('link', { name: 'Calendar' }).click();
    await expect(page).toHaveURL(/calendar/);

    //key
    await expect(page.getByText("Key:")).toBeVisible();
    const meetings = page.locator("div.bg-red-300", {hasText: "Meetings"});
    await expect(meetings).toHaveClass(/bg-red-300/);

    const todos = page.locator("div.bg-blue-300", {hasText: "Todos"});
    await expect(todos).toHaveClass(/bg-blue-300/);

    //click on a day message
    await expect(page.getByText('Select a day to view details')).toBeVisible();

    //inside cell
    const meeting = page.locator('.bg-red-300', { hasText: '1 / 3' });
    await expect(meeting).toBeVisible();

    const todo = page.locator('.bg-blue-300', { hasText: '1 / 2' });
    await expect(todo).toBeVisible();

    //click on day without details
    await page.getByText('8', { exact: true }).click();
    await expect(page.getByText('Friday, May 8, 2026')).toBeVisible();
    await expect(page.getByText('No events today!')).toBeVisible();

    //click on a day with details
    await page.getByText('4', { exact: true }).click();
    await expect(page.getByText("4:45 PM Meeting 1").nth(1)).toBeVisible();
    await expect(page.getByText("5:45 PM Meeting 2")).toBeVisible();

    const meeting1 = page.getByText("4:45 PM Meeting 1").nth(1);
    await expect(meeting1).toHaveClass(/line-through/);
    await expect(meeting1).toHaveClass(/bg-red-300/);

    const meeting2 = page.getByText("5:45 PM Meeting 2");
    await expect(meeting2).not.toHaveClass(/line-through/);
    await expect(meeting2).toHaveClass(/bg-red-300/);

    await (meeting1).click();
    await expect(page).toHaveURL(/\/meetings\/1/);
    await expect(page.getByRole("heading", { name: 'Meeting #1' })).toBeVisible();

    await page.goBack();

    await page.getByText('4', { exact: true }).click();
    await expect(page.getByText("Todo id 1")).toBeVisible();
    
    const todo1 = page.getByText("Todo id 1");
    await expect(todo1).toHaveClass(/line-through/);
    await expect(todo1).toHaveClass(/bg-blue-300/);

    await page.getByText("Todo id 2").click();
    await expect(page).toHaveURL(/\/todo\/2/);
    await expect(page.getByRole("heading", { name: 'Todo #2' })).toBeVisible();
})

test("todo page", async ({ page }) => {
    await page.route("**/api/todo", route =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([
        {
            id: 1,
            type: "alteration",
            status: "Not Started",
            due: "2026-05-03",
            client: { name: "test" },
            description: "test",
            price: 40
        },
        {
            id: 2,
            type: "alteration",
            status: "Started",
            due: "2026-05-05",
            client: { name: "test2" },
            description: "test2",
            price: 50
        },
        {
            id: 3,
            type: "alteration",
            status: "Complete",
            due: "2026-05-05",
            client: { name: "test3" },
            description: "test3",
            price: 60
        },
        {
            id: 4,
            type: "alteration",
            status: "Dropped Off",
            due: "2026-05-05",
            client: { name: "test4" },
            description: "test4",
            price: 70
        },
    ])
        })
    );

    await page.goto('/');
    await page.getByLabel('Username').fill("testuser");
    await page.getByLabel('Password').fill("testpass");
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.getByRole('link', { name: 'Todo' }).click();
    await expect(page).toHaveURL(/todo/);

    //todo table
    await expect(
        page.getByRole("heading", { name: /To-Do/i })
    ).toContainText("To-Do (2)");

    const card1 = page.locator('.border.rounded-lg', { hasText: '#1' });
    await expect(card1).toBeVisible();
    await expect(card1).toContainText('Sun, 5/3/26');
    await expect(card1).toContainText('test');
    await expect(card1).toContainText('Price: 40');
    await expect(card1).toContainText('Not Started');

    const status1 = card1.locator('span', { hasText: 'Not Started' });
    await expect(status1).toHaveClass(/bg-\[#e74c3c\]/);
    await expect(status1).toHaveClass(/text-white/);

    const date1 = card1.locator('span', { hasText: 'Sun, 5/3/26' });
    await expect(date1).toHaveClass(/text-red-600/);

    const card2 = page.locator('.border.rounded-lg', { hasText: '#2' });
    const status2 = card2.locator('span', { hasText: 'Started' });
    await expect(status2).toHaveClass(/bg-\[#f1c40f\]/);

    //not delivered table
    await expect(
        page.getByRole("heading", { name: /Completed - Not Delivered/ })
    ).toContainText("Completed - Not Delivered (1)");

    const card3 = page.locator('.border.rounded-lg', { hasText: '#3' });
    const status3 = card3.locator('span', { hasText: 'Complete' });
    await expect(status3).toHaveClass(/text-white/);
    await expect(status3).toHaveClass(/bg-\[#2ecc71\]/);

    //dropped off table
    await expect(page.getByRole("button", { name: 'Expand' })).toBeVisible();
    await expect(page.locator('.border.rounded-lg')).toHaveCount(3);
    await page.getByRole("button", { name: 'Expand' }).click();
    await expect(page.getByRole("button", { name: 'Collapse' })).toBeVisible();
    await expect(page.locator('.border.rounded-lg')).toHaveCount(4);
    await page.getByRole("button", { name: 'Collapse' }).click();
    await expect(page.getByRole("button", { name: 'Expand' })).toBeVisible();
    await expect(page.locator('.border.rounded-lg')).toHaveCount(3);

    await expect(
        page.getByRole("heading", { name: /Completed - Dropped Off/ })
    ).toContainText("Completed - Dropped Off (1)");
    await page.getByRole("button", { name: 'Expand' }).click();

    const card4 = page.locator('.border.rounded-lg', { hasText: '#4' });
    const status4 = card4.locator('span', { hasText: 'Dropped Off' });
    await expect(status4).toBeVisible()
})

test("meetings page", async ({ page }) => {
    await page.route("**/api/meetings", route =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([
        {
            id: 1,
            due: "2026-01-01T16:45",
            client: { _id: "client-1", name: "test1" },
            type: "meeting",
            status: "Not Started",
            meetingType: "pickup",
            description: "testing frontend description"
        },
        {
            id: 2,
            due: "2026-06-01T16:45",
            client: { _id: "client-2", name: "test2" },
            type: "meeting",
            status: "Not Started",
            meetingType: "dropoff",
            alterationIds: [4]
        },
        {
            id: 3,
            due: "2026-05-01T16:45",
            client: { _id: "client-2", name: "test2" },
            type: "meeting",
            status: "Complete",
            meetingType: "pickup",
        },
    ])
        })
    );

    await page.goto('/');
    await page.getByLabel('Username').fill("testuser");
    await page.getByLabel('Password').fill("testpass");
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.getByRole('link', { name: 'Meetings' }).click();
    await expect(page).toHaveURL(/meetings/);

    //upcoming meetings table
    await expect(
        page.getByRole("heading", { name: /Upcoming Meetings/ })
    ).toContainText("Upcoming Meetings (2)");

    const card1 = page.locator('.border.rounded-lg', { hasText: '#1' });
    await expect(card1).toBeVisible();
    await expect(card1).toContainText('Thu, 1/1/26, 04:45 PM');
    await expect(card1).toContainText('test1');
    await expect(card1).toContainText('Pickup: testing frontend description');

    const status1 = card1.locator('span', { hasText: 'Not Started' });
    await expect(status1).toHaveClass(/bg-\[#e74c3c\]/);
    await expect(status1).toHaveClass(/text-white/);

    const date1 = card1.locator('span', { hasText: 'Thu, 1/1/26, 04:45 PM' });
    await expect(date1).toHaveClass(/text-red-600/);

    const card2 = page.locator('.border.rounded-lg', { hasText: '#2' });
    await expect(card2).toBeVisible();
    await expect(card2).toContainText('Dropoff: 4');


    //dropped off table
    await expect(page.getByRole("button", { name: 'Expand' })).toBeVisible();
    await expect(page.locator('.border.rounded-lg')).toHaveCount(2);
    await page.getByRole("button", { name: 'Expand' }).click();
    await expect(page.getByRole("button", { name: 'Collapse' })).toBeVisible();
    await expect(page.locator('.border.rounded-lg')).toHaveCount(3);
    await page.getByRole("button", { name: 'Collapse' }).click();
    await expect(page.getByRole("button", { name: 'Expand' })).toBeVisible();
    await expect(page.locator('.border.rounded-lg')).toHaveCount(2);

    await expect(
        page.getByRole("heading", { name: /Completed/ })
    ).toContainText("Completed (1)");
    await page.getByRole("button", { name: 'Expand' }).click();

    const card3 = page.locator('.border.rounded-lg', { hasText: '#3' });
    const status3 = card3.locator('span', { hasText: 'Complete' });
    await expect(status3).toHaveClass(/text-white/);
    await expect(status3).toHaveClass(/bg-\[#2ecc71\]/);
})