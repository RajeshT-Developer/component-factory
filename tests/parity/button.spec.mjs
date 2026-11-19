import { test, expect } from "@playwright/test";

function scenarioCard(page, scenarioId) {
  return page.locator(
    `article[data-scenario="${scenarioId}"]`
  );
}

function scenarioButton(page, scenarioId) {
  return scenarioCard(page, scenarioId)
    .getByRole("button");
}

function loggedEvents(page, scenarioId, eventType) {
  return page.locator(
    `#event-list > li` +
    `[data-scenario="${scenarioId}"]` +
    `[data-event-type="${eventType}"]`
  );
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "Button scenarios",
      exact: true
    })
  ).toBeVisible();

  await expect(
    page.locator("article[data-scenario]")
  ).toHaveCount(4);
});

test("text button has the expected semantics", async ({ page }) => {
  const button = scenarioButton(page, "text-default");

  await expect(button).toBeVisible();
  await expect(button).toBeEnabled();

  await expect(button).toHaveAccessibleName("Save changes");
  await expect(button).toHaveAttribute("type", "button");

  await expect(
    button.locator(".ui-button__icon")
  ).toHaveCount(0);

  await expect(button).toHaveJSProperty("tagName", "BUTTON");
});

test("icon is decorative and does not change the name", async ({
  page
}) => {
  const button = scenarioButton(page, "icon-default");

  await expect(button).toHaveAccessibleName("Add item");

  const icon = button.locator(".ui-button__icon");

  await expect(icon).toHaveCount(1);
  await expect(icon).toHaveAttribute("aria-hidden", "true");

  await expect(
    icon.locator("svg")
  ).toHaveCount(1);
});

test("one click produces one click entry", async ({ page }) => {
  const button = scenarioButton(page, "text-default");

  const clicks = loggedEvents(
    page,
    "text-default",
    "click"
  );

  await expect(clicks).toHaveCount(0);

  await button.click();

  await expect(clicks).toHaveCount(1);
});

test("disabled scenario uses native disabled state", async ({
  page
}) => {
  const button = scenarioButton(page, "disabled");

  await expect(button).toHaveAccessibleName("Unavailable");

  await expect(button).toHaveJSProperty("tagName", "BUTTON");
  await expect(button).toHaveJSProperty("disabled", true);

  await expect(button).toHaveAttribute("disabled", "");
  await expect(button).toBeDisabled();
});

test("keyboard focus and activation work", async ({ page }) => {
  const button = scenarioButton(page, "text-default");

  const clicks = loggedEvents(
    page,
    "text-default",
    "click"
  );

  // On these fixture pages, this is the first focusable control.
  await page.keyboard.press("Tab");

  await expect(button).toBeFocused();

  await expect(
    loggedEvents(page, "text-default", "focus")
  ).toHaveCount(1);

  await page.keyboard.press("Enter");

  await expect(clicks).toHaveCount(1);

  await page.keyboard.press("Space");

  await expect(clicks).toHaveCount(2);
});

test("hover enter and leave are logged", async ({ page }) => {
  const button = scenarioButton(page, "text-default");

  const heading = page.getByRole("heading", {
    name: "Button scenarios",
    exact: true
  });

  // Establish a starting position outside the button.
  await heading.hover();

  await button.hover();

  await expect(
    loggedEvents(page, "text-default", "mouseenter")
  ).toHaveCount(1);

  await heading.hover();

  await expect(
    loggedEvents(page, "text-default", "mouseleave")
  ).toHaveCount(1);
});

// --- disabled pointer test......
test("disabled button does not activate from a pointer click", async ({
  page
}) => {
  const disabledButton = scenarioButton(page, "disabled");

  await expect(disabledButton).toBeDisabled();

  await disabledButton.scrollIntoViewIfNeeded();

  const box = await disabledButton.boundingBox();

  expect(box).not.toBeNull();

  // Use physical pointer input because locator.click()
  // normally waits for the target to become enabled.
  await page.mouse.click(
    box.x + box.width / 2,
    box.y + box.height / 2
  );

  // Confirm that event logging is working for an enabled control.
  await scenarioButton(page, "text-default").click();

  await expect(
    loggedEvents(page, "text-default", "click")
  ).toHaveCount(1);

  await expect(
    loggedEvents(page, "disabled", "click")
  ).toHaveCount(0);
});

//____keyboard navigation and focus-style checks.......
test("keyboard skips disabled button and shows focus styling", async ({
  page
}) => {
  const textButton = scenarioButton(page, "text-default");
  const iconButton = scenarioButton(page, "icon-default");
  const disabledButton = scenarioButton(page, "disabled");
  const longLabelButton = scenarioButton(page, "long-label");

  await page.keyboard.press("Tab");

  await expect(textButton).toBeFocused();

  await expect(textButton).toHaveCSS(
    "outline-style",
    "solid"
  );

  await expect(textButton).toHaveCSS(
    "outline-width",
    "3px"
  );

  await expect(textButton).toHaveCSS(
    "outline-offset",
    "3px"
  );

  await page.keyboard.press("Tab");

  await expect(iconButton).toBeFocused();

  await page.keyboard.press("Tab");

  // The disabled scenario sits between icon and long-label.
  await expect(longLabelButton).toBeFocused();
  await expect(disabledButton).not.toBeFocused();
});


//_______hover appearance checks.......
test("hover applies the expected button background", async ({
  page
}) => {
  const button = scenarioButton(page, "text-default");

  const heading = page.getByRole("heading", {
    name: "Button scenarios",
    exact: true
  });

  await heading.hover();

  await expect(button).toHaveCSS(
    "background-color",
    "rgb(29, 78, 216)"
  );

  await button.hover();

  await expect(button).toHaveCSS(
    "background-color",
    "rgb(30, 64, 175)"
  );

  await heading.hover();

  await expect(button).toHaveCSS(
    "background-color",
    "rgb(29, 78, 216)"
  );
});

//______narrow-layout checks........
test("narrow layout keeps page and long-label button contained", async ({
  page
}) => {
  await page.setViewportSize({
    width: 375,
    height: 812
  });

  const card = scenarioCard(page, "long-label");
  const button = scenarioButton(page, "long-label");

  await expect(button).toBeVisible();

  await expect(button).toHaveAccessibleName(
    "Save all changes and continue to the next configuration step"
  );

  // No horizontal document overflow.
  await expect.poll(async () => {
    return page.evaluate(() => {
      return (
        document.documentElement.scrollWidth <=
        window.innerWidth
      );
    });
  }).toBe(true);

  // Button content stays within the button's horizontal space.
  await expect.poll(async () => {
    return button.evaluate(element => {
      return element.scrollWidth <= element.clientWidth;
    });
  }).toBe(true);

  // The button itself stays inside its scenario card.
  const cardBox = await card.boundingBox();
  const buttonBox = await button.boundingBox();

  expect(cardBox).not.toBeNull();
  expect(buttonBox).not.toBeNull();

  expect(buttonBox.x).toBeGreaterThanOrEqual(cardBox.x);

  expect(
    buttonBox.x + buttonBox.width
  ).toBeLessThanOrEqual(
    cardBox.x + cardBox.width + 1
  );
});