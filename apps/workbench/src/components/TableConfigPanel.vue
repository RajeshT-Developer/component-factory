<script>
import { createDefaultTableConfig, validateTableConfig, TABLE_LIMITS } from "../models/tableConfig.js";
const copy = value => JSON.parse(JSON.stringify(value));
export default {
  name: "TableConfigPanel",
  props: { modelValue: { type: Object, required: true } },
  emits: ["update:modelValue"],
  data() { return { draft: createDefaultTableConfig(), rowsJson: "[]", errors: [], status: "", limits: TABLE_LIMITS }; },
  watch: {
    modelValue: { immediate: true, deep: true, handler(value) {
      this.draft = copy(value);
      this.rowsJson = JSON.stringify(value.rows, null, 2);
      this.errors = [];
      this.status = "";
    } }
  },
  methods: {
    addColumn() {
      let i = 1;
      while (this.draft.columns.some(c => c.key === `field${i}`)) i++;
      this.draft.columns.push({ key: `field${i}`, label: `Field ${i}` });
    },
    addAction() {
      let i = 1;
      while (this.draft.actions.some(a => a.id === `action${i}`)) i++;
      this.draft.actions.push({ id: `action${i}`, label: `Action ${i}` });
    },
    apply() {
      this.status = "";
      let rows;
      try { rows = JSON.parse(this.rowsJson); }
      catch { this.errors = ["Sample rows must be valid JSON."]; return; }
      const next = { ...copy(this.draft), rows };
      this.errors = validateTableConfig(next).errors;
      if (new TextEncoder().encode(JSON.stringify(next)).length > 1000000) this.errors.push("Keep the table configuration below 1 MB so project files remain importable.");
      if (this.errors.length) return;
      this.$emit("update:modelValue", next);
      this.$nextTick(() => { this.status = "Table changes applied."; });
    }
  }
};
</script>
<template>
  <section aria-labelledby="table-settings-title">
    <h3 id="table-settings-title">Table configuration</h3>
    <p>Choose Apply table changes to publish draft edits to the preview, saved project and exports.</p>
    <label>Table caption<input v-model="draft.caption" maxlength="120"></label>
    <label>Empty-state message<input v-model="draft.emptyMessage" maxlength="200"></label>
    <h4>Columns</h4>
    <fieldset v-for="(column, index) in draft.columns" :key="index">
      <legend>Column {{ index + 1 }}</legend>
      <label>Key<input v-model="column.key" maxlength="64"></label>
      <label>Label<input v-model="column.label" maxlength="80"></label>
      <button type="button" :disabled="draft.columns.length <= 1" @click="draft.columns.splice(index, 1)">Remove column {{ index + 1 }}</button>
    </fieldset>
    <button type="button" :disabled="draft.columns.length >= limits.columns" @click="addColumn">Add column</button>
    <h4>Row actions</h4>
    <fieldset v-for="(action, index) in draft.actions" :key="index">
      <legend>Action {{ index + 1 }}</legend>
      <label>Action id<input v-model="action.id" maxlength="64"></label>
      <label>Action label<input v-model="action.label" maxlength="80"></label>
      <button type="button" @click="draft.actions.splice(index, 1)">Remove action {{ index + 1 }}</button>
    </fieldset>
    <button type="button" :disabled="draft.actions.length >= limits.actions" @click="addAction">Add row action</button>
    <label>Sample rows (JSON)<textarea v-model="rowsJson" rows="10" maxlength="1000000" spellcheck="false"></textarea></label>
    <p>Rows need unique string ids. Other fields must match column keys. Update the JSON when renaming/removing keys; use [] for the empty state. HTML includes sample rows. React/Vue hosts provide their own data.</p>
    <ul v-if="errors.length" role="alert"><li v-for="(error, index) in errors" :key="index">{{ error }}</li></ul>
    <button type="button" @click="apply">Apply table changes</button>
    <p role="status">{{ status }}</p>
  </section>
</template>
<style scoped>
label { display: grid; gap: .375rem; margin-block: .75rem; }
input, textarea, button { box-sizing: border-box; max-width: 100%; min-height: 44px; padding: .625rem; border: 1px solid #64748b; border-radius: .375rem; background: white; color: #172033; font: inherit; }
input, textarea { width: 100%; }
textarea { resize: vertical; font-family: monospace; }
fieldset { min-width: 0; margin-block: .75rem; border: 1px solid #cbd5e1; }
button { cursor: pointer; }
button:disabled { opacity: .55; cursor: not-allowed; }
:is(input, textarea, button):focus-visible { outline: 3px solid #2563eb; outline-offset: 3px; }
p { line-height: 1.5; overflow-wrap: anywhere; }
</style>
