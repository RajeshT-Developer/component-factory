import buttonCss from "../styles/button.css?raw";
import { validateButtonConfig } from "../models/buttonConfig.js";

export const outputFrameworks = [
  { value: "html", label: "HTML" },
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" }
];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function jsString(value) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function iconMarkup(framework) {
  const react = framework === "react";
  const classAttribute = react ? "className" : "class";
  const strokeWidth = react ? "strokeWidth" : "stroke-width";
  const strokeLinecap = react ? "strokeLinecap" : "stroke-linecap";

  return `    <span ${classAttribute}="ui-button__icon" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        ${strokeWidth}="2"
        ${strokeLinecap}="round"
        focusable="false"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
    </span>`;
}

function buttonMarkup(config, framework) {
  const react = framework === "react";
  const classAttribute = react ? "className" : "class";

  const disabledAttribute = config.disabled
    ? react
      ? " disabled={true}"
      : " disabled"
    : "";

  let label;

  if (framework === "react") {
    label = `{${jsString(config.label)}}`;
  } else if (framework === "vue") {
    label = "{{ label }}";
  } else {
    label = escapeHtml(config.label);
  }

  const children = [];

  if (config.icon === "plus") {
    children.push(iconMarkup(framework));
  }

  children.push(
    `    <span ${classAttribute}="ui-button__label">${label}</span>`
  );

  return `  <button
    ${classAttribute}="ui-button"
    type="${escapeHtml(config.type)}"${disabledAttribute}
  >
${children.join("\n")}
  </button>`;
}

function htmlSource(config) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Configured button</title>
  <link rel="stylesheet" href="./button.css">
</head>
<body>
${buttonMarkup(config, "html")}
</body>
</html>
`;
}

function reactSource(config) {
  const markup = buttonMarkup(config, "react").replace(
    "  <button\n",
    "  <button\n    onClick={onClick}\n"
  );

  return `import "./button.css";

export default function ConfiguredButton({ onClick } = {}) {
  return (
${markup}
  );
}
`;
}

function vueSource(config) {
  return `<script setup>
import "./button.css";

const label = ${jsString(config.label)};
</script>

<template>
${buttonMarkup(config, "vue")}
</template>
`;
}

export function generateButtonSource(config, framework) {
  const validation = validateButtonConfig(config);

  if (!validation.valid) {
    return null;
  }

  const generators = {
    html: {
      filename: "index.html",
      mimeType: "text/html",
      generate: htmlSource
    },
    react: {
      filename: "ConfiguredButton.jsx",
      mimeType: "text/plain",
      generate: reactSource
    },
    vue: {
      filename: "ConfiguredButton.vue",
      mimeType: "text/plain",
      generate: vueSource
    }
  };

  if (!Object.hasOwn(generators, framework)) {
    throw new Error(`Unsupported output framework: ${framework}`);
  }

  const generator = generators[framework];

  return {
    filename: generator.filename,
    mimeType: generator.mimeType,
    source: generator.generate(config),
    stylesheetFilename: "button.css",
    stylesheet: buttonCss
  };
}