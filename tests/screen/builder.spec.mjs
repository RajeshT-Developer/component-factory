import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  page.on("pageerror", error => console.error("Workbench runtime error:", error.stack || error.message));
  await page.goto("/");
  await page.getByLabel("Mode", { exact: true }).selectOption("screen");
  await expect(page.getByRole("heading", { name: "Screen content", exact: true })).toBeVisible();
  const contentType = page.getByLabel("Content type", { exact: true });
  await expect(contentType).toHaveCount(1);
  await expect(contentType).toBeVisible();
  await contentType.selectOption("table");
});
test("table preview reports the selected row", async ({ page }) => {
  const preview = page.frameLocator('iframe[title="Generated screen preview"]');
  await expect(preview.getByRole("table")).toBeVisible();
  for (const id of ["vehicle-1", "vehicle-2"]) {
    await preview.getByRole("button", { name: `View: ${id}`, exact: true }).click();
    await expect(preview.locator(".screen-feedback")).toHaveText(`View: ${id}`);
  }
});
test("invalid sample JSON leaves the last applied preview unchanged", async ({ page }) => {
  await page.getByLabel("Sample rows (JSON)", { exact: true }).fill("{");
  await page.getByRole("button", { name: "Apply table changes", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Sample rows must be valid JSON.");
  await expect(page.frameLocator('iframe[title="Generated screen preview"]').getByRole("cell", { name: "City hatchback", exact: true })).toBeVisible();
});
test("applied empty rows survive reload instead of resetting to defaults", async ({ page }) => {
  await page.getByLabel("Sample rows (JSON)", { exact: true }).fill("[]");
  await page.getByRole("button", { name: "Apply table changes", exact: true }).click();
  await expect(page.frameLocator('iframe[title="Generated screen preview"]').getByRole("cell", { name: "No vehicles available.", exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Content type", { exact: true })).toHaveValue("table");
  await expect(page.getByLabel("Sample rows (JSON)", { exact: true })).toHaveValue("[]");
  await expect(page.frameLocator('iframe[title="Generated screen preview"]').getByRole("cell", { name: "No vehicles available.", exact: true })).toBeVisible();
});
