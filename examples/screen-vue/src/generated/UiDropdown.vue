<script>
import UiButton from "./UiButton.vue";
import "./dropdown.css";

export default {
  name: "UiDropdown",

  components: {
    UiButton
  },

  props: {
    label: {
      type: String,
      required: true
    },

    panelId: {
      type: String,
      required: true
    },

    icon: {
      type: String,
      default: "none"
    },

    items: {
      type: Array,
      required: true
    },

    align: {
      type: String,
      default: "start",
      validator: value => ["start", "end"].includes(value)
    }
  },

  emits: ["action"],

  data() {
    return {
      open: false
    };
  },

  mounted() {
    this.$refs.root.ownerDocument.addEventListener(
      "click",
      this.handleOutsideClick
    );
  },

  beforeUnmount() {
    this.$refs.root.ownerDocument.removeEventListener(
      "click",
      this.handleOutsideClick
    );
  },

  methods: {
    toggle() {
      this.open = !this.open;
    },

    close(restoreFocus = false) {
      this.open = false;

      if (restoreFocus) {
        this.$refs.root
          .querySelector("[data-dropdown-trigger]")
          ?.focus();
      }
    },

    handleOutsideClick(event) {
      if (!this.$refs.root.contains(event.target)) {
        this.close();
      }
    },

    handleFocusOut(event) {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        this.close();
      }
    },

    handleKeyDown(event) {
      if (event.key !== "Escape" || !this.open) return;

      event.preventDefault();
      event.stopPropagation();

      this.close(true);
    },

    handleLinkClick(event) {
      if (
        event.defaultPrevented ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey ||
        event.currentTarget.target === "_blank"
      ) {
        return;
      }

      this.close(true);

      // Preserve normal browser navigation.
      // Do not call preventDefault().
    },

    handleAction(item) {
      if (item.disabled) return;

      this.close(true);

      this.$emit("action", item.action, item);
    }
  }
};
</script>

<template>
  <div
    ref="root"
    class="ui-dropdown" 
    data-enhanced="true" 
    :data-align="align"
    @keydown="handleKeyDown"
    @focusout="handleFocusOut"
  >
    <UiButton
      class="ui-dropdown__trigger"
      :label="label"
      :icon="icon"
      type="button"
      data-dropdown-trigger=""
      :aria-expanded="open"
      :aria-controls="panelId"
      @click="toggle"
    />

    <ul
      :id="panelId"
      class="ui-dropdown__panel"
      :hidden="!open"
    >
      <li
        v-for="item in items"
        :key="item.id"
      >
        <a
          v-if="item.type === 'link'"
          class="ui-dropdown__item"
          :href="item.href"
          :target="item.target"
          :rel="
            item.target === '_blank'
              ? 'noopener noreferrer'
              : undefined
          "
          :aria-current="item.current ? 'page' : undefined"
          @click="handleLinkClick"
        >
          <span
            v-if="$slots[`icon-${item.id}`]"
            class="ui-dropdown__icon"
            aria-hidden="true"
          >
            <slot :name="`icon-${item.id}`" />
          </span>

          <span>{{ item.label }}</span>
        </a>

        <button
          v-else-if="item.type === 'action'"
          class="ui-dropdown__item"
          type="button"
          :disabled="item.disabled"
          @click="handleAction(item)"
        >
          <span
            v-if="$slots[`icon-${item.id}`]"
            class="ui-dropdown__icon"
            aria-hidden="true"
          >
            <slot :name="`icon-${item.id}`" />
          </span>

          <span>{{ item.label }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>