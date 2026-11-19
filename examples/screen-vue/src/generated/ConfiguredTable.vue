<script setup>
import { computed } from "vue";
import "./screen.css";
const table = {
  "caption": "Vehicle inventory",
  "emptyMessage": "No vehicles available.",
  "columns": [
    {
      "key": "model",
      "label": "Model"
    },
    {
      "key": "status",
      "label": "Status"
    }
  ],
  "actions": [
    {
      "id": "view",
      "label": "View"
    }
  ]
};
const props = defineProps({ rows: { type: Array, default: () => [] } });
const emit = defineEmits(["row-action"]);
function cell(row, key) {
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
}
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
