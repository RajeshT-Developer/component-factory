<script>
import UiDropdown from "./ui/UiDropdown.vue";
import DropdownExportPanel from "./DropdownExportPanel.vue";

import {
  validateDropdownConfig
} from "../models/dropdownConfig.js";

export default {
  name: "DropdownWorkspace",

  components: {
    UiDropdown,
    DropdownExportPanel
  },

  props: {
    modelValue: {
      type: Object,
      required: true
    }
  },

  emits: ["update:modelValue"],

  data() {
    return {
      status: "",
      nextItemId: 1
    };
  },

  computed: {
    validation() {
      return validateDropdownConfig(this.modelValue);
    }
  },

  watch: {
    modelValue: {
      deep: true,
      handler() {
        this.status = "";
      }
    }
  },

  methods: {
    updateConfig(patch) {
      this.$emit("update:modelValue", {
        ...this.modelValue,
        ...patch
      });
    },

    updateItem(index, patch) {
      const items = this.modelValue.items.map((item, position) =>
        position === index ? { ...item, ...patch } : item
      );

      this.updateConfig({ items });
    },

    changeItemType(index, type) {
      const current = this.modelValue.items[index];

      const replacement = {
        id: current.id,
        label: current.label,
        type
      };

      if (type === "link") {
        replacement.href = "#factory-cars";
      } else {
        replacement.action = "new-action";
        replacement.disabled = false;
      }

      const items = this.modelValue.items.map((item, position) =>
        position === index ? replacement : item
      );

      this.updateConfig({ items });
    },

    addItem() {
      let id;

      do {
        id = `custom-${this.nextItemId++}`;
      } while (this.modelValue.items.some(item => item.id === id));

      this.updateConfig({
        items: [
          ...this.modelValue.items,
          {
            id,
            type: "action",
            label: "New action",
            action: "new-action",
            disabled: false
          }
        ]
      });
    },

    removeItem(index) {
      this.updateConfig({
        items: this.modelValue.items.filter(
          (_, position) => position !== index
        )
      });
    },

    moveItem(index, direction) {
      const destination = index + direction;
      const items = [...this.modelValue.items];

      if (destination < 0 || destination >= items.length) return;

      [items[index], items[destination]] = [
        items[destination],
        items[index]
      ];

      this.updateConfig({ items });
    },

    handleAction(action) {
      this.status =
        `Action received: ${action}. No application action was executed.`;
    }
  }
};
</script>

<template>
  <section
    class="factory-panel dropdown-editor"
    aria-labelledby="dropdown-editor-title"
  >
    <h2 id="dropdown-editor-title">Dropdown configuration</h2>

    <label class="dropdown-field">
      Trigger label
      <input
        :value="modelValue.label"
        maxlength="80"
        @input="updateConfig({ label: $event.target.value })"
      >
    </label>

    <label class="dropdown-field">
      Panel alignment
      <select
        :value="modelValue.align"
        @change="updateConfig({ align: $event.target.value })"
      >
        <option value="start">Start</option>
        <option value="end">End</option>
      </select>
    </label>

    <fieldset
      v-for="(item, index) in modelValue.items"
      :key="item.id"
      class="dropdown-item-editor"
    >
      <legend>Item {{ index + 1 }}</legend>

      <label class="dropdown-field">
        Label
        <input
          :value="item.label"
          maxlength="80"
          @input="updateItem(index, { label: $event.target.value })"
        >
      </label>

      <label class="dropdown-field">
        Item type
        <select
          :value="item.type"
          @change="changeItemType(index, $event.target.value)"
        >
          <option value="link">Navigation link</option>
          <option value="action">Action</option>
        </select>
      </label>

      <label
        v-if="item.type === 'link'"
        class="dropdown-field"
      >
        Destination
        <input
          :value="item.href"
          placeholder="#factory-cars or /cars"
          @input="updateItem(index, { href: $event.target.value })"
        >
      </label>

      <template v-else>
        <label class="dropdown-field">
          Action identifier
          <input
            :value="item.action"
            placeholder="open-filters"
            @input="updateItem(index, { action: $event.target.value })"
          >
        </label>

        <label class="dropdown-checkbox">
          <input
            type="checkbox"
            :checked="item.disabled"
            @change="
              updateItem(index, { disabled: $event.target.checked })
            "
          >
          Disabled action
        </label>
      </template>

      <div class="dropdown-item-actions">
        <button
          type="button"
          :disabled="index === 0"
          :aria-label="`Move item ${index + 1} up`"
          @click="moveItem(index, -1)"
        >
          Move up
        </button>

        <button
          type="button"
          :disabled="index === modelValue.items.length - 1"
          :aria-label="`Move item ${index + 1} down`"
          @click="moveItem(index, 1)"
        >
          Move down
        </button>

        <button
          type="button"
          :aria-label="`Remove item ${index + 1}`"
          @click="removeItem(index)"
        >
          Remove
        </button>
      </div>
    </fieldset>

    <button type="button" @click="addItem">
      Add item
    </button>

    <div
      v-if="!validation.valid"
      class="dropdown-errors"
      role="status"
    >
      <p>Update the configuration to display the preview:</p>

      <ul>
        <li
          v-for="error in validation.errors"
          :key="error"
        >
          {{ error }}
        </li>
      </ul>
    </div>
  </section>

  <section
    class="factory-panel dropdown-preview"
    aria-labelledby="dropdown-preview-title"
  >
    <h2 id="dropdown-preview-title">Dropdown preview</h2>

    <p class="field-help">
      Links navigate normally. Actions report their identifier below.
      The default link points to the Cars section in this panel.
    </p>

    <div
      v-if="validation.valid"
      class="dropdown-preview-toolbar"
      :class="{ 'dropdown-preview-toolbar--end': modelValue.align === 'end' }"
    >
      <UiDropdown
        :key="JSON.stringify(modelValue)"
        :label="modelValue.label"
        panel-id="workbench-dropdown-panel"
        :items="modelValue.items"
        :align="modelValue.align"
        @action="handleAction"
      />
    </div>

    <p v-else class="field-help">
      Preview unavailable until the configuration is valid.
    </p>

    <p class="dropdown-action-status" role="status">
      {{ status }}
    </p>

    <section
      id="factory-cars"
      aria-labelledby="factory-cars-title"
    >
      <h3 id="factory-cars-title">Cars</h3>
      <p>Default navigation destination for this preview.</p>
    </section>

    
  </section>
    <DropdownExportPanel :config="modelValue" />
</template>

<style scoped>
.dropdown-editor,
.dropdown-preview {
  min-width: 0;
}

.dropdown-field {
  display: grid;
  gap: 0.375rem;
  margin-block: 1rem;
}

.dropdown-field input,
.dropdown-field select,
.dropdown-editor button {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: 44px;
  padding: 0.625rem;
  border: 1px solid #64748b;
  border-radius: 0.375rem;
  background: #ffffff;
  color: #172033;
  font: inherit;
}

.dropdown-editor button {
  width: auto;
  cursor: pointer;
}

.dropdown-editor button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.dropdown-editor :is(input, select, button):focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: 3px;
}

.dropdown-item-editor {
  min-width: 0;
  margin-block: 1rem;
  padding: 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
}

.dropdown-checkbox,
.dropdown-item-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-block: 1rem;
}

.dropdown-errors {
  color: #991b1b;
}

.dropdown-preview-toolbar {
  display: flex;
  margin-block: 1.5rem;
}

.dropdown-preview-toolbar--end {
  justify-content: flex-end;
}

.dropdown-action-status {
  min-height: 3rem;
  overflow-wrap: anywhere;
}
</style>