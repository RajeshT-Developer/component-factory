<script>
import PackageDownload from "./PackageDownload.vue";

import {
  validateScreenConfig
} from "../models/screenConfig.js";

import {
  generateScreenFiles,
  createScreenPreview
} from "../generators/screenSource.js";

export default {
  name: "ScreenWorkspace",

  components: {
    PackageDownload
  },

  props: {
    modelValue: {
      type: Object,
      required: true
    },

    buttonConfig: {
      type: Object,
      required: true
    },

    dropdownConfig: {
      type: Object,
      required: true
    }
  },

  emits: ["update:modelValue", "edit-component"],

  data() {
    return {
      previewWidth: "full",
      exportFramework: "html"
    };
  },

  computed: {
    validation() {
      return validateScreenConfig(this.modelValue);
    },

    generation() {
      try {
        const htmlFiles = generateScreenFiles(
          this.modelValue,
          this.buttonConfig,
          this.dropdownConfig,
          "html"
        );

        const files = this.exportFramework === "html"
          ? htmlFiles
          : generateScreenFiles(
              this.modelValue,
              this.buttonConfig,
              this.dropdownConfig,
              this.exportFramework
            );

        return {
          files,
          preview: createScreenPreview(htmlFiles),
          error: ""
        };
      } catch (error) {
        return {
          files: [],
          preview: "",
          error: error.message || "Screen generation failed."
        };
      }
    },

    exportInstructions() {
      if (this.exportFramework === "html") {
        return (
          "Extract all files into one folder, then open index.html. " +
          "Connect primary-button behavior through screen-action and " +
          "dropdown actions through dropdown-action."
        );
      }

      if (this.exportFramework === "react") {
        return (
          "Place all source files together in an existing React app " +
          "with JSX and CSS-import support. Import and render " +
          "ConfiguredScreen.jsx. Pass onPrimaryAction and " +
          "onDropdownAction callbacks to connect application behavior."
        );
      }

      return (
        "Place all source files together in an existing Vue 3.5+ app " +
        "with Vue single-file component and CSS-import support. " +
        "Import and render ConfiguredScreen.vue. Listen for " +
        "primary-action and dropdown-action events."
      );
    },
  },

  methods: {
    updateField(field, value) {
      this.$emit("update:modelValue", {
        ...this.modelValue,
        [field]: value
      });
    }
  }
};
</script>

