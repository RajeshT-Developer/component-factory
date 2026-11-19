<script setup>
import { ref, useId } from "vue";
import ConfiguredButton from "./ConfiguredButton.vue";
import ConfiguredDropdown from "./ConfiguredDropdown.vue";
import ConfiguredTable from "./ConfiguredTable.vue";
import "./screen.css";
const screen = {
  "title": "Vehicle inventory...!",
  "description": "Browse available vehicles and manage listings....!",
  "contentHeading": "Inventory...!",
  "contentText": "Your application content goes here. Connect your data and application behavior...!",
  "contentMode": "table"
};
const props = defineProps({ rows: { type: Array, default: () => [] } });
const emit = defineEmits(["primary-action", "dropdown-action", "row-action"]);
const titleId = useId();
const status = ref("");
function primary(event) { status.value = "Primary action received."; emit("primary-action", event); }
function dropdown(action, item) { emit("dropdown-action", action, item); }
function rowAction(action, row) { emit("row-action", action, row); }
</script>
<template>
  <main class="screen-shell">
    <header class="screen-header"><h1>{{ screen.title }}</h1><p>{{ screen.description }}</p></header>
    <div class="screen-toolbar" role="group" aria-label="Screen actions"><ConfiguredDropdown @action="dropdown" /><ConfiguredButton @click="primary" /></div>
    <p class="screen-feedback" role="status">{{ status }}</p>
    <section id="factory-cars" class="screen-content" :aria-labelledby="titleId">
      <h2 :id="titleId">{{ screen.contentHeading }}</h2>
      <ConfiguredTable v-if="screen.contentMode === 'table'" :rows="props.rows" @row-action="rowAction" />
      <p v-else>{{ screen.contentText }}</p>
    </section>
  </main>
</template>
