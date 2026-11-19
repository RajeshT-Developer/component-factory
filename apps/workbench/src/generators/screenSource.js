import { generateButtonSource } from "./buttonSource.js";
import { generateDropdownFiles } from "./dropdownSource.js";

import { validateScreenConfig } from "../models/screenConfig.js";

import screenCss from "../styles/screen.css?raw";
import {
  generateScreenFrameworkFiles
} from "./screenFrameworkSource.js";

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function extractElement(html, selector) {
  const document = new DOMParser().parseFromString(
    html,
    "text/html"
  );

  const element = document.querySelector(selector);

  if (!element) {
    throw new Error(`Generated component is missing: ${selector}`);
  }

  return element;
}

export function generateScreenFiles(
  screenConfig,
  buttonConfig,
  dropdownConfig,
  framework = "html"
) {
  if (!validateScreenConfig(screenConfig).valid) {
    return [];
  }

    if (framework === "react" || framework === "vue") {
        return generateScreenFrameworkFiles(
        screenConfig,
        buttonConfig,
        dropdownConfig,
        framework
        );
    }

    if (framework !== "html") {
        throw new Error(
        `Unsupported screen framework: ${framework}`
        );
    }

  const buttonOutput = generateButtonSource(
    buttonConfig,
    "html"
  );

  const dropdownFiles = generateDropdownFiles(
    dropdownConfig,
    "html"
  );

  if (!buttonOutput || dropdownFiles.length === 0) {
    return [];
  }

  const dropdownHtml = dropdownFiles.find(
    file => file.filename === "index.html"
  );

  const dropdownJavascript = dropdownFiles.find(
    file => file.filename === "dropdown.js"
  );

  const dropdownStylesheet = dropdownFiles.find(
    file => file.filename === "dropdown.css"
  );

  if (
    !dropdownHtml ||
    !dropdownJavascript ||
    !dropdownStylesheet
  ) {
    throw new Error("The dropdown export is incomplete.");
  }

  const button = extractElement(
    buttonOutput.source,
    "button.ui-button"
  );

  button.id = "screen-primary-action";

  const dropdown = extractElement(
    dropdownHtml.source,
    "[data-dropdown]"
  );

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(screenConfig.title)}</title>
  <link rel="stylesheet" href="./button.css">
  <link rel="stylesheet" href="./dropdown.css">
  <link rel="stylesheet" href="./screen.css">
  <script src="./screen.js" defer></script>
</head>
<body>
  <main class="screen-shell">
    <header class="screen-header">
      <h1>${escapeHtml(screenConfig.title)}</h1>
      <p>${escapeHtml(screenConfig.description)}</p>
    </header>

    <div class="screen-toolbar" role="group" aria-label="Screen actions">
      ${dropdown.outerHTML}
      ${button.outerHTML}
    </div>

    <p id="action-result" class="screen-feedback" role="status">
      Choose a navigation item or an action.
    </p>

    <section
      id="factory-cars"
      class="screen-content"
      aria-labelledby="screen-content-title"
    >
      <h2 id="screen-content-title">${escapeHtml(screenConfig.contentHeading)}</h2>
      <p>${escapeHtml(screenConfig.contentText)}</p>
    </section>
  </main>
</body>
</html>
`;

  const javascript = `${dropdownJavascript.source}

;(() => {
  const button = document.querySelector("#screen-primary-action");
  const result = document.querySelector("#action-result");

  button?.addEventListener("click", () => {
    if (button.disabled) return;

    if (result) {
      result.textContent =
        "Primary action received. Connect your application behavior.";
    }

    button.dispatchEvent(
      new CustomEvent("screen-action", {
        bubbles: true,
        detail: { action: "primary-action" }
      })
    );
  });

  // Application integration:
  //
  // document.addEventListener("screen-action", event => {
  //   Handle event.detail.action here.
  // });
  //
  // Dropdown actions use the existing dropdown-action event.
})();
`;

  return [
    {
      filename: "index.html",
      mimeType: "text/html",
      source: html
    },
    {
      filename: "button.css",
      mimeType: "text/css",
      source: buttonOutput.stylesheet
    },
    {
      filename: "dropdown.css",
      mimeType: "text/css",
      source: dropdownStylesheet.source
    },
    {
      filename: "screen.css",
      mimeType: "text/css",
      source: screenCss
    },
    {
      filename: "screen.js",
      mimeType: "text/javascript",
      source: javascript
    }
  ];
}

export function createScreenPreview(files) {
  if (!files.length) return "";

  let html = files.find(
    file => file.filename === "index.html"
  )?.source;

  if (!html) return "";

  for (const filename of [
    "button.css",
    "dropdown.css",
    "screen.css"
  ]) {
    const stylesheet = files.find(
      file => file.filename === filename
    );

    if (!stylesheet) {
      throw new Error(`Preview stylesheet is missing: ${filename}`);
    }

    html = html.replace(
      `<link rel="stylesheet" href="./${filename}">`,
      () => `<style>${stylesheet.source}</style>`
    );
  }

  const javascript = files.find(
    file => file.filename === "screen.js"
  );

  if (!javascript) {
    throw new Error("Preview JavaScript is missing.");
  }

  // Only the preview suppresses navigation out of the screen.
  const previewNavigation = `
document.addEventListener("click", event => {
  if (!(event.target instanceof Element)) return;

  const link = event.target.closest("a");

  if (!link) return;

  event.preventDefault();

  const result = document.querySelector("#action-result");

  if (result) {
    result.textContent =
      "Preview destination: " + link.getAttribute("href");
  }
});
`;

  const inlineJavascript = (
    javascript.source + "\n" + previewNavigation
  ).replace(/<\/script/gi, "<\\/script");

  // Inline runtime must run after the preview markup exists.
  html = html.replace(
    '<script src="./screen.js" defer></script>',
    ""
  );

  html = html.replace(
    "</body>",
    () => `<script>${inlineJavascript}</script>\n</body>`
  );

  return html;
}