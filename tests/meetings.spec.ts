import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-05-04T10:00'));
    const clients = [
        { _id: "client-1", name: "test1" },
        { _id: "client-2", name: "test2" },
    ];

    const meetingEntries = [
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
    ];

    const todoEntries = [
        {
            id: 4,
            type: "alteration",
            status: "Started",
            due: "2026-05-05",
            client: { _id: "client-2", name: "test2" },
            description: "test2",
            price: 50
        },
    ];

    await page.route(/\/api\/meetings(\/.*)?$/, async route => {
        const request = route.request();
        const method = request.method();
        const url = request.url();

        if (method === "GET") {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify(meetingEntries),
            });
            return;
        }

        if (method === "POST") {
            const requestBody = JSON.parse(request.postData() || "{}");
            const id = requestBody.id ?? Date.now();
            const newMeeting = { ...requestBody, id };
            meetingEntries.push(newMeeting);
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify(newMeeting),
            });
            return;
        }

        if (method === "PUT") {
            const id = Number(url.split("/").pop());
            const requestBody = JSON.parse(request.postData() || "{}");
            const index = meetingEntries.findIndex(item => item.id === id);
            const target = index !== -1 ? meetingEntries[index] : { id, type: "meeting", status: "Not Started", meetingType: "pickup", client: { name: "" }, due: "" };
            const updated = { ...target, ...requestBody };
            if (index !== -1) {
                meetingEntries[index] = updated;
            }
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify(updated),
            });
            return;
        }

        if (method === "DELETE") {
            const id = Number(url.split("/").pop());
            const index = meetingEntries.findIndex(item => item.id === id);
            if (index !== -1) {
                meetingEntries.splice(index, 1);
            }
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({}),
            });
            return;
        }

        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(meetingEntries),
        });
    });

    await page.route(/\/api\/todo(\/.*)?$/, async route => {
        const request = route.request();
        if (request.method() === "POST") {
            const requestBody = JSON.parse(request.postData() || "{}");
            const id = requestBody.id ?? Date.now();
            const newTodo = { ...requestBody, id };
            const existingIndex = todoEntries.findIndex(item => item.id === id);
            if (existingIndex !== -1) {
                todoEntries[existingIndex] = newTodo;
            } else {
                todoEntries.push(newTodo);
            }
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify(newTodo),
            });
            return;
        }

        if (request.method() === "PUT") {
            const url = request.url();
            const id = Number(url.split("/").pop());
            const requestBody = JSON.parse(request.postData() || "{}");
            const index = todoEntries.findIndex(item => item.id === id);
            const target = index !== -1 ? todoEntries[index] : { id, type: "alteration" };
            const updated = {
                ...target,
                ...requestBody,
            };

            if (index !== -1) {
                todoEntries[index] = updated;
            }

            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify(updated),
            });
            return;
        }

        if (route.request().method() === "DELETE") {
            const id = Number(route.request().url().split("/").pop());
            const todoIndex = todoEntries.findIndex(t => t.id === id);
            if (todoIndex !== -1) {
                todoEntries.splice(todoIndex, 1);
            }
            for (let i = meetingEntries.length - 1; i >= 0; i--) {
                const m = meetingEntries[i];

                if (m.alterationIds?.includes(id)) {
                    m.alterationIds = m.alterationIds.filter(x => x !== id);
                    if (m.alterationIds.length === 0) {
                        meetingEntries.splice(i, 1);
                    }
                }
            }
            await route.fulfill({ status: 200, body: "{}" });
            return;
        }

        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(todoEntries),
        });
    });

    await page.route(/\/api\/clients$/, async route => {
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(clients),
        });
    });

    await page.goto('/');
    await page.getByLabel('Username').fill("testuser");
    await page.getByLabel('Password').fill("testpass");
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.getByRole('link', { name: /Meetings/i }).click();
    await expect(page).toHaveURL(/meetings/);
})


