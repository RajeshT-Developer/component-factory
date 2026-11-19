export function createDefaultDropdownConfig() {
  return {
    label: "Browse",
    align: "start",
    items: [
      {
        id: "cars",
        type: "link",
        label: "Browse cars",
        href: "#factory-cars"
      },
      {
        id: "filters",
        type: "action",
        label: "Open filters",
        action: "open-filters",
        disabled: false
      }
    ]
  };
}

function validDestination(value) {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    /[\u0000-\u0020\u007f]/.test(value)
  ) {
    return false;
  }

  try {
    const url = new URL(value, "https://component-factory.invalid/");

    return ["https:", "http:", "mailto:", "tel:"].includes(
      url.protocol
    );
  } catch {
    return false;
  }
}

export function validateDropdownConfig(config) {
  const errors = [];

  if (
    typeof config.label !== "string" ||
    !config.label.trim() ||
    config.label.length > 80
  ) {
    errors.push("Enter a trigger label between 1 and 80 characters.");
  }

  if (!["start", "end"].includes(config.align)) {
    errors.push("Choose start or end alignment.");
  }

  if (!Array.isArray(config.items) || config.items.length === 0) {
    errors.push("Add at least one dropdown item.");

    return { valid: false, errors };
  }

  const ids = new Set();

  config.items.forEach((item, index) => {
    const prefix = `Item ${index + 1}`;

    if (
      typeof item.id !== "string" ||
      !item.id.trim() ||
      ids.has(item.id)
    ) {
      errors.push(`${prefix}: item ID must be non-empty and unique.`);
    }

    ids.add(item.id);

    if (
      typeof item.label !== "string" ||
      !item.label.trim() ||
      item.label.length > 80
    ) {
      errors.push(`${prefix}: enter a label between 1 and 80 characters.`);
    }

    if (item.type === "link") {
      if (!validDestination(item.href)) {
        errors.push(
          `${prefix}: enter a destination without spaces, using a relative URL, fragment, HTTP(S), mailto, or tel.`
        );
      }
    } else if (item.type === "action") {
      if (
        typeof item.action !== "string" ||
        !/^[a-z][a-z0-9-]*$/.test(item.action)
      ) {
        errors.push(
          `${prefix}: use an action identifier such as open-filters.`
        );
      }

      if (typeof item.disabled !== "boolean") {
        errors.push(`${prefix}: disabled must be true or false.`);
      }
    } else {
      errors.push(`${prefix}: choose link or action.`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}