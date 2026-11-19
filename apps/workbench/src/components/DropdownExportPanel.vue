<script>
import {
  generateDropdownFiles
} from "../generators/dropdownSource.js";

import PackageDownload from "./PackageDownload.vue";

export default {
  name: "DropdownExportPanel",
  components: {
    PackageDownload
    },
  props: {
    config: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      framework: "html",
      selectedFilename: "index.html",
      status: "",
      copying: false
    };
  },

  computed: {
    generation() {
      try {
        return {
          files: generateDropdownFiles(
            this.config,
            this.framework
          ),
          error: ""
        };
      } catch (error) {
        return {
          files: [],
          error: error.message || "Source generation failed."
        };
      }
    },

    files() {
      return this.generation.files;
    },

    selectedFile() {
      return this.files.find(
        file => file.filename === this.selectedFilename
      ) ?? this.files[0] ?? null;
    },

    usageNote() {
      if (this.framework === "html") {
        return "Download all three files into one folder, then open index.html.";
      }

      if (this.framework === "react") {
        return "Download both files into one folder in an existing React app. Import and render ConfiguredDropdown.";
      }

      return "Download all six files into one folder in an existing Vue 3.5+ app. Import and render ConfiguredDropdown.";
    },

    actionNote() {
      if (this.framework === "html") {
        return "Edit the dropdown-action event handler at the end of dropdown.js to connect application behavior.";
      }

      if (this.framework === "react") {
        return "Pass an onAction callback to ConfiguredDropdown. It receives the action identifier and item.";
      }

      return "Listen for the action event on ConfiguredDropdown. It supplies the action identifier and item.";
    }
  },

  watch: {
    framework(value) {
      const entryFiles = {
        html: "index.html",
        react: "ConfiguredDropdown.jsx",
        vue: "ConfiguredDropdown.vue"
      };

      this.selectedFilename = entryFiles[value];
      this.status = "";
    },

    selectedFilename() {
      this.status = "";
    },

    config: {
      deep: true,
      handler() {
        this.status = "";
      }
    }
  },

  methods: {
    async copyFile() {
      if (!this.selectedFile || this.copying) return;

      const file = this.selectedFile;

      this.copying = true;
      this.status = "";

      try {
        if (!navigator.clipboard?.writeText) {
          throw new Error("Clipboard unavailable");
        }

        await navigator.clipboard.writeText(file.source);

        this.status = `Copied ${file.filename}.`;
      } catch {
        this.status =
          "Clipboard access failed. Select and copy the displayed code manually.";
      } finally {
        this.copying = false;
      }
    },

    downloadFile() {
      if (!this.selectedFile) return;

      const file = this.selectedFile;
      const link = document.createElement("a");
      let url;

      try {
        const blob = new Blob([file.source], {
          type: `${file.mimeType};charset=utf-8`
        });

        url = URL.createObjectURL(blob);

        link.href = url;
        link.download = file.filename;

        document.body.append(link);
        link.click();

        this.status = `Download requested: ${file.filename}`;
      } catch {
        this.status = "Download failed. Please try again.";
      } finally {
        link.remove();

        if (url) {
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
      }
    }
  }
};
</script>

<template>
  <section
    class="factory-panel dropdown-export"
    aria-labelledby="dropdown-export-title"
  >
    <h2 id="dropdown-export-title">Dropdown code export</h2>

    <div class="dropdown-export-toolbar">
      <label for="dropdown-export-framework">
        Output framework
      </label>

      <select
        id="dropdown-export-framework"
        v-model="framework"
      >
        <option value="html">HTML</option>
        <option value="react">React</option>
        <option value="vue">Vue</option>
      </select>
    </div>

    <p class="field-help">{{ usageNote }}</p>

    <PackageDownload
      :files="files"
      :package-name="`dropdown-${framework}`"
      :instructions="usageNote"
    />

    <p class="field-help">
      Exported destinations are unchanged. For React and Vue,
      provide the destination pages or sections in your application.
      These exports do not create routes or execute application actions.
    </p>

    <p
      v-if="generation.error"
      class="dropdown-export-error"
      role="alert"
    >
      {{ generation.error }}
    </p>

    <template v-else-if="files.length">
      <div class="dropdown-export-toolbar">
        <label for="dropdown-export-file">Output file</label>

        <select
          id="dropdown-export-file"
          v-model="selectedFilename"
        >
          <option
            v-for="file in files"
            :key="file.filename"
            :value="file.filename"
          >
            {{ file.filename }}
          </option>
        </select>

        <button
          type="button"
          :disabled="copying"
          @click="copyFile"
        >
          {{ copying ? "Copying..." : "Copy selected file" }}
        </button>

        <button
          type="button"
          @click="downloadFile"
        >
          Download selected file
        </button>
      </div>

      <p class="field-help">
        Required source files: {{ files.length }}.
        Download the package for all files, or use the controls
        above for an individual file.
      </p>

      <pre
        v-if="selectedFile"
        class="code-output"
        tabindex="0"
        :aria-label="`${selectedFile.filename} source code`"
      ><code>{{ selectedFile.source }}</code></pre>

      <details>
        <summary>Connecting application actions</summary>
        <p class="field-help">{{ actionNote }}</p>
      </details>
    </template>

    <p v-else class="field-help">
      Fix the dropdown configuration errors to enable export.
    </p>

    <p class="dropdown-export-status" role="status">
      {{ status }}
    </p>
  </section>
</template>

<style scoped>
.dropdown-export {
  min-width: 0;
}

.dropdown-export-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-block: 1rem;
}

.dropdown-export-toolbar select,
.dropdown-export-toolbar button {
  max-width: 100%;
  min-height: 44px;
  padding: 0.625rem 0.875rem;
  border: 1px solid #64748b;
  border-radius: 0.375rem;
  background: #ffffff;
  color: #172033;
  font: inherit;
}

.dropdown-export-toolbar button,
summary {
  cursor: pointer;
}

.dropdown-export-toolbar :disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.dropdown-export-toolbar :is(select, button):focus-visible,
.code-output:focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: 3px;
}

.dropdown-export-status {
  min-height: 1.5rem;
}

.dropdown-export-error {
  color: #991b1b;
}

.code-output {
  max-width: 100%;
  max-height: 32rem;
  overflow: auto;
}
</style>