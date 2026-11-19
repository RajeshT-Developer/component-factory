import dropdownCss from "../../../../shared/dropdown/dropdown.css?raw";
import dropdownRuntime from "../../../../shared/dropdown/dropdown.js?raw";

import {
  validateDropdownConfig
} from "../models/dropdownConfig.js";

import {
  generateDropdownFrameworkFiles
} from "./dropdownFrameworkSource.js";

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function itemMarkup(item) {
  const label = escapeHtml(item.label);
  const id = escapeHtml(item.id);

  if (item.type === "link") {
    return `          <li>
            <a
              class="ui-dropdown__item"
              href="${escapeHtml(item.href)}"
              data-dropdown-item
              data-item-id="${id}"
            >${label}</a>
          </li>`;
  }

  return `          <li hidden data-dropdown-action-row>
            <button
              class="ui-dropdown__item"
              type="button"
              data-dropdown-item
              data-item-id="${id}"
              data-action="${escapeHtml(item.action)}"${item.disabled ? "\n              disabled" : ""}
            >${label}</button>
          </li>`;
}

function htmlSource(config) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Configured dropdown</title>
  <link rel="stylesheet" href="./dropdown.css">
  <script src="./dropdown.js" defer></script>

  <style>
    body {
      margin: 0;
      padding: 1.5rem;
      font-family: system-ui, sans-serif;
      line-height: 1.5;
    }

    main {
      max-width: 60rem;
      margin-inline: auto;
    }

    .export-toolbar {
      display: flex;
    }

    .export-toolbar--end {
      justify-content: flex-end;
    }

    #action-result {
      min-height: 1.5rem;
      overflow-wrap: anywhere;
    }
  </style>
</head>
<body>
  <main>
    <h1>Configured dropdown</h1>

    <div class="export-toolbar${config.align === "end" ? " export-toolbar--end" : ""}">
      <div
        class="ui-dropdown"
        data-dropdown
        data-align="${escapeHtml(config.align)}"
      >
        <button
          class="ui-dropdown__trigger"
          type="button"
          data-dropdown-trigger
          aria-expanded="false"
          aria-controls="export-dropdown-panel"
          hidden
        >
          <span>${escapeHtml(config.label)}</span>
          <span
            class="ui-dropdown__chevron"
            aria-hidden="true"
          ></span>
        </button>

        <ul
          id="export-dropdown-panel"
          class="ui-dropdown__panel"
          data-dropdown-panel
        >
${config.items.map(itemMarkup).join("\n")}
        </ul>
      </div>
    </div>

    <p id="action-result" role="status">
      No action selected yet.
    </p>

    <section id="factory-cars">
      <h2>Cars</h2>
      <p>Default example destination. Replace this section with your content.</p>
    </section>
  </main>
</body>
</html>
`;
}

function javascriptSource() {
  return `${dropdownRuntime}

;(() => {
  const result = document.querySelector("#action-result");

  document.addEventListener("dropdown-action", event => {
    if (!result) return;

    result.textContent =
      "Action received: " + event.detail.action +
      ". Add your application handler for this action.";

    // Connect application behavior here.
    // event.detail contains action and itemId.
  });

  document.querySelectorAll("[data-dropdown]").forEach(root => {
    window.ComponentFactoryDropdown.init(root);
  });
})();
`;
}

export function generateDropdownFiles(config, framework = "html") {
  if (!validateDropdownConfig(config).valid) {
    return [];
  }

  if (framework === "react" || framework === "vue") {
    return generateDropdownFrameworkFiles(config, framework);
  }

  if (framework !== "html") {
    throw new Error(
      `Unsupported dropdown framework: ${framework}`
    );
  }

  return [
    {
      filename: "index.html",
      mimeType: "text/html",
      source: htmlSource(config)
    },
    {
      filename: "dropdown.css",
      mimeType: "text/css",
      source: dropdownCss
    },
    {
      filename: "dropdown.js",
      mimeType: "text/javascript",
      source: javascriptSource()
    }
  ];
}