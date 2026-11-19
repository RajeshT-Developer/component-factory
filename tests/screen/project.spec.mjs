import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
async function saveProject(page) {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Save project", exact: true }).click()
  ]);
  expect(await download.failure()).toBeNull();
  return JSON.parse(await readFile(await download.path(), "utf8"));
}
async function openProject(page, project) {
  await page.getByLabel("Choose project file", { exact: true }).setInputFiles({
    name: "round-trip.project.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(project))
  });
  await page.getByRole("button", { name: "Open project", exact: true }).click();
}
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Mode", { exact: true }).selectOption("screen");
  await page.getByLabel("Content type", { exact: true }).selectOption("table");
});
test("project download and open restore applied table configuration", async ({ page }) => {
  const rows = [{ id: "saved-1", model: "Saved vehicle", status: "Available" }];
  await page.getByLabel("Content heading", { exact: true }).fill("Saved inventory");
  await page.getByLabel("Sample rows (JSON)", { exact: true }).fill(JSON.stringify(rows));
  await page.getByRole("button", { name: "Apply table changes", exact: true }).click();
  const preview = page.frameLocator('iframe[title="Generated screen preview"]');
  await expect(preview.getByRole("cell", { name: "Saved vehicle", exact: true })).toBeVisible();
  const project = await saveProject(page);
  expect(project.schemaVersion).toBe(1);
  expect(project.screenConfig.table.rows).toEqual(rows);
  await page.getByLabel("Content heading", { exact: true }).fill("Changed after save");
  await page.getByLabel("Sample rows (JSON)", { exact: true }).fill("[]");
  await page.getByRole("button", { name: "Apply table changes", exact: true }).click();
  await page.getByLabel("Mode", { exact: true }).selectOption("components");
  await openProject(page, project);
  await expect(page.getByLabel("Mode", { exact: true })).toHaveValue("screen");
  await expect(page.getByLabel("Content heading", { exact: true })).toHaveValue("Saved inventory");
  await expect(preview.getByRole("cell", { name: "Saved vehicle", exact: true })).toBeVisible();
});
test("legacy project files without table fields still open as text screens", async ({ page }) => {
  const project = await saveProject(page);
  delete project.screenConfig.contentMode;
  delete project.screenConfig.table;
  await openProject(page, project);
  await expect(page.getByLabel("Content type", { exact: true })).toHaveValue("text");
  await expect(page.frameLocator('iframe[title="Generated screen preview"]').getByRole("table")).toHaveCount(0);
});
