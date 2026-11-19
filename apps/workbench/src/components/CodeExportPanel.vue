<script>
import {
  generateButtonSource,
  outputFrameworks
} from "../generators/buttonSource.js";
import PackageDownload from "./PackageDownload.vue";

export default {
  name: "CodeExportPanel",
  components: {
    PackageDownload
  },
  props: {
    config: {
      type: Object,
      required: true
    },

    valid: {
      type: Boolean,
      required: true
    }
  },

  data() {
    return {
      framework: "html",
      frameworks: outputFrameworks,
      status: "",
      copying: false
    };
  },

  computed: {
    output() {
      if (!this.valid) return null;

      return generateButtonSource(this.config, this.framework);
    },

    usageNote() {
      if (this.framework === "html") {
        return "Save index.html and button.css in the same folder, then open index.html.";
      }

      if (this.framework === "react") {
        return "Add ConfiguredButton.jsx and button.css to an existing React app, then import and render ConfiguredButton.";
      }

      return "Add ConfiguredButton.vue and button.css to an existing Vue app, then import and render ConfiguredButton.";
    },
    packageFiles() {
      if (!this.output) return [];

      return [
        {
          filename: this.output.filename,
          source: this.output.source
        },
        {
          filename: this.output.stylesheetFilename,
          source: this.output.stylesheet
        }
      ];
    },
  },

  watch: {
    framework() {
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
    async copySource() {
      if (!this.output || this.copying) return;

      const source = this.output.source;

      this.copying = true;
      this.status = "";

      try {
        if (!navigator.clipboard?.writeText) {
          throw new Error("Clipboard unavailable");
        }

        await navigator.clipboard.writeText(source);

        this.status =
          "Source copied. Download the stylesheet separately.";
      } catch {
        this.status =
          "Clipboard access failed. Select and copy the displayed source manually.";
      } finally {
        this.copying = false;
      }
    },

    downloadFile(contents, filename, mimeType) {
      let url;
      const link = document.createElement("a");

      try {
        const blob = new Blob([contents], {
          type: `${mimeType};charset=utf-8`
        });

        url = URL.createObjectURL(blob);

        link.href = url;
        link.download = filename;

        document.body.append(link);
        link.click();

        this.status = `Download requested: ${filename}`;
      } catch {
        this.status = "Download failed. Please try again.";
      } finally {
        link.remove();

        if (url) {
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
      }
    },

    downloadSource() {
      if (!this.output) return;

      this.downloadFile(
        this.output.source,
        this.output.filename,
        this.output.mimeType
      );
    },

    downloadStylesheet() {
      if (!this.output) return;

      this.downloadFile(
        this.output.stylesheet,
        this.output.stylesheetFilename,
        "text/css"
      );
    }
  }
};
</script>

<template>
  <section
    class="factory-panel export-panel"
    aria-labelledby="code-export-title"
  >
    <h2 id="code-export-title">Component code</h2>

    <p class="field-help">
      Export the current configuration as source code.
      The live preview remains Vue-based.
    </p>

    <div class="export-toolbar">
      <label for="export-framework">Output framework</label>

      <select
        id="export-framework"
        v-model="framework"
      >
        <option
          v-for="item in frameworks"
          :key="item.value"
          :value="item.value"
        >
          {{ item.label }}
        </option>
      </select>
    </div>

    <p class="field-help">{{ usageNote }}</p>

    <PackageDownload
      :files="packageFiles"
      :package-name="`button-${framework}`"
      :instructions="usageNote"
    />

    <p class="field-help">
      This exports a configured button and its styles, not a full
      application. Add application-specific event handlers where
      you use the button. Submit and reset behavior depends on
      the surrounding form.
    </p>

    <div class="export-actions">
      <button
        type="button"
        :disabled="!output || copying"
        @click="copySource"
      >
        {{ copying ? "Copying..." : "Copy source" }}
      </button>

      <button
        type="button"
        :disabled="!output"
        @click="downloadSource"
      >
        Download source
      </button>

      <button
        type="button"
        :disabled="!output"
        @click="downloadStylesheet"
      >
        Download CSS
      </button>
    </div>

    <p
      class="export-status"
      role="status"
    >
      {{ status }}
    </p>

    <template v-if="output">
      <h3>{{ output.filename }}</h3>

      <pre
        class="code-output"
        tabindex="0"
        :aria-label="`${framework} source code`"
      ><code>{{ output.source }}</code></pre>

      <details>
        <summary>View required stylesheet</summary>

        <pre
          class="code-output"
          tabindex="0"
          aria-label="Button stylesheet"
        ><code>{{ output.stylesheet }}</code></pre>
      </details>
    </template>

    <p v-else class="field-help">
      Fix the configuration errors to generate and export code.
    </p>
  </section>
</template>

<style scoped>
.export-panel {
  min-width: 0;
}

.export-toolbar,
.export-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.export-toolbar {
  margin-block: 1rem;
}

.export-toolbar select,
.export-actions button {
  max-width: 100%;
  min-height: 44px;
  padding: 0.625rem 0.875rem;
  border: 1px solid #64748b;
  border-radius: 0.375rem;
  background: #ffffff;
  color: #172033;
  font: inherit;
}

.export-actions button {
  cursor: pointer;
}

.export-actions button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.export-toolbar select:focus-visible,
.export-actions button:focus-visible,
.code-output:focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: 3px;
}

.export-status {
  min-height: 1.5rem;
}

.code-output {
  max-width: 100%;
  max-height: 32rem;
  overflow: auto;
}

summary {
  cursor: pointer;
}
</style>