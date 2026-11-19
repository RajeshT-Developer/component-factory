(() => {
  const instances = new WeakMap();

  function init(root) {
    if (instances.has(root)) {
      return instances.get(root);
    }

    const trigger = root.querySelector("[data-dropdown-trigger]");
    const panel = root.querySelector("[data-dropdown-panel]");

    if (!trigger || !panel) {
      throw new Error(
        "Dropdown requires a trigger and a panel."
      );
    }

    const document = root.ownerDocument;

    const actionRows = panel.querySelectorAll(
      "[data-dropdown-action-row]"
    );

    function isOpen() {
      return trigger.getAttribute("aria-expanded") === "true";
    }

    function setOpen(open) {
      trigger.setAttribute("aria-expanded", String(open));
      panel.hidden = !open;
    }

    function close(restoreFocus = false) {
      setOpen(false);

      if (restoreFocus) {
        trigger.focus();
      }
    }

    function handleToggle() {
      setOpen(!isOpen());
    }

    function handleOutsideClick(event) {
      if (!isOpen() || root.contains(event.target)) {
        return;
      }

      const restoreFocus = root.contains(document.activeElement);

      close(restoreFocus);
    }

    function handleFocusIn(event) {
      if (isOpen() && !root.contains(event.target)) {
        close(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key !== "Escape" || !isOpen()) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      close(true);
    }

    function handleSelection(event) {
      if (!(event.target instanceof Element)) {
        return;
      }

      const item = event.target.closest("[data-dropdown-item]");

      if (
        !item ||
        !panel.contains(item) ||
        event.defaultPrevented
      ) {
        return;
      }

      const action = item.getAttribute("data-action");

      close(true);

      if (action) {
        root.dispatchEvent(
          new CustomEvent("dropdown-action", {
            bubbles: true,
            detail: {
              action,
              itemId: item.getAttribute("data-item-id")
            }
          })
        );
      }

      // No preventDefault(): anchors keep native navigation.
    }

    setOpen(false);

    root.dataset.enhanced = "true";
    trigger.hidden = false;

    actionRows.forEach(row => {
      row.hidden = false;
    });

    trigger.addEventListener("click", handleToggle);
    panel.addEventListener("click", handleSelection);
    root.addEventListener("keydown", handleKeyDown);

    document.addEventListener("click", handleOutsideClick, true);
    document.addEventListener("focusin", handleFocusIn);

    function destroy() {
      trigger.removeEventListener("click", handleToggle);
      panel.removeEventListener("click", handleSelection);
      root.removeEventListener("keydown", handleKeyDown);

      document.removeEventListener(
        "click",
        handleOutsideClick,
        true
      );

      document.removeEventListener("focusin", handleFocusIn);

      trigger.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      panel.hidden = false;

      actionRows.forEach(row => {
        row.hidden = true;
      });

      delete root.dataset.enhanced;

      instances.delete(root);
    }

    const instance = {
      close,
      destroy
    };

    instances.set(root, instance);

    return instance;
  }

  // One namespace for the standalone HTML adapter.
  window.ComponentFactoryDropdown = {
    init
  };
})();