function initDropdown(root, { onAction = () => {} } = {}) {
  if (root.hasAttribute("data-enhanced")) {
    throw new Error("Dropdown is already initialized.");
  }

  const trigger = root.querySelector("[data-dropdown-trigger]");
  const panel = root.querySelector("[data-dropdown-panel]");

  if (!trigger || !panel) {
    throw new Error("Dropdown requires a trigger and a panel.");
  }

  const controller = new AbortController();
  const { signal } = controller;

  const actionButtons = [
    ...panel.querySelectorAll("button[data-action]")
  ];

  let isOpen = false;

  function setOpen(nextOpen, { restoreFocus = false } = {}) {
    isOpen = nextOpen;

    trigger.setAttribute("aria-expanded", String(isOpen));
    panel.hidden = !isOpen;

    if (restoreFocus) {
      trigger.focus();
    }
  }

  function toggle() {
    setOpen(!isOpen);
  }

  function handleKeydown(event) {
    if (event.key !== "Escape" || !isOpen) return;

    event.preventDefault();
    event.stopPropagation();

    setOpen(false, { restoreFocus: true });
  }

  function handleOutsideClick(event) {
    if (!root.contains(event.target)) {
      setOpen(false);
    }
  }

  function handleFocusOut(event) {
    if (!root.contains(event.relatedTarget)) {
      setOpen(false);
    }
  }

  function handlePanelClick(event) {
    if (!(event.target instanceof Element)) return;

    const item = event.target.closest(".ui-dropdown__item");

    if (!item || !panel.contains(item)) return;

    if (item.matches("button[data-action]")) {
      if (item.disabled) return;

      const action = item.dataset.action;

      // Restore focus before the callback so a dialog opened by
      // the callback can subsequently take focus.
      setOpen(false, { restoreFocus: true });

      onAction(action, {
        item,
        root,
        originalEvent: event
      });

      return;
    }

    if (item.matches("a[href]")) {
      // Keep modified-click/new-tab behavior untouched.
      if (
        event.defaultPrevented ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey ||
        item.target === "_blank"
      ) {
        return;
      }

      setOpen(false, { restoreFocus: true });

      // No preventDefault(): the browser follows the real URL.
    }
  }

  trigger.addEventListener("click", toggle, { signal });
  root.addEventListener("keydown", handleKeydown, { signal });
  root.addEventListener("focusout", handleFocusOut, { signal });
  panel.addEventListener("click", handlePanelClick, { signal });

  root.ownerDocument.addEventListener(
    "click",
    handleOutsideClick,
    { signal }
  );

  // Enable the interactive version.
  root.setAttribute("data-enhanced", "");
  trigger.hidden = false;

  actionButtons.forEach(button => {
    button.hidden = false;
  });

  setOpen(false);

  return {
    open() {
      setOpen(true);
    },

    close() {
      setOpen(false);
    },

    destroy() {
      controller.abort();

      trigger.hidden = true;
      trigger.setAttribute("aria-expanded", "false");

      panel.hidden = false;

      actionButtons.forEach(button => {
        button.hidden = true;
      });

      root.removeAttribute("data-enhanced");
    }
  };
}

/* Application callbacks */
const status = document.querySelector("#action-status");

const actions = {
  "open-filters"() {
    status.textContent = "Filters action executed.";
    console.log("Open filters");
  },

  "open-settings"() {
    status.textContent = "Settings action executed.";
    console.log("Open settings");
  }
};

/* Initialize all dropdowns */
const dropdownInstances = [
  ...document.querySelectorAll("[data-dropdown]")
].map(root =>
  initDropdown(root, {
    onAction(action, context) {
      const handler = actions[action];

      if (handler) {
        handler(context);
      } else {
        console.warn(`Unknown dropdown action: ${action}`);
      }
    }
  })
);


/* Smooth scrolling toggle */
const smoothScrollToggle = document.querySelector(
  "#smooth-scroll-toggle"
);

if (smoothScrollToggle) {
  // Synchronize the checkbox with the initial HTML configuration.
  smoothScrollToggle.checked =
    document.documentElement.dataset.smoothScroll === "true";

  smoothScrollToggle.addEventListener("change", event => {
    document.documentElement.dataset.smoothScroll = String(
      event.currentTarget.checked
    );
  });
}