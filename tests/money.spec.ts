import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Username').fill("testuser");
    await page.getByLabel('Password').fill("testpass");
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/);
    await page.getByRole('link', { name: /money/i }).click();
    await expect(page).toHaveURL(/money/);
})

test("money page loads", async ({ page }) => {
    await expect(
        page.getByRole('heading', { name: 'Money', exact: true })
    ).toBeVisible();
});


test("summary table", async ({ page }) => {
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
    await page.getByRole('link', { name: /money/i }).click();
    await expect(page).toHaveURL(/money/);

    const summaryRow = page.getByRole("row", { name: /Year/ });
    const summaryCells = summaryRow.getByRole("columnheader");
    await expect(summaryCells.nth(0)).toHaveText("Year");
    await expect(summaryCells.nth(1)).toHaveText("test");
    await expect(summaryCells.nth(2)).toHaveText("test2");
    await expect(summaryCells.nth(3)).toHaveText("Total");

    const yearRow = page.getByRole("row", { name: /2025/ });
    const yearCells = yearRow.getByRole("cell");
    await expect(yearCells.nth(0)).toHaveText("2025");
    await expect(yearCells.nth(1)).toHaveText("50");
    await expect(yearCells.nth(2)).toHaveText("80");
    await expect(yearCells.nth(3)).toHaveText("130");

    
    const yearRow2 = page.getByRole("row", { name: /2024/ });
    const yearCells2 = yearRow2.getByRole("cell");
    await expect(yearCells2.nth(0)).toHaveText("2024");
    await expect(yearCells2.nth(1)).toHaveText("70");
    await expect(yearCells2.nth(2)).toHaveText("0");
    await expect(yearCells2.nth(3)).toHaveText("70");

    const totalRow = page.getByRole("row", { name: /Total/ });
    const totalCells = totalRow.getByRole("cell");
    await expect(totalCells.nth(0)).toHaveText("Total");
    await expect(totalCells.nth(1)).toHaveText("120");
    await expect(totalCells.nth(2)).toHaveText("80");
    await expect(totalCells.nth(3)).toHaveText("200");

});

test("monthly tables", async ({ page }) => {
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
                    due: "2025-04-30", 
                    client: { name: "test" },
                    description: "test",
                    price: 40
                },
                {
                    id: 7779,
                    type: "alteration",
                    status: "Not Started",
                    due: "2025-04-14", 
                    client: { name: "test2" },
                    description: "test",
                    price: 30
                },
                {
                    id: 7780,
                    type: "alteration",
                    status: "Complete",
                    due: "2025-04-24", 
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
    await page.getByRole('link', { name: /money/i }).click();
    await expect(page).toHaveURL(/money/);

    const mayHeading = page.getByRole("heading", { name: "May 2025" });
    await expect(mayHeading).toBeVisible();

    const maySection = mayHeading.locator("..");
    const mayTable = maySection.getByRole("table");
    const headerRow = mayTable.getByRole("row").first();

    const headers = headerRow.getByRole("columnheader");
    await expect(headers.nth(0)).toHaveText("Client");
    await expect(headers.nth(1)).toHaveText("Profit");
    await expect(headers.nth(2)).toHaveText("Incomplete");
    await expect(headers.nth(3)).toHaveText("Total");
    

    const clientRow = mayTable.getByRole("row", { name: "test" });
    const clientCells = clientRow.getByRole("cell");
    await expect(clientCells.nth(0)).toHaveText("test");
    await expect(clientCells.nth(1)).toHaveText("0");
    await expect(clientCells.nth(2)).toHaveText("50");
    await expect(clientCells.nth(3)).toHaveText("50");

    const clientRow2 = mayTable.getByRole("row", { name: "test2" });
    const clientCells2 = clientRow2.getByRole("cell");
    await expect(clientCells2.nth(0)).toHaveText("test2");
    await expect(clientCells2.nth(1)).toHaveText("0");
    await expect(clientCells2.nth(2)).toHaveText("0");
    await expect(clientCells2.nth(3)).toHaveText("0");

    const totalRow = mayTable.getByRole("row", { name: "Total" });
    const totalCells = totalRow.getByRole("cell");
    await expect(totalCells.nth(0)).toHaveText("Total");
    await expect(totalCells.nth(1)).toHaveText("0");
    await expect(totalCells.nth(2)).toHaveText("50");
    await expect(totalCells.nth(3)).toHaveText("50");




    const aprilHeading = page.getByRole("heading", { name: "April 2025" });
    await expect(aprilHeading).toBeVisible();

    const aprilSection = aprilHeading.locator("..");
    const aprilTable = aprilSection.getByRole("table");
    const headerRow2 = aprilTable.getByRole("row").first();

    const headers2 = headerRow2.getByRole("columnheader");
    await expect(headers2.nth(0)).toHaveText("Client");
    await expect(headers2.nth(1)).toHaveText("Profit");
    await expect(headers2.nth(2)).toHaveText("Incomplete");
    await expect(headers2.nth(3)).toHaveText("Total");
    

    const clientRow3 = aprilTable.getByRole("row", { name: "test" });
    const clientCells3 = clientRow3.getByRole("cell");
    await expect(clientCells3.nth(0)).toHaveText("test");
    await expect(clientCells3.nth(1)).toHaveText("0");
    await expect(clientCells3.nth(2)).toHaveText("40");
    await expect(clientCells3.nth(3)).toHaveText("40");

    const clientRow4 = aprilTable.getByRole("row", { name: "test2" });
    const clientCells4 = clientRow4.getByRole("cell");
    await expect(clientCells4.nth(0)).toHaveText("test2");
    await expect(clientCells4.nth(1)).toHaveText("80");
    await expect(clientCells4.nth(2)).toHaveText("30");
    await expect(clientCells4.nth(3)).toHaveText("110");

    const totalRow2 = aprilTable.getByRole("row", { name: "Total" });
    const totalCells2 = totalRow2.getByRole("cell");
    await expect(totalCells2.nth(0)).toHaveText("Total");
    await expect(totalCells2.nth(1)).toHaveText("80");
    await expect(totalCells2.nth(2)).toHaveText("70");
    await expect(totalCells2.nth(3)).toHaveText("150");

});