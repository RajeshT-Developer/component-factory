<script setup>
import "./button.css";

const label = "Add item";
</script>

<template>
  <button
    class="ui-button"
    type="button"
  >
    <span class="ui-button__label">{{ label }}</span>
  </button>
</template>
