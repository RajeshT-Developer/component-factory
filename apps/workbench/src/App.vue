<script>
import ButtonConfigPanel from "./components/ButtonConfigPanel.vue";
import PreviewPanel from "./components/PreviewPanel.vue";
import EventLog from "./components/EventLog.vue";

import ParityResultsPanel from "./components/ParityResultsPanel.vue";
import CodeExportPanel from "./components/CodeExportPanel.vue";

import DropdownWorkspace from "./components/DropdownWorkspace.vue";
import WorkspaceFilePanel from "./components/WorkspaceFilePanel.vue";

import {
  createDefaultDropdownConfig
} from "./models/dropdownConfig.js";

import {
  buttonContract,
  createDefaultButtonConfig,
  validateButtonConfig
} from "./models/buttonConfig";

import {
  isValidWorkspace,
  loadWorkspace,
  saveWorkspace
} from "./models/workspaceStorage.js";
import ScreenWorkspace from "./components/ScreenWorkspace.vue";

import {
  createDefaultScreenConfig
} from "./models/screenConfig.js";
export default {
  name: "App",

  components: {
    ButtonConfigPanel,
    PreviewPanel,
    EventLog,
    ParityResultsPanel,
    CodeExportPanel,
    DropdownWorkspace ,
    WorkspaceFilePanel, 
    ScreenWorkspace
  },

  data() {
    return {
      workspaceMode: "components",
      screenConfig: createDefaultScreenConfig(),
      selectedComponent: "button",
      dropdownConfig: createDefaultDropdownConfig(),  
      buttonConfig: createDefaultButtonConfig(),
      contract: buttonContract,
      events: [],
      nextEventId: 1,
      workspaceReady: false,
      workspaceStatus: "Workspace has not been saved yet.",
    };
  },

  computed: {
    validation() {
      return validateButtonConfig(this.buttonConfig);
    },

    configurationJson() {
      return JSON.stringify(this.buttonConfig, null, 2);
    },

    contractJson() {
      return JSON.stringify(this.contract, null, 2);
    },

    clickCount() {
      return this.events.filter(event => event.type === "click").length;
    },
    workspaceSnapshot() {
      return {
        schemaVersion: 1,
        workspaceMode: this.workspaceMode,
        selectedComponent: this.selectedComponent,
        buttonConfig: this.buttonConfig,
        dropdownConfig: this.dropdownConfig,
        screenConfig: this.screenConfig
      };
    },
  },

  methods: {
    recordInteraction(interaction) {
      const now = new Date();

      const entry = {
        id: this.nextEventId++,
        type: interaction.type,
        label: interaction.label,
        timestamp: now.toISOString(),
        displayTime: now.toLocaleTimeString()
      };

      this.events = [entry, ...this.events].slice(0, 50);
    },

    clearEvents() {
      this.events = [];
    },
    
    persistWorkspace() {
      try {
        const saved = saveWorkspace(this.workspaceSnapshot);

        this.workspaceStatus = saved
          ? "Workspace saved in this browser."
          : "Current edits are incomplete. The last valid saved workspace is unchanged.";
      } catch {
        this.workspaceStatus =
          "Browser storage is unavailable or full. Your current work remains open, but could not be saved.";
      }
    },

    openWorkspace(project) {
      if (!isValidWorkspace(project)) {
        this.workspaceStatus =
          "The project could not be opened because its configuration is invalid.";

        return;
      }

      const restored = JSON.parse(JSON.stringify(project));

      this.buttonConfig = restored.buttonConfig;
      this.dropdownConfig = restored.dropdownConfig;
      this.selectedComponent = restored.selectedComponent;
      this.workspaceMode = restored.workspaceMode ?? "components";

      this.screenConfig =
        restored.screenConfig ?? createDefaultScreenConfig();

      this.events = [];
      this.nextEventId = 1;
    },
    editScreenComponent(component) {
      this.selectedComponent = component;
      this.workspaceMode = "components";
    },
  },
  watch: {
      workspaceSnapshot: {
        deep: true,
        handler() {
          if (!this.workspaceReady) return;

          this.persistWorkspace();
        }
      }
    },
  created() {
      try {
        const saved = loadWorkspace();

        if (saved) {
          this.selectedComponent = saved.selectedComponent;
          this.buttonConfig = saved.buttonConfig;
          this.dropdownConfig = saved.dropdownConfig;

          this.workspaceStatus = "Saved workspace restored.";
          this.workspaceMode = saved.workspaceMode ?? "components";

          this.screenConfig =
            saved.screenConfig ?? createDefaultScreenConfig();
        } else {
          this.workspaceStatus =
            "Changes will be saved automatically in this browser.";
        }
      } catch {
        this.workspaceStatus =
          "The saved workspace could not be restored. Defaults are displayed.";
      } finally {
        this.workspaceReady = true;
      }
    },
};
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <p class="eyebrow">Component Factory · Stage 3</p>

      <h1>Component Factory</h1>

      <p class="app-description">
        Configure reusable components, assemble a screen,
        and export source-code packages.
      </p>
    </header>
    <section
      class="factory-panel"
      aria-labelledby="component-selector-title"
    >
      <h2 id="component-selector-title">Workspace</h2>

      <label for="workspace-mode">Mode</label>

      <select
        id="workspace-mode"
        v-model="workspaceMode"
      >
        <option value="components">Component editor</option>
        <option value="screen">Screen builder</option>
      </select>

      <template v-if="workspaceMode === 'components'">
        <label for="selected-component">Choose a component</label>

        <select
          id="selected-component"
          v-model="selectedComponent"
        >
          <option value="button">Button</option>
          <option value="dropdown">Dropdown</option>
        </select>
      </template>

      <p class="field-help" role="status">
        {{ workspaceStatus }}
      </p>

      <p class="field-help">
        Configurations are stored in this browser for this workbench
        address. Downloaded packages remain separate.
      </p>

    </section>

    <WorkspaceFilePanel
      :workspace="workspaceSnapshot"
      @open="openWorkspace"
    />

    <main class="factory-layout">
      <template
            v-if="workspaceMode === 'components' && selectedComponent === 'button'"
          >
          <ButtonConfigPanel
            v-model="buttonConfig"
            :errors="validation.errors"
          />

          <PreviewPanel
            :config="buttonConfig"
            :valid="validation.valid"
            @interaction="recordInteraction"
          />

          <CodeExportPanel
            :config="buttonConfig"
            :valid="validation.valid"
          />

          <EventLog
            :events="events"
            @clear="clearEvents"
          />

          <section
            class="factory-panel"
            aria-labelledby="configuration-output-title"
          >
            <h2 id="configuration-output-title">
              Current configuration
            </h2>

            <p
              class="validation-status"
              :class="{
                'validation-status--valid': validation.valid,
                'validation-status--invalid': !validation.valid
              }"
              role="status"
            >
              {{
                validation.valid
                  ? "Configuration is valid."
                  : "Configuration needs attention."
              }}
            </p>

            <pre class="code-output"><code>{{ configurationJson }}</code></pre>

            <p class="field-help">
              Click events in the retained log: {{ clickCount }}
            </p>
          </section>

          <section
            class="factory-panel contract-panel"
            aria-labelledby="contract-title"
          >
            <h2 id="contract-title">Component contract</h2>

            <details>
              <summary>View contract JSON</summary>

              <pre class="code-output"><code>{{ contractJson }}</code></pre>
            </details>
          </section>
      </template>
      <DropdownWorkspace
        v-if="
          workspaceMode === 'components' &&
          selectedComponent === 'dropdown'
        "
        v-model="dropdownConfig"
      />
      <ScreenWorkspace
        v-if="workspaceMode === 'screen'"
        v-model="screenConfig"
        :button-config="buttonConfig"
        :dropdown-config="dropdownConfig"
        @edit-component="editScreenComponent"
      />
      <ParityResultsPanel v-if="workspaceMode === 'components'" />
    </main>
  </div>
</template>