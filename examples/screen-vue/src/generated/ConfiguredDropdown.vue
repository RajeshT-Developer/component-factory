<script setup>
import { ref, useId } from "vue";
import UiDropdown from "./UiDropdown.vue";

const config = {
  "label": "Browse...!",
  "align": "end",
  "items": [
    {
      "id": "cars",
      "type": "link",
      "label": "Browse cars...!",
      "href": "#factory-cars"
    },
    {
      "id": "filters",
      "label": "Open filters...!",
      "type": "link",
      "href": "#factory-cars"
    },
    {
      "id": "custom-1",
      "type": "action",
      "label": "New action",
      "action": "new-action",
      "disabled": false
    }
  ]
};
const panelId = useId();
const status = ref("");

const emit = defineEmits(["action"]);

function handleAction(action, item) {
  status.value = "Action received: " + action;
  emit("action", action, item);
}
</script>

<template>
  <div>
    <UiDropdown
      :label="config.label"
      :panel-id="panelId"
      :items="config.items"
      :align="config.align"
      @action="handleAction"
    />

    <p role="status">{{ status }}</p>
  </div>
</template>
