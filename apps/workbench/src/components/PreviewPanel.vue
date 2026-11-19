<script>
import UiButton from "./ui/UiButton.vue";

export default {
  name: "PreviewPanel",

  components: {
    UiButton
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

  emits: ["interaction"],

  methods: {
    reportInteraction(event) {
      if (this.config.disabled) return;

      this.$emit("interaction", {
        type: event.type,
        label: this.config.label
      });
    }
  }
};
</script>

<template>
  <section
    class="factory-panel"
    aria-labelledby="preview-title"
  >
    <h2 id="preview-title">Live preview</h2>

    <p class="field-help">
      Interact with the button to record events.
      Use Tab to check keyboard focus.
    </p>

    <div class="preview-canvas">
      <UiButton
        v-if="valid"
        :label="config.label"
        :icon="config.icon"
        :type="config.type"
        :disabled="config.disabled"
        @click="reportInteraction"
        @mouseenter="reportInteraction"
        @mouseleave="reportInteraction"
        @focus="reportInteraction"
        @blur="reportInteraction"
      />

      <p v-else class="preview-placeholder">
        Fix the configuration errors to display the preview.
      </p>
    </div>

    <p class="field-help">
      The preview is outside a form. Submit and reset types
      do not perform form actions here.
    </p>
  </section>
</template>