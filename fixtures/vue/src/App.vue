<script>
import UiButton from "@factory-button";
import DropdownDemo from "./components/DropdownDemo.vue";

export default {
  name: "App",

  components: {
    UiButton,
    DropdownDemo
  },

  data() {
    return {
      nextEventId: 1,

      events: [],

      scenarios: [
        {
          id: "text-default",
          title: "Text only",
          label: "Save changes",
          icon: "none",
          disabled: false
        },
        {
          id: "icon-default",
          title: "Icon and text",
          label: "Add item",
          icon: "plus",
          disabled: false
        },
        {
          id: "disabled",
          title: "Disabled",
          label: "Unavailable",
          icon: "none",
          disabled: true
        },
        {
          id: "long-label",
          title: "Long label",
          label:
            "Save all changes and continue to the next configuration step",
          icon: "none",
          disabled: false
        }
      ]
    };
  },

  methods: {
    recordEvent(type, event, scenario) {
      if (event.currentTarget.disabled) return;

      const entry = {
        id: this.nextEventId++,
        type,
        scenario: scenario.id,
        label: scenario.label
      };

      this.events = [entry, ...this.events].slice(0, 50);
    },

    clearEvents() {
      this.events = [];
    }
  }
};
</script>

<template>
  <main class="fixture-shell">
    <header class="fixture-header">
      <p class="fixture-eyebrow">
        Component Factory · Vue fixture
      </p>

      <h1>Button scenarios</h1>

      <p>
        Vue Options API implementations using the shared
        button component and stylesheet.
      </p>
    </header>

    <section
      class="scenario-grid"
      aria-label="Button scenarios"
    >
      <article
        v-for="scenario in scenarios"
        :key="scenario.id"
        class="scenario-card"
        :data-scenario="scenario.id"
        :aria-labelledby="`${scenario.id}-title`"
      >
        <h2 :id="`${scenario.id}-title`">
          {{ scenario.title }}
        </h2>

        <div
          class="scenario-preview"
          :class="{
            'scenario-preview--narrow':
              scenario.id === 'long-label'
          }"
        >
          <UiButton
            :label="scenario.label"
            :icon="scenario.icon"
            :disabled="scenario.disabled"
            type="button"
            data-fixture-button=""
            @click="recordEvent('click', $event, scenario)"
            @mouseenter="
              recordEvent('mouseenter', $event, scenario)
            "
            @mouseleave="
              recordEvent('mouseleave', $event, scenario)
            "
            @focus="recordEvent('focus', $event, scenario)"
            @blur="recordEvent('blur', $event, scenario)"
          />
        </div>
      </article>
    </section>

    <section
      class="event-panel"
      aria-labelledby="events-title"
    >
      <div class="event-panel__heading">
        <h2 id="events-title">Event log</h2>

        <button
          id="clear-events"
          class="fixture-action"
          type="button"
          :disabled="events.length === 0"
          @click="clearEvents"
        >
          Clear log
        </button>
      </div>

      <p>
        Latest event first. Retains up to 50 events.
      </p>

      <p
        id="empty-events"
        :hidden="events.length > 0"
      >
        No events yet.
      </p>

      <ol
        id="event-list"
        class="fixture-events"
      >
        <li
          v-for="event in events"
          :key="event.id"
          :data-event-id="event.id"
          :data-event-type="event.type"
          :data-scenario="event.scenario"
        >
          <code>{{ event.type }}</code>

          <span>
            {{ event.scenario }} — {{ event.label }}
          </span>
        </li>
      </ol>
    </section>

    <DropdownDemo />
  </main>
</template>