<script setup>
import { ref } from "vue";
import ConfiguredScreen from "./generated/ConfiguredScreen.vue";
const initialRows = [
  { id: "vehicle-1", model: "City hatchback", status: "Available" },
  { id: "vehicle-2", model: "Family SUV", status: "Reserved" }
];
const rows = ref(initialRows);
const hostMessage = ref("The Vue consumer is ready to receive screen actions.");
function primary() { hostMessage.value = "The consumer received the primary action. Connect your application workflow here."; }
function dropdown(action, item) { hostMessage.value = `The consumer received "${action}" from item "${item.id}".`; }
function rowAction(action, row) { hostMessage.value = `Row action: ${action}, row: ${row.id}.`; }
</script>
<template>
  <aside class="consumer-feedback" aria-labelledby="consumer-feedback-title">
    <h2 id="consumer-feedback-title">Vue consumer application</h2>
    <p role="status">{{ hostMessage }}</p>
    <button type="button" @click="rows = []">Show empty table</button>
    <button type="button" @click="rows = initialRows">Restore sample rows</button>
  </aside>
  <ConfiguredScreen :rows="rows" @primary-action="primary" @dropdown-action="dropdown" @row-action="rowAction" />
</template>
<style scoped>
.consumer-feedback { box-sizing: border-box; width: min(100% - 2rem, 1120px); margin: 1rem auto 0; padding: 1rem; border: 1px solid #93c5fd; border-radius: .75rem; background: #eff6ff; color: #172033; }
h2 { margin-top: 0; font-size: 1rem; }
p { line-height: 1.5; overflow-wrap: anywhere; }
button { min-height: 44px; padding: .5rem .75rem; margin: .25rem; cursor: pointer; }
button:focus-visible { outline: 3px solid #2563eb; outline-offset: 3px; }
</style>
