<script>
import {
  isValidWorkspace
} from "../models/workspaceStorage.js";

export default {
  name: "WorkspaceFilePanel",

  props: {
    workspace: {
      type: Object,
      required: true
    }
  },

  emits: ["open"],

  data() {
    return {
      status: "",
      pendingWorkspace: null,
      pendingFilename: "",
      reading: false,
      readId: 0
    };
  },

  computed: {
    canSave() {
      return isValidWorkspace(this.workspace);
    }
  },

  methods: {
    saveProject() {
      if (!this.canSave) return;

      const link = document.createElement("a");
      let url;

      try {
        const project = {
          ...this.workspace,
          savedAt: new Date().toISOString()
        };

        const blob = new Blob(
          [JSON.stringify(project, null, 2) + "\n"],
          { type: "application/json;charset=utf-8" }
        );

        url = URL.createObjectURL(blob);

        link.href = url;
        link.download = "component-factory.project.json";

        document.body.append(link);
        link.click();

        this.status = "Project file download requested.";
      } catch {
        this.status = "The project file could not be created.";
      } finally {
        link.remove();

        if (url) {
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
      }
    },

    async readProject(event) {
      const file = event.target.files?.[0];

      if (!file) return;

      const requestId = ++this.readId;

      this.pendingWorkspace = null;
      this.pendingFilename = "";
      this.status = "";
      this.reading = true;

      try {
        if (file.size > 2 * 1024 * 1024) {
          throw new Error(
            "Choose a project file smaller than 2 MB."
          );
        }

        const source = await file.text();

        if (requestId !== this.readId) return;

        let project;

        try {
          project = JSON.parse(source);
        } catch {
          throw new Error("The selected file is not valid JSON.");
        }

        if (!isValidWorkspace(project)) {
          throw new Error(
            "This file does not contain a supported, valid Component Factory project."
          );
        }

        this.pendingWorkspace = project;
        this.pendingFilename = file.name;

        this.status =
          "Project checked. Review the details, then choose Open project.";
      } catch (error) {
        if (requestId === this.readId) {
          this.status =
            error.message || "The project file could not be read.";
        }
      } finally {
        if (requestId === this.readId) {
          this.reading = false;
        }

        event.target.value = "";
      }
    },

    openProject() {
      if (!isValidWorkspace(this.pendingWorkspace)) return;

      // Emit an independent copy, not the preview object.
      const project = JSON.parse(
        JSON.stringify(this.pendingWorkspace)
      );

      this.$emit("open", project);

      this.pendingWorkspace = null;
      this.pendingFilename = "";

      this.status = "Project opened.";
    },

    cancelOpen() {
      this.pendingWorkspace = null;
      this.pendingFilename = "";
      this.status = "Opening cancelled. Current configuration unchanged.";
    }
  }
};
</script>

<template>
  <section
    class="factory-panel project-files"
    aria-labelledby="project-files-title"
  >
    <h2 id="project-files-title">Project files</h2>

    <p class="field-help">
      Save editable configurations as a project file.
      Use component export panels for generated source-code packages.
    </p>

    <div class="project-file-actions">
      <button
        type="button"
        :disabled="!canSave"
        @click="saveProject"
      >
        Save project
      </button>

      <label class="project-file-picker">
        Choose project file
        <input
          type="file"
          accept=".json,application/json"
          @change="readProject"
        >
      </label>
    </div>

    <p v-if="!canSave" class="field-help">
      Complete the Button and Dropdown configurations before saving.
    </p>

    <p v-if="reading" role="status">
      Reading project file...
    </p>

    <div v-if="pendingWorkspace" class="project-review">
      <h3>Ready to open</h3>

      <dl>
        <dt>File</dt>
        <dd>{{ pendingFilename }}</dd>

        <dt>Selected component</dt>
        <dd>{{ pendingWorkspace.selectedComponent }}</dd>

        <dt>Button label</dt>
        <dd>{{ pendingWorkspace.buttonConfig.label }}</dd>

        <dt>Dropdown label</dt>
        <dd>{{ pendingWorkspace.dropdownConfig.label }}</dd>

        <dt>Dropdown items</dt>
        <dd>{{ pendingWorkspace.dropdownConfig.items.length }}</dd>
      </dl>

      <p class="field-help">
        Opening replaces both current configurations and clears the
        temporary interaction log. Automatic browser saving will
        then use the opened project.
      </p>

      <div class="project-file-actions">
        <button type="button" @click="openProject">
          Open project
        </button>

        <button type="button" @click="cancelOpen">
          Cancel
        </button>
      </div>
    </div>

    <p class="project-file-status" role="status">
      {{ status }}
    </p>
  </section>
</template>

<style scoped>
.project-files {
  min-width: 0;
  margin-block: 1rem;
}

.project-file-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
}

.project-file-actions button {
  min-height: 44px;
  padding: 0.625rem 1rem;
  border: 1px solid #64748b;
  border-radius: 0.375rem;
  background: #ffffff;
  color: #172033;
  font: inherit;
  cursor: pointer;
}

.project-file-actions button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.project-file-picker {
  display: grid;
  gap: 0.375rem;
  min-width: 0;
}

.project-file-picker input {
  max-width: 100%;
  font: inherit;
}

.project-files :is(button, input):focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: 3px;
}

.project-review {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
}

dt {
  margin-top: 0.5rem;
  font-weight: 600;
}

dd {
  margin: 0.25rem 0 0;
  overflow-wrap: anywhere;
}

.project-file-status {
  min-height: 1.5rem;
}
</style>