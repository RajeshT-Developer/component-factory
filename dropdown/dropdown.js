(() => {
  const result = document.querySelector("#action-result");

  // Register application-specific actions.
  document.addEventListener("dropdown-action", event => {
    const { action } = event.detail;

    switch (action) {
      case "create-alert":
        result.textContent =
          "Create alert selected. No navigation occurred.";
        break;

      case "show-help":
        result.textContent =
          "Help selected. No navigation occurred.";
        break;

      case "open-car-selector":
        result.textContent = "Open the car selector here.";
        break;

      default:
        result.textContent = `Unknown action: ${action}`;
    }
  });

  // Initialize every dropdown on this page.
  document.querySelectorAll("[data-dropdown]").forEach(root => {
    window.ComponentFactoryDropdown.init(root);
  });
})();