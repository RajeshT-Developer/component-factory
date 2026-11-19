import { generateButtonSource } from "./buttonSource.js";
import { generateDropdownFiles } from "./dropdownSource.js";
import { createDefaultTableConfig } from "../models/tableConfig.js";
import { validateScreenConfig } from "../models/screenConfig.js";
import { serialize, frameworkTable, tableCss } from "./tableSource.js";
import screenCss from "../styles/screen.css?raw";

function screenSource(config, framework) {
  const { table, ...definition } = config;
  const data = serialize(definition);
  if (framework === "react") return `import { useId, useState } from "react";
import ConfiguredButton from "./ConfiguredButton.jsx";
import ConfiguredDropdown from "./ConfiguredDropdown.jsx";
import ConfiguredTable from "./ConfiguredTable.jsx";
import "./screen.css";
const screen = ${data};
export default function ConfiguredScreen({ rows = [], onPrimaryAction, onDropdownAction, onRowAction } = {}) {
  const titleId = useId();
  const [status, setStatus] = useState("");
  function primary(event) { setStatus("Primary action received."); onPrimaryAction?.(event); }
  return <main className="screen-shell">
    <header className="screen-header"><h1>{screen.title}</h1><p>{screen.description}</p></header>
    <div className="screen-toolbar" role="group" aria-label="Screen actions"><ConfiguredDropdown onAction={onDropdownAction} /><ConfiguredButton onClick={primary} /></div>
    <p className="screen-feedback" role="status">{status}</p>
    <section id="factory-cars" className="screen-content" aria-labelledby={titleId}>
      <h2 id={titleId}>{screen.contentHeading}</h2>
      {screen.contentMode === "table" ? <ConfiguredTable rows={rows} onRowAction={onRowAction} /> : <p>{screen.contentText}</p>}
    </section>
  </main>;
}
`;
  return `<script setup>
import { ref, useId } from "vue";
import ConfiguredButton from "./ConfiguredButton.vue";
import ConfiguredDropdown from "./ConfiguredDropdown.vue";
import ConfiguredTable from "./ConfiguredTable.vue";
import "./screen.css";
const screen = ${data};
const props = defineProps({ rows: { type: Array, default: () => [] } });
const emit = defineEmits(["primary-action", "dropdown-action", "row-action"]);
const titleId = useId();
const status = ref("");
function primary(event) { status.value = "Primary action received."; emit("primary-action", event); }
function dropdown(action, item) { emit("dropdown-action", action, item); }
function rowAction(action, row) { emit("row-action", action, row); }
</script>
<template>
  <main class="screen-shell">
    <header class="screen-header"><h1>{{ screen.title }}</h1><p>{{ screen.description }}</p></header>
    <div class="screen-toolbar" role="group" aria-label="Screen actions"><ConfiguredDropdown @action="dropdown" /><ConfiguredButton @click="primary" /></div>
    <p class="screen-feedback" role="status">{{ status }}</p>
    <section id="factory-cars" class="screen-content" :aria-labelledby="titleId">
      <h2 :id="titleId">{{ screen.contentHeading }}</h2>
      <ConfiguredTable v-if="screen.contentMode === 'table'" :rows="props.rows" @row-action="rowAction" />
      <p v-else>{{ screen.contentText }}</p>
    </section>
  </main>
</template>
`;
}
export function generateScreenFrameworkFiles(config, buttonConfig, dropdownConfig, framework) {
  if (!["react", "vue"].includes(framework)) throw new Error(`Unsupported screen framework: ${framework}`);
  if (!validateScreenConfig(config).valid) return [];
  const button = generateButtonSource(buttonConfig, framework);
  const dropdown = generateDropdownFiles(dropdownConfig, framework);
  if (!button || !dropdown.length) return [];
  const file = (filename, source, mimeType = "text/plain") => ({ filename, source, mimeType });
  const extension = framework === "react" ? "jsx" : "vue";
  const files = [
    file(`ConfiguredScreen.${extension}`, screenSource(config, framework)),
    file(`ConfiguredTable.${extension}`, frameworkTable(config.table ?? createDefaultTableConfig(), framework)),
    file(button.filename, button.source, button.mimeType),
    file(button.stylesheetFilename, button.stylesheet, "text/css"),
    ...dropdown,
    file("screen.css", screenCss + tableCss, "text/css")
  ];
  const result = new Map();
  for (const current of files) {
    const previous = result.get(current.filename);
    if (previous && previous.source !== current.source) throw new Error(`Conflicting exported files: ${current.filename}`);
    if (!previous) result.set(current.filename, current);
  }
  return [...result.values()];
}
