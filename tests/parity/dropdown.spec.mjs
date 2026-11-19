import { test, expect } from "@playwright/test";


function dropdownTrigger(page) {
  return page.getByRole("button", {
    name: "Browse",
    exact: true
  });
}

function carsLink(page) {
  return page.getByRole("link", {
    name: /^Browse cars$/i
  });
}


function filtersAction(page) {
  return page.getByRole("button", {
    name: /^Open filters$/i
  });
}

async function openDropdown(page) {
  const trigger = dropdownTrigger(page);

  await expect(trigger).toHaveAttribute("aria-expanded", "false");

  await trigger.click();

  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(carsLink(page)).toBeVisible();
  await expect(filtersAction(page)).toBeVisible();

  return trigger;
}

test.beforeEach(async ({ page }, testInfo) => {
  testInfo.skip(
    !["html", "react", "vue"].includes(testInfo.project.name),
    "Dropdown expectations are configured for HTML, React, and Vue."
  );

  await page.goto("/");

  await expect(dropdownTrigger(page)).toBeVisible();
});

test("trigger opens and closes the dropdown", async ({ page }) => {
  const trigger = await openDropdown(page);

  await trigger.click();

  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(carsLink(page)).toBeHidden();
  await expect(filtersAction(page)).toBeHidden();
});

test("navigation item is a native link with the expected destination", async ({
  page
}, testInfo) => {
  await openDropdown(page);

  const link = carsLink(page);

  await expect(link).toHaveJSProperty("tagName", "A");

  // Accept a relative or absolute href, but verify its resolved
  // destination remains on this fixture's current page.
  const actualDestination = await link.evaluate(element => element.href);

  const destinationHashes = {
  html: "html-cars",
  react: "react-cars",
  vue: "vue-cars"
};

const destinationHash = destinationHashes[testInfo.project.name];

expect(
  destinationHash,
  `Missing destination mapping for project: ${testInfo.project.name}`
).toBeTruthy();

const expectedDestination = new URL(page.url());
expectedDestination.hash = destinationHash;

  expect(actualDestination).toBe(expectedDestination.href);

  await link.click();

  await expect(page).toHaveURL(expectedDestination.href);

  await expect(dropdownTrigger(page))
    .toHaveAttribute("aria-expanded", "false");
});

test("action displays feedback without navigating", async ({ page }) => {
  await openDropdown(page);

  const originalURL = page.url();
  const action = filtersAction(page);

  await expect(action).toHaveJSProperty("tagName", "BUTTON");
  await expect(action).toHaveAttribute("type", "button");

  await action.click();

  await expect(
    page.getByText("Filters action executed.", {
      exact: true
    })
  ).toBeVisible();

  await expect(page).toHaveURL(originalURL);

  await expect(dropdownTrigger(page))
    .toHaveAttribute("aria-expanded", "false");
});

test("Escape closes the dropdown and restores trigger focus", async ({
  page
}) => {
  const trigger = await openDropdown(page);

  await carsLink(page).focus();
  await expect(carsLink(page)).toBeFocused();

  await page.keyboard.press("Escape");

  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(carsLink(page)).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("clicking outside closes the dropdown", async ({ page }) => {
  const trigger = await openDropdown(page);

  // Existing heading already verified by the button parity suite.
  await page.getByRole("heading", {
    name: "Button scenarios",
    exact: true
  }).click();

  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(carsLink(page)).toBeHidden();
});

test("keyboard can open the dropdown and reach its first link", async ({
  page
}) => {
  const trigger = dropdownTrigger(page);

  await trigger.focus();
  await expect(trigger).toBeFocused();

  await page.keyboard.press("Enter");

  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(carsLink(page)).toBeVisible();

  await page.keyboard.press("Tab");

  await expect(carsLink(page)).toBeFocused();
});