test("upcoming meetings table", async ({ page }) => {
    await expect(
        page.getByRole("heading", { name: /Upcoming Meetings/ })
    ).toContainText("Upcoming Meetings (2)");

    const header = page.locator("table").first().locator("thead th");
    await expect(header.nth(0)).toHaveText("id");
    await expect(header.nth(1)).toHaveText("Meeting Time");
    await expect(header.nth(2)).toHaveText("Client");
    await expect(header.nth(3)).toHaveText("Notes");

    const rows = page.locator("table").first().locator("tbody tr");
    await expect(rows).toHaveCount(2);

    const firstRow = rows.nth(0);
    const firstRowCells = firstRow.getByRole("cell");
    await expect(firstRowCells.nth(0)).toHaveText("1");
    await expect(firstRowCells.nth(1)).toHaveText("Thu, 1/1/26, 04:45 PM");
    await expect(firstRowCells.nth(2)).toHaveText("test1");
    await expect(firstRowCells.nth(3)).toHaveText("Pickup: testing frontend description");


    const secondRow = rows.nth(1);
    const secondRowCells = secondRow.getByRole("cell");
    await expect(secondRowCells.nth(0)).toHaveText("2");
    await expect(secondRowCells.nth(1)).toHaveText("Mon, 6/1/26, 04:45 PM");
    await expect(secondRowCells.nth(2)).toHaveText("test2");
    await expect(secondRowCells.nth(3)).toHaveText("Dropoff: 4");

    //late indicator
    const dueCell = firstRowCells.nth(1);
    await expect(dueCell).toHaveClass(/text-red-600/);
    await expect(dueCell).toHaveClass(/font-bold/);
})


test("completed table collapsed", async ({ page }) => {
    await expect(page.getByRole("button", { name: 'Expand' })).toBeVisible();
    await expect(page.locator("table")).toHaveCount(1);
})

test("expand collapse button", async ({ page }) => {
    await expect(page.getByRole("button", { name: 'Expand' })).toBeVisible();
    await expect(page.locator("table")).toHaveCount(1);
    await page.getByRole("button", { name: 'Expand' }).click();
    await expect(page.getByRole("button", { name: 'Collapse' })).toBeVisible();
    await expect(page.locator("table")).toHaveCount(2);
})

test("completed table expanded", async ({ page }) => {
    await expect(page.getByRole("button", { name: 'Expand' })).toBeVisible();
    await page.getByRole("button", { name: 'Expand' }).click();
    await expect(page.getByRole("button", { name: 'Collapse' })).toBeVisible();

    await expect(
        page.getByRole("heading", { name: /Completed/ })
    ).toContainText("Completed (1)");

    const header = page.locator("table").nth(1).locator("thead th");
    await expect(header.nth(0)).toHaveText("id");
    await expect(header.nth(1)).toHaveText("Meeting Time");
    await expect(header.nth(2)).toHaveText("Client");
    await expect(header.nth(3)).toHaveText("Notes");

    const rows = page.locator("table").nth(1).locator("tbody tr");
    await expect(rows).toHaveCount(1);

    const firstRow = rows.nth(0);
    const firstRowCells = firstRow.getByRole("cell");
    await expect(firstRowCells.nth(0)).toHaveText("3");
    await expect(firstRowCells.nth(1)).toHaveText("Fri, 5/1/26, 04:45 PM");
    await expect(firstRowCells.nth(2)).toHaveText("test2");
    await expect(firstRowCells.nth(3)).toHaveText("Pickup");
})

test("empty messages", async ({ page }) => {
    await page.route("**/api/meetings", async route => {
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([]),
        });
    });

    await page.goto('/');
    await page.getByLabel('Username').fill("testuser");
    await page.getByLabel('Password').fill("testpass");
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.getByRole('link', { name: /Meetings/ }).click();
    await expect(page).toHaveURL(/meetings/);

    //headings
    await expect(
        page.getByRole("heading", { name: /Upcoming Meetings/ })
    ).toHaveText("Upcoming Meetings (0)");
    await expect(
        page.getByRole("heading", { name: /Completed/ })
    ).toHaveText("Completed (0)");

    //empty messages
    await expect(
        page.getByText("No upcoming meetings!")
    ).toBeVisible();
    await expect(
        page.getByText("No completed meetings yet!")
    ).toBeVisible();
})