<template>
  <section
    class="factory-panel screen-settings"
    aria-labelledby="screen-settings-title"
  >
    <h2 id="screen-settings-title">Screen content</h2>

    <label>
      Screen title
      <input
        :value="modelValue.title"
        maxlength="120"
        @input="updateField('title', $event.target.value)"
      >
    </label>

    <label>
      Description
      <textarea
        :value="modelValue.description"
        maxlength="300"
        rows="3"
        @input="updateField('description', $event.target.value)"
      ></textarea>
    </label>

    <label>
      Content heading
      <input
        :value="modelValue.contentHeading"
        maxlength="120"
        @input="updateField('contentHeading', $event.target.value)"
      >
    </label>

    <label>
      Content text
      <textarea
        :value="modelValue.contentText"
        maxlength="1000"
        rows="5"
        @input="updateField('contentText', $event.target.value)"
      ></textarea>
    </label>

    <ul v-if="!validation.valid" role="status">
      <li
        v-for="error in validation.errors"
        :key="error"
      >
        {{ error }}
      </li>
    </ul>
  </section>

  <section
    class="factory-panel screen-settings"
    aria-labelledby="screen-components-title"
  >
    <h2 id="screen-components-title">Included components</h2>

    <p class="field-help">
      This is the generated HTML preview, regardless of the export
      framework selected below. Links report their destinations here;
      exported components preserve normal navigation.
    </p>

    <p>Button: {{ buttonConfig.label }}</p>

    <button
      type="button"
      @click="$emit('edit-component', 'button')"
    >
      Configure Button
    </button>

    <p>
      Dropdown: {{ dropdownConfig.label }}
      — {{ dropdownConfig.items.length }} items
    </p>

    <button
      type="button"
      @click="$emit('edit-component', 'dropdown')"
    >
      Configure Dropdown
    </button>

    <p class="field-help">
      The content section has the destination #factory-cars.
      Other dropdown destinations remain your responsibility.
    </p>
  </section>

  <section
    class="factory-panel screen-preview-panel"
    aria-labelledby="screen-preview-title"
  >
    <h2 id="screen-preview-title">Screen preview</h2>

    <label class="screen-width-control">
      Preview width
      <select v-model="previewWidth">
        <option value="full">Available width</option>
        <option value="mobile">Mobile — 375px</option>
      </select>
    </label>

    <p class="field-help">
      This preview renders the generated screen in an isolated frame.
      Links report their destinations here; the exported page navigates
      normally.
    </p>

    <p v-if="generation.error" role="alert">
      {{ generation.error }}
    </p>

    <div
      v-else-if="generation.preview"
      class="screen-preview-frame"
      :class="{
        'screen-preview-frame--mobile': previewWidth === 'mobile'
      }"
    >
      <iframe
        title="Generated screen preview"
        :srcdoc="generation.preview"
        sandbox="allow-scripts"
        referrerpolicy="no-referrer"
      ></iframe>
    </div>

    <p v-else role="status">
      Complete valid Screen, Button, and Dropdown configurations
      to display and export the screen.
    </p>
  </section>

    <section
    class="factory-panel screen-settings"
    aria-labelledby="screen-export-title"
  >
    <h2 id="screen-export-title">Export screen</h2>

    <label>
      Output framework

      <select v-model="exportFramework">
        <option value="html">HTML</option>
        <option value="react">React</option>
        <option value="vue">Vue</option>
      </select>
    </label>

    <p class="field-help">
      {{ exportInstructions }}
    </p>

    <p class="field-help">
      HTML output is a standalone page. React and Vue output
      provide components for an existing application, not a complete
      application scaffold.
    </p>

    <p class="field-help">
      The content section uses #factory-cars. Connect other destinations
      and application actions in the consuming application.
    </p>

    <PackageDownload
      :files="generation.files"
      :package-name="`component-factory-screen-${exportFramework}`"
      :instructions="exportInstructions"
    />

    <details v-if="generation.files.length">
      <summary>Included files</summary>

      <ul>
        <li
          v-for="file in generation.files"
          :key="file.filename"
        >
          {{ file.filename }}
        </li>
      </ul>
    </details>
  </section>
</template>

<style scoped>
.screen-settings,
.screen-preview-panel {
  min-width: 0;
}

.screen-settings label {
  display: grid;
  gap: 0.375rem;
  margin-block: 1rem;
}

.screen-settings input,
.screen-settings textarea,
.screen-settings button,
.screen-width-control select {
  box-sizing: border-box;
  max-width: 100%;
  min-height: 44px;
  padding: 0.625rem;
  border: 1px solid #64748b;
  border-radius: 0.375rem;
  background: #ffffff;
  color: #172033;
  font: inherit;
}

.screen-settings input,
.screen-settings textarea {
  width: 100%;
  min-width: 0;
}

.screen-settings textarea {
  resize: vertical;
}

.screen-settings button {
  cursor: pointer;
}

.screen-settings :is(input, textarea, button):focus-visible,
.screen-width-control select:focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: 3px;
}

.screen-preview-panel {
  grid-column: 1 / -1;
}

.screen-width-control {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.screen-preview-frame {
  width: 100%;
  margin-inline: auto;
}

.screen-preview-frame--mobile {
  max-width: 375px;
}

iframe {
  display: block;
  box-sizing: border-box;
  width: 100%;
  height: 640px;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  background: #ffffff;
}
</style>