<script>
import UiDropdown from "./UiDropdown.vue";

export default {
  name: "DropdownDemo",

  components: {
    UiDropdown
  },

  data() {
    return {
      smoothScroll: true,
      previousScrollAttribute: null,
      status: "",

      browseItems: [
        {
          id: "cars",
          label: "Browse cars",
          type: "link",
          href: "#vue-cars"
        },
        {
          id: "auctions",
          label: "Upcoming auctions",
          type: "link",
          href: "#vue-auctions"
        },
        {
          id: "filters",
          label: "Open filters",
          type: "action",
          action: "open-filters"
        }
      ],

      accountItems: [
        {
          id: "profile",
          label: "My profile",
          type: "link",
          href: "#vue-profile"
        },
        {
          id: "settings",
          label: "Settings",
          type: "action",
          action: "open-settings"
        }
      ]
    };
  },

  watch: {
    smoothScroll() {
      this.applyScrollPreference();
    }
  },

  mounted() {
    this.previousScrollAttribute =
      document.documentElement.getAttribute(
        "data-vue-smooth-scroll"
      );

    this.applyScrollPreference();
  },

  beforeUnmount() {
    const root = document.documentElement;
    const attribute = "data-vue-smooth-scroll";

    if (this.previousScrollAttribute === null) {
      root.removeAttribute(attribute);
    } else {
      root.setAttribute(
        attribute,
        this.previousScrollAttribute
      );
    }
  },

  methods: {
    applyScrollPreference() {
      document.documentElement.setAttribute(
        "data-vue-smooth-scroll",
        String(this.smoothScroll)
      );
    },

    handleAction(action) {
      switch (action) {
        case "open-filters":
          this.status = "Filters action executed.";
          break;

        case "open-settings":
          this.status = "Settings action executed.";
          break;

        default:
          this.status = `Unknown action: ${action}`;
      }
    }
  }
};
</script>

<template>
  <section
    class="dropdown-demo"
    aria-labelledby="vue-dropdown-demo-title"
  >
    <h2 id="vue-dropdown-demo-title">
      Dropdown scenarios
    </h2>

    <label class="dropdown-demo__scroll-toggle">
      <input
        v-model="smoothScroll"
        type="checkbox"
      >

      Smooth scrolling
    </label>

    <nav
      class="dropdown-demo__toolbar"
      aria-label="Dropdown examples"
    >
      <UiDropdown
        label="Browse"
        panel-id="vue-browse-dropdown"
        :items="browseItems"
        @action="handleAction"
      >
        <template #icon-cars>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            focusable="false"
          >
            <path d="m5 11 2-6h10l2 6" />
            <path d="M4 11h16v7H4z" />
            <path d="M7 18v2m10-2v2M7 14h.01M17 14h.01" />
          </svg>
        </template>
      </UiDropdown>

      <UiDropdown
        label="Account"
        panel-id="vue-account-dropdown"
        :items="accountItems"
        @action="handleAction"
      />
    </nav>

    <p
      class="dropdown-demo__status"
      role="status"
    >
      {{ status }}
    </p>

    <section
      id="vue-cars"
      class="dropdown-demo__destination"
    >
      <h3>Cars</h3>
      <p>Cars navigation destination.</p>
    </section>

    <section
      id="vue-auctions"
      class="dropdown-demo__destination"
    >
      <h3>Upcoming auctions</h3>
      <p>Auctions navigation destination.</p>
    </section>

    <section
      id="vue-profile"
      class="dropdown-demo__destination"
    >
      <h3>My profile</h3>
      <p>Profile navigation destination.</p>
    </section>
  </section>
</template>