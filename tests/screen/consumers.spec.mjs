import { test, expect } from "@playwright/test";
test("host rows render and row callbacks identify the selection", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("cell", { name: "City hatchback", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "View: vehicle-2", exact: true }).click();
  await expect(page.locator(".consumer-feedback [role=status]")).toHaveText("Row action: view, row: vehicle-2.");
  expect(errors).toEqual([]);
});
test("host rows can be emptied and restored reactively", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Show empty table", exact: true }).click();
  await expect(page.getByRole("cell", { name: "No vehicles available.", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /^View:/ })).toHaveCount(0);
  await page.getByRole("button", { name: "Restore sample rows", exact: true }).click();
  await expect(page.getByRole("button", { name: /^View:/ })).toHaveCount(2);
});
test("row actions support keyboard activation at mobile width", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: "View: vehicle-1", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".consumer-feedback [role=status]")).toHaveText("Row action: view, row: vehicle-1.");
});
test("primary action still reaches the host", async ({ page }) => {
  await page.goto("/");
  await page.locator(".screen-toolbar .ui-button").click();
  await expect(page.locator(".consumer-feedback [role=status]")).toContainText("The consumer received the primary action.");
});
test("dropdown action still reaches the host without navigating", async ({ page }) => {
  await page.goto("/");
  const initialUrl = page.url();
  await page.locator(".ui-dropdown__trigger").click();
  await page.getByRole("button", { name: "New action", exact: true }).click();
  await expect(page.locator(".consumer-feedback [role=status]")).toContainText('"new-action" from item "custom-1"');
  await expect(page).toHaveURL(initialUrl);
});
test("dropdown links retain native navigation", async ({ page }) => {
  await page.goto("/");
  await page.locator(".ui-dropdown__trigger").click();
  await page.getByRole("link", { name: "Browse cars...!", exact: true }).click();
  await expect(page).toHaveURL(/#factory-cars$/);
});