//meetings details tests
test("click an item and view details and buttons", async ({ page }) => {
    const row = page.locator("table").first().locator("tbody tr").first();
    await row.click();
    await expect(page).toHaveURL(/\/meetings\/1/);
    await expect(page.getByRole("heading", { name: 'Meeting #1' })).toBeVisible();

    await expect(page.getByText(/Status:/)).toContainText("Not Started");
    await expect(page.getByText(/Client:/)).toContainText("test1");
    await expect(page.getByText(/Date \+ time:/)).toContainText("Thu, 1/1/26, 04:45 PM");
    await expect(page.getByText(/Notes:/)).toContainText("Pickup: testing frontend description");

    await expect(page.getByRole("button", { name: "Not Started" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Complete" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Edit" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Delete" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Return back to meetings list" })).toBeVisible();
})

test("status button functionalities", async ({ page }) => {
    const row = page.locator("table").first().locator("tbody tr").first();
    await row.click();
    await expect(page).toHaveURL(/\/meetings\/1/);
    await expect(page.getByRole("heading", { name: 'Meeting #1' })).toBeVisible();

    await page.getByRole("button", { name: "Complete" }).click();
    await expect(page.getByText(/Status:/)).toContainText("Complete");
    await page.getByRole("button", { name: "Not Started" }).click();
    await expect(page.getByText(/Status:/)).toContainText("Not Started");
})

test("delete meeting #1", async ({ page }) => {
    const row = page.locator("table").first().locator("tbody tr").first();
    await row.click();
    await expect(page).toHaveURL(/\/meetings\/1/);

    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Delete" }).nth(1).click();

    await expect(page).toHaveURL(/meetings/);
    await expect(page.locator("table").first().locator("tbody tr")).toHaveCount(1);
    await expect(page.locator("table").first().locator("tbody tr").first().getByRole("cell").nth(0)).toHaveText("2");
})

test("undo delete meeting #1", async ({ page }) => {
    const row = page.locator("table").first().locator("tbody tr").first();
    await row.click();
    await expect(page).toHaveURL(/\/meetings\/1/);

    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Delete" }).nth(1).click();

    await expect(page).toHaveURL(/meetings/);
    await expect(page.locator("table").first().locator("tbody tr")).toHaveCount(1);
    await expect(page.locator("table").first().locator("tbody tr").first().getByRole("cell").nth(0)).toHaveText("2");

    await expect(page.getByRole("button", { name: "Undo" })).toBeVisible();
    await page.getByRole("button", { name: "Undo" }).click();

    await expect(page.locator("table").first().locator("tbody tr")).toHaveCount(2);
    await expect(page.locator("table").first().locator("tbody tr").first().getByRole("cell").nth(0)).toHaveText("1");
})

test("return back to meetings list button", async ({ page }) => {
    const row = page.locator("table").first().locator("tbody tr").first();
    await row.click();
    await expect(page).toHaveURL(/\/meetings\/1/);

    await page.getByRole("button", { name: "Return back to meetings list" }).click();

    await expect(
        page.getByRole("heading", { name: /Upcoming Meetings/ })
    ).toHaveText("Upcoming Meetings (2)");
})

test("edit meeting dropoffs", async ({ page }) => {
    await page.route("**/api/clients", async route => {
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([
                { _id: "client-2", name: "test2" }
            ]),
        });
    });

    const row = page.locator("table").first().locator("tbody tr").nth(1);
    await row.click();
    await expect(page).toHaveURL(/\/meetings\/2/);
    await expect(page.getByRole("heading", { name: 'Meeting #2' })).toBeVisible();

    await page.getByRole("button", { name: "Edit" }).click();
    await expect(page.getByRole("heading", { name: 'Edit meeting #2' })).toBeVisible();
    await expect(page.getByLabel("Date")).toHaveValue("2026-06-01T16:45");

    await page.getByLabel("Date").fill("2026-06-01T17:45");
    await page.getByRole("button", { name: "Submit Entry" }).click();

    await expect(page.getByText(/Date \+ time:/)).toContainText("Mon, 6/1/26, 05:45 PM");
})

