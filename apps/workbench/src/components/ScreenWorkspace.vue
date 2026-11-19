<script>
import PackageDownload from "./PackageDownload.vue";
import TableConfigPanel from "./TableConfigPanel.vue";
import { validateScreenConfig } from "../models/screenConfig.js";
import { createDefaultTableConfig } from "../models/tableConfig.js";
import { generateScreenFiles, createScreenPreview } from "../generators/screenSource.js";
export default {
  name: "ScreenWorkspace",
  components: { PackageDownload, TableConfigPanel },
  props: {
    modelValue: { type: Object, required: true },
    buttonConfig: { type: Object, required: true },
    dropdownConfig: { type: Object, required: true }
  },
  emits: ["update:modelValue", "edit-component"],
  data() {
    return { previewWidth: "full", exportFramework: "html", fields: [
      { key: "title", label: "Screen title", max: 120 },
      { key: "description", label: "Description", max: 300, rows: 3 },
      { key: "contentHeading", label: "Content heading", max: 120 },
      { key: "contentText", label: "Content text (used in text mode)", max: 1000, rows: 4 }
    ] };
  },
  computed: {
    contentMode() { return this.modelValue.contentMode ?? "text"; },
    tableConfig() { return this.modelValue.table ?? createDefaultTableConfig(); },
    validation() { return validateScreenConfig(this.modelValue); },
    generation() {
      try {
        const htmlFiles = generateScreenFiles(this.modelValue, this.buttonConfig, this.dropdownConfig, "html");
        const files = this.exportFramework === "html" ? htmlFiles : generateScreenFiles(this.modelValue, this.buttonConfig, this.dropdownConfig, this.exportFramework);
        return { files, preview: createScreenPreview(htmlFiles), error: "" };
      } catch (error) { return { files: [], preview: "", error: error.message || "Screen generation failed." }; }
    },
    exportInstructions() {
      if (this.exportFramework === "html") return "Extract all files together and open index.html. Listen for screen-action, dropdown-action and table-row-action. The table event.detail contains { action, row }. HTML includes sample rows: review data before sharing.";
      if (this.exportFramework === "react") return "Keep all files together in a React app with JSX/CSS support. Render ConfiguredScreen with rows, onPrimaryAction, onDropdownAction and onRowAction(action, row). Rows default to [].";
      return "Keep all files together in a Vue 3.5+ app. Pass rows to ConfiguredScreen; listen for primary-action, dropdown-action and row-action(action, row). Rows default to [].";
    }
  },
  methods: {
    updateField(field, value) { this.$emit("update:modelValue", { ...this.modelValue, [field]: value }); },
    updateContentMode(mode) { this.$emit("update:modelValue", { ...this.modelValue, contentMode: mode, table: this.tableConfig }); }
  }
};
</script>
<template>
  <section class="factory-panel screen-settings" aria-labelledby="screen-settings-title">
    <h2 id="screen-settings-title">Screen content</h2>
    <label v-for="field in fields" :key="field.key">{{ field.label }}
      <textarea v-if="field.rows" :value="modelValue[field.key]" :rows="field.rows" :maxlength="field.max" @input="updateField(field.key, $event.target.value)"></textarea>
      <input v-else :value="modelValue[field.key]" :maxlength="field.max" @input="updateField(field.key, $event.target.value)">
    </label>
    <div class="screen-content-mode-control">
      <label id="screen-content-mode-label" for="screen-content-mode">Content type</label>
      <select id="screen-content-mode" aria-labelledby="screen-content-mode-label" :value="contentMode" @change="updateContentMode($event.target.value)">
        <option value="text">Text</option>
        <option value="table">Table</option>
      </select>
    </div>
    <TableConfigPanel v-if="contentMode === 'table'" :model-value="tableConfig" @update:model-value="updateField('table', $event)" />
    <ul v-if="!validation.valid" role="status"><li v-for="(error, index) in validation.errors" :key="index">{{ error }}</li></ul>
  </section>
  <section class="factory-panel screen-settings" aria-labelledby="screen-components-title">
    <h2 id="screen-components-title">Included components</h2>
    <p>Button: {{ buttonConfig.label }}</p>
    <button type="button" @click="$emit('edit-component', 'button')">Configure Button</button>
    <p>Dropdown: {{ dropdownConfig.label }} — {{ dropdownConfig.items.length }} items</p>
    <button type="button" @click="$emit('edit-component', 'dropdown')">Configure Dropdown</button>
    <p class="field-help">The content destination remains #factory-cars. Connect other destinations in the consuming application.</p>
  </section>
  <section class="factory-panel screen-preview-panel" aria-labelledby="screen-preview-title">
    <h2 id="screen-preview-title">Screen preview</h2>
    <label class="screen-width-control">Preview width<select v-model="previewWidth"><option value="full">Available width</option><option value="mobile">Mobile — 375px</option></select></label>
    <p class="field-help">This isolated preview always renders HTML. Links report destinations here; exports retain normal navigation. Row actions report the selected row.</p>
    <p v-if="generation.error" role="alert">{{ generation.error }}</p>
    <div v-else-if="generation.preview" class="screen-preview-frame" :class="{ 'screen-preview-frame--mobile': previewWidth === 'mobile' }">
      <iframe title="Generated screen preview" :srcdoc="generation.preview" sandbox="allow-scripts" referrerpolicy="no-referrer"></iframe>
    </div>
    <p v-else role="status">Complete valid Screen, Button and Dropdown configurations to preview and export.</p>
  </section>
  <section class="factory-panel screen-settings" aria-labelledby="screen-export-title">
    <h2 id="screen-export-title">Export screen</h2>
    <label>Output framework<select v-model="exportFramework"><option value="html">HTML</option><option value="react">React</option><option value="vue">Vue</option></select></label>
    <p class="field-help">{{ exportInstructions }}</p>
    <p class="field-help">HTML is standalone; React/Vue packages are components for an existing application. Table cells display text, not injected HTML.</p>
    <PackageDownload :files="generation.files" :package-name="`component-factory-screen-${exportFramework}`" :instructions="exportInstructions" />
    <details v-if="generation.files.length"><summary>Included files</summary><ul><li v-for="file in generation.files" :key="file.filename">{{ file.filename }}</li></ul></details>
  </section>
</template>
<style scoped>
.screen-settings, .screen-preview-panel { min-width: 0; }
.screen-settings label { display: grid; gap: .375rem; margin-block: 1rem; }
.screen-content-mode-control { display: grid; gap: .375rem; margin-block: 1rem; }
.screen-content-mode-control label { margin: 0; }
.screen-settings input, .screen-settings textarea, .screen-settings button, .screen-settings select, .screen-width-control select { box-sizing: border-box; max-width: 100%; min-height: 44px; padding: .625rem; border: 1px solid #64748b; border-radius: .375rem; background: white; color: #172033; font: inherit; }
.screen-settings input, .screen-settings textarea { width: 100%; min-width: 0; }
.screen-settings textarea { resize: vertical; }
.screen-settings button { cursor: pointer; }
.screen-settings :is(input, textarea, button, select):focus-visible, .screen-width-control select:focus-visible { outline: 3px solid #2563eb; outline-offset: 3px; }
.screen-preview-panel { grid-column: 1 / -1; }
.screen-width-control { display: flex; flex-wrap: wrap; align-items: center; gap: .75rem; }
.screen-preview-frame { width: 100%; margin-inline: auto; }
.screen-preview-frame--mobile { max-width: 375px; }
iframe { display: block; box-sizing: border-box; width: 100%; height: 640px; border: 1px solid #cbd5e1; border-radius: .5rem; background: white; }
</style>
