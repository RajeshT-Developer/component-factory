import { generateButtonSource } from "./buttonSource.js";
import { generateDropdownFiles } from "./dropdownSource.js";

import screenCss from "../styles/screen.css?raw";

function serialize(value) {
  return JSON.stringify(value, null, 2)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function file(filename, source, mimeType = "text/plain") {
  return { filename, source, mimeType };
}

function combineFiles(files) {
  const result = new Map();

  for (const current of files) {
    const previous = result.get(current.filename);

    if (previous && previous.source !== current.source) {
      throw new Error(
        `Conflicting exported files: ${current.filename}`
      );
    }

    if (!previous) {
      result.set(current.filename, current);
    }
  }

  return [...result.values()];
}

function reactScreenSource(screenConfig) {
  return `import { useState } from "react";
import ConfiguredButton from "./ConfiguredButton.jsx";
import ConfiguredDropdown from "./ConfiguredDropdown.jsx";
import "./screen.css";

const screen = ${serialize(screenConfig)};

export default function ConfiguredScreen({
  onPrimaryAction,
  onDropdownAction
} = {}) {
  const [status, setStatus] = useState("");

  function handlePrimaryAction(event) {
    setStatus("Primary action received.");
    onPrimaryAction?.(event);
  }

  return (
    <main className="screen-shell">
      <header className="screen-header">
        <h1>{screen.title}</h1>
        <p>{screen.description}</p>
      </header>

      <div
        className="screen-toolbar"
        role="group"
        aria-label="Screen actions"
      >
        <ConfiguredDropdown onAction={onDropdownAction} />
        <ConfiguredButton onClick={handlePrimaryAction} />
      </div>

      <p className="screen-feedback" role="status">
        {status}
      </p>

      <section
        id="factory-cars"
        className="screen-content"
        aria-labelledby="screen-content-title"
      >
        <h2 id="screen-content-title">
          {screen.contentHeading}
        </h2>

        <p>{screen.contentText}</p>
      </section>
    </main>
  );
}
`;
}

function vueScreenSource(screenConfig) {
  return `<script setup>
import { ref, useId } from "vue";
import ConfiguredButton from "./ConfiguredButton.vue";
import ConfiguredDropdown from "./ConfiguredDropdown.vue";
import "./screen.css";

const screen = ${serialize(screenConfig)};
const contentTitleId = useId();
const status = ref("");

const emit = defineEmits(["primary-action", "dropdown-action"]);

function handlePrimaryAction(event) {
  status.value = "Primary action received.";
  emit("primary-action", event);
}

function handleDropdownAction(action, item) {
  emit("dropdown-action", action, item);
}
</script>

<template>
  <main class="screen-shell">
    <header class="screen-header">
      <h1>{{ screen.title }}</h1>
      <p>{{ screen.description }}</p>
    </header>

    <div
      class="screen-toolbar"
      role="group"
      aria-label="Screen actions"
    >
      <ConfiguredDropdown @action="handleDropdownAction" />
      <ConfiguredButton @click="handlePrimaryAction" />
    </div>

    <p class="screen-feedback" role="status">
      {{ status }}
    </p>

    <section
      id="factory-cars"
      class="screen-content"
      :aria-labelledby="contentTitleId"
    >
      <h2 :id="contentTitleId">
        {{ screen.contentHeading }}
      </h2>

      <p>{{ screen.contentText }}</p>
    </section>
  </main>
</template>
`;
}

export function generateScreenFrameworkFiles(
  screenConfig,
  buttonConfig,
  dropdownConfig,
  framework
) {
  if (!["react", "vue"].includes(framework)) {
    throw new Error(`Unsupported screen framework: ${framework}`);
  }

  const button = generateButtonSource(
    buttonConfig,
    framework
  );

  const dropdownFiles = generateDropdownFiles(
    dropdownConfig,
    framework
  );

  if (!button || dropdownFiles.length === 0) {
    return [];
  }

  const screenFilename = framework === "react"
    ? "ConfiguredScreen.jsx"
    : "ConfiguredScreen.vue";

  const screenSource = framework === "react"
    ? reactScreenSource(screenConfig)
    : vueScreenSource(screenConfig);

  return combineFiles([
    file(screenFilename, screenSource),

    file(button.filename, button.source, button.mimeType),

    file(
      button.stylesheetFilename,
      button.stylesheet,
      "text/css"
    ),

    ...dropdownFiles,

    file("screen.css", screenCss, "text/css")
  ]);
}