test("edit meeting pickup", async ({ page }) => {
    await page.route("**/api/clients", async route => {
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([
                { _id: "client-2", name: "test2" }
            ]),
        });
    });

    const row = page.locator("table").first().locator("tbody tr").nth(1);
    await row.click();
    await expect(page).toHaveURL(/\/meetings\/2/);
    await expect(page.getByRole("heading", { name: 'Meeting #2' })).toBeVisible();

    await page.getByRole("button", { name: "Edit" }).click();
    await expect(page.getByRole("heading", { name: 'Edit meeting #2' })).toBeVisible();
    await expect(page.getByLabel("Drop Off")).toBeChecked();

    await page.getByLabel("Pickup").check();
    await page.locator('textarea').fill("fill description");
    await page.getByRole("button", { name: "Submit Entry" }).click();

    await expect(page.getByText("Pickup: fill description")).toBeVisible();

    await page.getByRole("button", { name: "Edit" }).click();
    await page.locator('textarea').clear();
    await page.getByRole("button", { name: "Submit Entry" }).click();
    await expect(page.locator('p', { hasText: 'Notes:' })).toHaveText('Notes: Pickup');
})

test("dropoff alterationids are visible in notes", async ({ page }) => {
    const row = page.locator("table").first().locator("tbody tr").nth(1);
    await row.click();
    await expect(page).toHaveURL(/\/meetings\/2/);
    await expect(page.getByRole("heading", { name: 'Meeting #2' })).toBeVisible();

    await page.getByText("4", { exact: true }).click();
    await expect(page).toHaveURL(/\/todo\/4/);
    await expect(page.getByRole("heading", { name: 'Todo #4' })).toBeVisible();

})

test("delete todo item removes it from dropoff meeting ", async ({ page }) => {
    const row = page.locator("table").first().locator("tbody tr").nth(1);
    await row.click();
    await expect(page).toHaveURL(/\/meetings\/2/);
    await expect(page.getByRole("heading", { name: 'Meeting #2' })).toBeVisible();

    await page.getByText("4", { exact: true }).click();
    await expect(page).toHaveURL(/\/todo\/4/);
    await expect(page.getByRole("heading", { name: 'Todo #4' })).toBeVisible();

    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Delete" }).nth(1).click();

    //back to meetings
    await page.getByRole("link", { name: /meetings/i }).click();
    //only 1 row should be left
    const rows = page.locator("table").first().locator("tbody tr");
    await expect(rows).toHaveCount(1);
    await expect(rows.first().getByRole("cell").first()).toHaveText("1");
})

test("completing meeting marks alteration as dropped off", async ({ page }) => {
    const row = page.locator("table").first().locator("tbody tr").nth(1);
    await row.click();
    await expect(page).toHaveURL(/\/meetings\/2/);
    await expect(page.getByRole("heading", { name: 'Meeting #2' })).toBeVisible();

    await page.getByRole("button", { name: "Complete" }).click();
    await expect(page.getByText(/Status:/)).toContainText("Complete");

    await page.getByText("4", { exact: true }).click();
    await expect(page).toHaveURL(/\/todo\/4/);
    await expect(page.getByText(/Status:/)).toContainText("Dropped Off");
});

test("meeting not found", async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Username').fill("testuser");
    await page.getByLabel('Password').fill("testpass");
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/);
    await page.goto('/meetings/312313213');
    await expect(page).toHaveURL(/meetings\/312313213/);
    await expect(page.getByText('Meeting not found')).toBeVisible();
})
