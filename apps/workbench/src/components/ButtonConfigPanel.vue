<script>
import {
  buttonContract,
  createDefaultButtonConfig
} from "../models/buttonConfig";

export default {
  name: "ButtonConfigPanel",

  props: {
    modelValue: {
      type: Object,
      required: true
    },

    errors: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ["update:modelValue"],

  data() {
    return {
      contract: buttonContract
    };
  },

  methods: {
    updateField(field, value) {
      this.$emit("update:modelValue", {
        ...this.modelValue,
        [field]: value
      });
    },

    resetConfig() {
      this.$emit(
        "update:modelValue",
        createDefaultButtonConfig()
      );
    }
  }
};
</script>

<template>
  <section
    class="factory-panel"
    aria-labelledby="configuration-title"
  >
    <h2 id="configuration-title">Button configuration</h2>

    <div class="config-form">
      <div class="config-field">
        <label for="button-label">
          Label
        </label>

        <input
          id="button-label"
          type="text"
          :value="modelValue.label"
          :maxlength="contract.props.label.maxLength"
          :aria-invalid="Boolean(errors.label)"
          :aria-describedby="
            errors.label
              ? 'button-label-help button-label-error'
              : 'button-label-help'
          "
          @input="updateField('label', $event.target.value)"
        >

        <p id="button-label-help" class="field-help">
          Required. Maximum
          {{ contract.props.label.maxLength }}
          characters.
        </p>

        <p
          v-if="errors.label"
          id="button-label-error"
          class="field-error"
        >
          {{ errors.label }}
        </p>
      </div>

      <div class="config-field">
        <label for="button-icon">
          Icon
        </label>

        <select
          id="button-icon"
          :value="modelValue.icon"
          @change="updateField('icon', $event.target.value)"
        >
          <option
            v-for="icon in contract.props.icon.values"
            :key="icon"
            :value="icon"
          >
            {{ icon === "none" ? "No icon" : "Plus icon" }}
          </option>
        </select>
      </div>

      <div class="config-field">
        <label for="button-type">
          Button type
        </label>

        <select
          id="button-type"
          :value="modelValue.type"
          @change="updateField('type', $event.target.value)"
        >
          <option
            v-for="type in contract.props.type.values"
            :key="type"
            :value="type"
          >
            {{ type }}
          </option>
        </select>
      </div>

      <div class="config-checkbox">
        <input
          id="button-disabled"
          type="checkbox"
          :checked="modelValue.disabled"
          @change="
            updateField('disabled', $event.target.checked)
          "
        >

        <label for="button-disabled">
          Disable the component
        </label>
      </div>

      <button
        class="workbench-button"
        type="button"
        @click="resetConfig"
      >
        Reset configuration
      </button>
    </div>
  </section>
</template>