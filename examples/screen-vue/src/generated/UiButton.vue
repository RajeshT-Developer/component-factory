<script>
import "./button.css";
import buttonContract from "./button.contract.json";

export default {
  name: "UiButton",

  inheritAttrs: false,

  props: {
    label: {
      type: String,
      required: true,

      validator(value) {
        const { minLength, maxLength } =
          buttonContract.props.label;

        return (
          value.trim().length >= minLength &&
          value.length <= maxLength
        );
      }
    },

    icon: {
      type: String,
      default: buttonContract.props.icon.default,

      validator(value) {
        return buttonContract.props.icon.values.includes(value);
      }
    },

    disabled: {
      type: Boolean,
      default: buttonContract.props.disabled.default
    },

    type: {
      type: String,
      default: buttonContract.props.type.default,

      validator(value) {
        return buttonContract.props.type.values.includes(value);
      }
    }
  }
};
</script>

<template>
  <button
    v-bind="$attrs"
    class="ui-button"
    :type="type"
    :disabled="disabled"
  >
    <span
      v-if="icon === 'plus'"
      class="ui-button__icon"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        focusable="false"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
    </span>

    <span class="ui-button__label">
      {{ label }}
    </span>
  </button>
</template>