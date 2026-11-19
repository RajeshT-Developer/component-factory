<script>
export default {
  name: "EventLog",

  props: {
    events: {
      type: Array,
      default: () => []
    }
  },

  emits: ["clear"]
};
</script>

<template>
  <section
    class="factory-panel"
    aria-labelledby="event-log-title"
  >
    <div class="panel-heading">
      <h2 id="event-log-title">Event log</h2>

      <button
        class="workbench-button"
        type="button"
        :disabled="events.length === 0"
        @click="$emit('clear')"
      >
        Clear log
      </button>
    </div>

    <p class="field-help">
      Latest event first. Retains up to 50 events.
    </p>

    <p
      v-if="events.length === 0"
      class="event-empty"
    >
      No events yet. Hover over, focus, or click the preview button.
    </p>

    <ol v-else class="event-list">
      <li
        v-for="event in events"
        :key="event.id"
        class="event-entry"
      >
        <div class="event-entry__heading">
          <code>{{ event.type }}</code>

          <time :datetime="event.timestamp">
            {{ event.displayTime }}
          </time>
        </div>

        <span class="event-entry__label">
          {{ event.label }}
        </span>
      </li>
    </ol>
  </section>
</template>