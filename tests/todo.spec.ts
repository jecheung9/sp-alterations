import { test, expect } from "@playwright/test";


test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-05-04T10:00'));

    const todoEntries = [
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
    ];

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

        if (request.method() === "DELETE") {
            const url = request.url();
            const id = Number(url.split("/").pop());
            const index = todoEntries.findIndex(item => item.id === id);
            if (index !== -1) {
                todoEntries.splice(index, 1);
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
            body: JSON.stringify(todoEntries),
        });
    });


    await page.goto('/');
    await page.getByLabel('Username').fill("testuser");
    await page.getByLabel('Password').fill("testpass");
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.getByRole('link', { name: /To-Do/i }).click();
    await expect(page).toHaveURL(/todo/);
})


test("todos table", async ({ page }) => {
    await expect(
        page.getByRole("heading", { name: /To-Do/i })
    ).toContainText("To-Do (2)");

    const header = page.locator("table").first().locator("thead th");
    await expect(header.nth(0)).toHaveText("id");
    await expect(header.nth(1)).toHaveText("Due Date");
    await expect(header.nth(2)).toHaveText("Status");
    await expect(header.nth(3)).toHaveText("Client");
    await expect(header.nth(4)).toHaveText("Price");
    await expect(header.nth(5)).toHaveText("Description");

    const rows = page.locator("table").first().locator("tbody tr");
    await expect(rows).toHaveCount(2);

    const firstRow = rows.nth(0);
    const firstRowCells = firstRow.getByRole("cell");
    await expect(firstRowCells.nth(0)).toHaveText("1");
    await expect(firstRowCells.nth(1)).toHaveText("Sun, 5/3/26");
    await expect(firstRowCells.nth(2)).toHaveText("Not Started");
    await expect(firstRowCells.nth(3)).toHaveText("test");
    await expect(firstRowCells.nth(4)).toHaveText("40");
    await expect(firstRowCells.nth(5)).toHaveText("test");


    const secondRow = rows.nth(1);
    const secondRowCells = secondRow.getByRole("cell");
    await expect(secondRowCells.nth(0)).toHaveText("2");
    await expect(secondRowCells.nth(1)).toHaveText("Tue, 5/5/26");
    await expect(secondRowCells.nth(2)).toHaveText("Started");
    await expect(secondRowCells.nth(3)).toHaveText("test2");
    await expect(secondRowCells.nth(4)).toHaveText("50");
    await expect(secondRowCells.nth(5)).toHaveText("test2");

    //colors
    const dueCell = firstRowCells.nth(1);
    await expect(dueCell).toHaveClass(/text-red-600/);
    await expect(dueCell).toHaveClass(/font-bold/);

    const notStartedCell = firstRowCells.nth(2);
    await expect(notStartedCell).toHaveClass(/bg-\[#e74c3c\]/);
    await expect(notStartedCell).toHaveClass(/text-white/);

    const startedCell = secondRowCells.nth(2);
    await expect(startedCell).toHaveClass(/bg-\[#f1c40f\]/);
})

test("completed not delivered table", async ({ page }) => {
    await expect(
        page.getByRole("heading", { name: /Completed - Not Delivered/ })
    ).toContainText("Completed - Not Delivered (1)");

    const header = page.locator("table").nth(1).locator("thead th");
    await expect(header.nth(0)).toHaveText("id");
    await expect(header.nth(1)).toHaveText("Due Date");
    await expect(header.nth(2)).toHaveText("Status");
    await expect(header.nth(3)).toHaveText("Client");
    await expect(header.nth(4)).toHaveText("Price");
    await expect(header.nth(5)).toHaveText("Description");

    const rows = page.locator("table").nth(1).locator("tbody tr");
    await expect(rows).toHaveCount(1);

    const firstRow = rows.nth(0);
    const firstRowCells = firstRow.getByRole("cell");
    await expect(firstRowCells.nth(0)).toHaveText("3");
    await expect(firstRowCells.nth(1)).toHaveText("Tue, 5/5/26");
    await expect(firstRowCells.nth(2)).toHaveText("Complete");
    await expect(firstRowCells.nth(3)).toHaveText("test3");
    await expect(firstRowCells.nth(4)).toHaveText("60");
    await expect(firstRowCells.nth(5)).toHaveText("test3");

    //colors
    const statusCell = firstRowCells.nth(2);
    await expect(statusCell).toHaveClass(/bg-\[#2ecc71\]/);
    await expect(statusCell).toHaveClass(/text-white/);
})

test("delivered table collapsed", async ({ page }) => {
    await expect(page.getByRole("button", { name: 'Expand' })).toBeVisible();
    await expect(page.locator("table")).toHaveCount(2);
})

test("expand collapse button", async ({ page }) => {
    await expect(page.getByRole("button", { name: 'Expand' })).toBeVisible();
    await expect(page.locator("table")).toHaveCount(2);
    await page.getByRole("button", { name: 'Expand' }).click();
    await expect(page.getByRole("button", { name: 'Collapse' })).toBeVisible();
    await expect(page.locator("table")).toHaveCount(3);
})

test("delivered table expanded", async ({ page }) => {
    await expect(page.getByRole("button", { name: 'Expand' })).toBeVisible();
    await page.getByRole("button", { name: 'Expand' }).click();
    await expect(page.getByRole("button", { name: 'Collapse' })).toBeVisible();


    await expect(
        page.getByRole("heading", { name: /Completed - Dropped Off/ })
    ).toContainText("Completed - Dropped Off (1)");

    const header = page.locator("table").nth(2).locator("thead th");
    await expect(header.nth(0)).toHaveText("id");
    await expect(header.nth(1)).toHaveText("Due Date");
    await expect(header.nth(2)).toHaveText("Status");
    await expect(header.nth(3)).toHaveText("Client");
    await expect(header.nth(4)).toHaveText("Price");
    await expect(header.nth(5)).toHaveText("Description");

    const rows = page.locator("table").nth(2).locator("tbody tr");
    await expect(rows).toHaveCount(1);

    const firstRow = rows.nth(0);
    const firstRowCells = firstRow.getByRole("cell");
    await expect(firstRowCells.nth(0)).toHaveText("4");
    await expect(firstRowCells.nth(1)).toHaveText("Tue, 5/5/26");
    await expect(firstRowCells.nth(2)).toHaveText("Dropped Off");
    await expect(firstRowCells.nth(3)).toHaveText("test4");
    await expect(firstRowCells.nth(4)).toHaveText("70");
    await expect(firstRowCells.nth(5)).toHaveText("test4");
})

test("empty messages", async ({ page }) => {
    await page.route("**/api/todo", async route => {
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
    await page.getByRole('link', { name: /To-Do/i }).click();
    await expect(page).toHaveURL(/todo/);

    //headings
    await expect(
        page.getByRole("heading", { name: /To-Do/ })
    ).toHaveText("To-Do (0)");
    await expect(
        page.getByRole("heading", { name: /Completed - Not Delivered/ })
    ).toHaveText("Completed - Not Delivered (0)");
    await expect(
        page.getByRole("heading", { name: /Completed - Dropped Off/ })
    ).toHaveText("Completed - Dropped Off (0)");

    //empty messages
    await expect(
        page.getByText("No upcoming to-dos!")
    ).toBeVisible();
    await expect(
        page.getByText("No completed items yet!")
    ).toBeVisible();
    await expect(
        page.getByText("No completed and dropped off items yet!")
    ).toBeVisible();

})


//todo details tests
test("click an item and view details and buttons", async ({ page }) => {
    const row = page.locator("table").first().locator("tbody tr").first();
    await row.click();
    await expect(page).toHaveURL(/\/todo\/1/);
    await expect(page.getByRole("heading", { name: 'Todo #1' })).toBeVisible();

    await expect(page.getByText(/Status:/)).toContainText("Not Started");
    await expect(page.getByText(/Client:/)).toContainText("test");
    await expect(page.getByText(/Due:/)).toContainText("Sun, 5/3/26");
    await expect(page.getByText(/Price:/)).toContainText("40");
    await expect(page.getByText(/Description:/)).toContainText("test");

    await expect(page.getByRole("button", { name: "Not Started" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Started", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Complete" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Dropped Off" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Edit" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Delete" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Return back to To-do list" })).toBeVisible();
})

test("status button functionalities", async ({ page }) => {
    const row = page.locator("table").first().locator("tbody tr").first();
    await row.click();
    await expect(page).toHaveURL(/\/todo\/1/);
    await expect(page.getByRole("heading", { name: 'Todo #1' })).toBeVisible();

    await page.getByRole("button", { name: "Started", exact: true }).click();
    await expect(page.getByText(/Status:\s*Started/)).toBeVisible();
    await page.getByRole("button", { name: "Complete" }).click();
    await expect(page.getByText(/Status:/)).toContainText("Complete");
    await page.getByRole("button", { name: "Dropped Off" }).click();
    await expect(page.getByText(/Status:/)).toContainText("Dropped Off");
    await page.getByRole("button", { name: "Not Started" }).click();
    await expect(page.getByText(/Status:/)).toContainText("Not Started");
})

test("delete todo #1", async ({ page }) => {
    const row = page.locator("table").first().locator("tbody tr").first();
    await row.click();
    await expect(page).toHaveURL(/\/todo\/1/);

    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Delete" }).nth(1).click();

    await expect(page).toHaveURL(/todo/);
    await expect(page.locator("table").first().locator("tbody tr")).toHaveCount(1);
    await expect(page.locator("table").first().locator("tbody tr").first().getByRole("cell").nth(0)).toHaveText("2");
})

test("undo delete todo #1", async ({ page }) => {
    const row = page.locator("table").first().locator("tbody tr").first();
    await row.click();
    await expect(page).toHaveURL(/\/todo\/1/);

    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Delete" }).nth(1).click();

    await expect(page).toHaveURL(/todo/);
    await expect(page.locator("table").first().locator("tbody tr")).toHaveCount(1);
    await expect(page.locator("table").first().locator("tbody tr").first().getByRole("cell").nth(0)).toHaveText("2");

    await expect(page.getByRole("button", { name: "Undo" })).toBeVisible();
    await page.getByRole("button", { name: "Undo" }).click();

    await expect(page.locator("table").first().locator("tbody tr")).toHaveCount(2);
    await expect(page.locator("table").first().locator("tbody tr").first().getByRole("cell").nth(0)).toHaveText("1");
})

test("return back to to-do list button", async ({ page }) => {
    const row = page.locator("table").first().locator("tbody tr").first();
    await row.click();
    await expect(page).toHaveURL(/\/todo\/1/);

    await page.getByRole("button", { name: "Return back to To-do list" }).click();

    await expect(
        page.getByRole("heading", { name: /To-Do/ })
    ).toHaveText("To-Do (2)");
})

test("edit todo", async ({ page }) => {
    await page.route("**/api/clients", async route => {
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([
                { _id: "client-1", name: "test2" }
            ]),
        });
    });

    const row = page.locator("table").first().locator("tbody tr").nth(1);
    await row.click();
    await expect(page).toHaveURL(/\/todo\/2/);
    await expect(page.getByRole("heading", { name: 'Todo #2' })).toBeVisible();

    await page.getByRole("button", { name: "Edit" }).click();
    await expect(page.getByRole("heading", { name: 'Edit todo alteration #2' })).toBeVisible();

    await expect(page.getByLabel("Date")).toHaveValue("2026-05-05");
    await expect(page.getByLabel("Price")).toHaveValue("50");
    await expect(page.getByLabel("Description")).toHaveValue("test2");

    await page.selectOption('#client', 'client-1');
    await page.getByLabel("Price").fill("70");
    await page.getByRole("button", { name: "Submit Entry" }).click();

    await expect(page.getByText(/Price:/)).toContainText("70");
})


