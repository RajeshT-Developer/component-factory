<script setup>
import { ref } from "vue";
import ConfiguredScreen from "./generated/ConfiguredScreen.vue";

const hostMessage = ref(
  "The consumer application is ready to receive screen actions."
);

function handlePrimaryAction() {
  hostMessage.value =
    "The consumer received the primary action. Connect your application workflow here.";
}

function handleDropdownAction(action, item) {
  hostMessage.value =
    `The consumer received "${action}" from item "${item.id}".`;
}
</script>

<template>
  <aside
    class="consumer-feedback"
    aria-labelledby="consumer-feedback-title"
  >
    <h2 id="consumer-feedback-title">Consumer application</h2>

    <p role="status">{{ hostMessage }}</p>
  </aside>

  <ConfiguredScreen
    @primary-action="handlePrimaryAction"
    @dropdown-action="handleDropdownAction"
  />
</template>

<style scoped>
.consumer-feedback {
  box-sizing: border-box;
  width: min(100% - 2rem, 1120px);
  margin: 1rem auto 0;
  padding: 1rem;
  border: 1px solid #93c5fd;
  border-radius: 0.75rem;
  background: #eff6ff;
  color: #172033;
}

.consumer-feedback h2 {
  margin-top: 0;
  font-size: 1rem;
}

.consumer-feedback p {
  margin-bottom: 0;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
</style>