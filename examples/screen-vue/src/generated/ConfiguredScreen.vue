<script setup>
import { ref, useId } from "vue";
import ConfiguredButton from "./ConfiguredButton.vue";
import ConfiguredDropdown from "./ConfiguredDropdown.vue";
import "./screen.css";

const screen = {
  "title": "Vehicle inventory...!",
  "description": "Browse available vehicles and manage listings....!",
  "contentHeading": "Inventory...!",
  "contentText": "Your application content goes here. Connect your data and application behavior...!"
};
const contentTitleId = useId();
const status = ref("");

const emit = defineEmits(["primary-action", "dropdown-action"]);

function handlePrimaryAction(event) {
  status.value = "Primary action received.";
  emit("primary-action", event);
}

function handleDropdownAction(action, item) {
  emit("dropdown-action", action, item);
}
</script>

<template>
  <main class="screen-shell">
    <header class="screen-header">
      <h1>{{ screen.title }}</h1>
      <p>{{ screen.description }}</p>
    </header>

    <div
      class="screen-toolbar"
      role="group"
      aria-label="Screen actions"
    >
      <ConfiguredDropdown @action="handleDropdownAction" />
      <ConfiguredButton @click="handlePrimaryAction" />
    </div>

    <p class="screen-feedback" role="status">
      {{ status }}
    </p>

    <section
      id="factory-cars"
      class="screen-content"
      :aria-labelledby="contentTitleId"
    >
      <h2 :id="contentTitleId">
        {{ screen.contentHeading }}
      </h2>

      <p>{{ screen.contentText }}</p>
    </section>
  </main>
</template>
