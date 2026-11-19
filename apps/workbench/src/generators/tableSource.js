import { validateTableConfig } from "../models/tableConfig.js";
export function serialize(value) {
  return JSON.stringify(value, null, 2).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}
export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
function check(config) {
  const result = validateTableConfig(config);
  if (!result.valid) throw new Error(result.errors.join(" "));
}
export const tableCss = `
.screen-table-scroll { max-width: 100%; overflow-x: auto; }
.screen-table { width: 100%; border-collapse: collapse; text-align: left; }
.screen-table caption { padding: 1rem; text-align: left; font-weight: 600; }
.screen-table th, .screen-table td { padding: .75rem; border: 1px solid #cbd5e1; overflow-wrap: anywhere; }
.screen-table th { background: #f1f5f9; }
.screen-table button { min-height: 44px; padding: .5rem .75rem; margin: .125rem; border: 1px solid #64748b; border-radius: .375rem; background: white; color: #172033; font: inherit; cursor: pointer; }
.screen-table-scroll:focus-visible, .screen-table button:focus-visible { outline: 3px solid #2563eb; outline-offset: 3px; }
`;
export function htmlTable(config) {
  check(config);
  const e = escapeHtml;
  const head = config.columns.map(c => `<th scope="col">${e(c.label)}</th>`).join("") + (config.actions.length ? '<th scope="col">Actions</th>' : "");
  const body = config.rows.map((row, index) => `<tr>${config.columns.map(c => `<td>${e(Object.hasOwn(row, c.key) ? row[c.key] : "")}</td>`).join("")}${config.actions.length ? `<td>${config.actions.map((a, ai) => `<button type="button" data-row="${index}" data-action="${ai}" aria-label="${e(a.label)}: ${e(row.id)}">${e(a.label)}</button>`).join("")}</td>` : ""}</tr>`).join("\n");
  return `<div data-screen-table class="screen-table-scroll" role="region" tabindex="0" aria-label="${e(config.caption)}"><table class="screen-table"><caption>${e(config.caption)}</caption><thead><tr>${head}</tr></thead><tbody>${body || `<tr><td colspan="${config.columns.length + (config.actions.length ? 1 : 0)}">${e(config.emptyMessage)}</td></tr>`}</tbody></table></div>`;
}
export function htmlTableRuntime(config) {
  check(config);
  return `;(() => {
  const region = document.querySelector("[data-screen-table]");
  if (!region) return;
  const config = ${serialize(config)};
  region.addEventListener("click", event => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest("button[data-row]");
    if (!button || !region.contains(button)) return;
    const row = config.rows[Number(button.dataset.row)];
    const action = config.actions[Number(button.dataset.action)];
    if (!row || !action) return;
    const result = region.closest("main")?.querySelector(".screen-feedback");
    if (result) result.textContent = action.label + ": " + row.id;
    region.dispatchEvent(new CustomEvent("table-row-action", { bubbles: true, detail: { action: action.id, row } }));
  });
})();`;
}
const runtime = `function cell(row, key) {
  return Object.hasOwn(row, key) && row[key] != null ? String(row[key]) : "";
}
function checkedRows(rows) {
  if (!Array.isArray(rows)) throw new Error("Table rows must be an array.");
  const ids = new Set();
  for (const row of rows) {
    if (!row || typeof row !== "object" || Array.isArray(row) || !Object.hasOwn(row, "id") || typeof row.id !== "string" || !row.id.trim() || ids.has(row.id)) throw new Error("Rows need unique non-empty string ids.");
    ids.add(row.id);
    for (const column of table.columns) {
      const value = Object.hasOwn(row, column.key) ? row[column.key] : null;
      if (value != null && !["string", "number", "boolean"].includes(typeof value)) throw new Error("Table cells must be scalar values.");
      if (typeof value === "number" && !Number.isFinite(value)) throw new Error("Table numbers must be finite.");
    }
  }
  return rows;
}`;
export function frameworkTable(config, framework) {
  check(config);
  const { rows, ...definition } = config;
  const data = serialize(definition);
  if (framework === "react") return `import "./screen.css";
const table = ${data};
${runtime}
export default function ConfiguredTable({ rows = [], onRowAction } = {}) {
  const data = checkedRows(rows);
  return <div className="screen-table-scroll" role="region" aria-label={table.caption} tabIndex={0}>
    <table className="screen-table"><caption>{table.caption}</caption>
      <thead><tr>{table.columns.map(c => <th key={c.key} scope="col">{c.label}</th>)}{table.actions.length > 0 && <th scope="col">Actions</th>}</tr></thead>
      <tbody>{data.length ? data.map(row => <tr key={row.id}>
        {table.columns.map(c => <td key={c.key}>{cell(row, c.key)}</td>)}
        {table.actions.length > 0 && <td>{table.actions.map(a => <button type="button" key={a.id} aria-label={a.label + ": " + row.id} onClick={() => onRowAction?.(a.id, row)}>{a.label}</button>)}</td>}
      </tr>) : <tr><td colSpan={table.columns.length + (table.actions.length ? 1 : 0)}>{table.emptyMessage}</td></tr>}</tbody>
    </table>
  </div>;
}
`;
  if (framework === "vue") return `<script setup>
import { computed } from "vue";
import "./screen.css";
const table = ${data};
const props = defineProps({ rows: { type: Array, default: () => [] } });
const emit = defineEmits(["row-action"]);
${runtime}
const data = computed(() => checkedRows(props.rows));
</script>
<template>
  <div class="screen-table-scroll" role="region" :aria-label="table.caption" tabindex="0">
    <table class="screen-table"><caption>{{ table.caption }}</caption>
      <thead><tr><th v-for="c in table.columns" :key="c.key" scope="col">{{ c.label }}</th><th v-if="table.actions.length" scope="col">Actions</th></tr></thead>
      <tbody><template v-if="data.length"><tr v-for="row in data" :key="row.id">
        <td v-for="c in table.columns" :key="c.key">{{ cell(row, c.key) }}</td>
        <td v-if="table.actions.length"><button v-for="a in table.actions" :key="a.id" type="button" :aria-label="a.label + ': ' + row.id" @click="emit('row-action', a.id, row)">{{ a.label }}</button></td>
      </tr></template><tr v-else><td :colspan="table.columns.length + (table.actions.length ? 1 : 0)">{{ table.emptyMessage }}</td></tr></tbody>
    </table>
  </div>
</template>
`;
  throw new Error("Unsupported table framework: " + framework);
}
