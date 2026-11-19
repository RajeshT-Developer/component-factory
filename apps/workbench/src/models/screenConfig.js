export function createDefaultScreenConfig() {
  return {
    title: "Vehicle inventory",
    description: "Browse available vehicles and manage listings.",
    contentHeading: "Inventory",
    contentText:
      "Your application content goes here. Connect your data and application behavior."
  };
}

export function validateScreenConfig(config) {
  const errors = [];

  const fields = [
    ["title", "Screen title", 120],
    ["description", "Description", 300],
    ["contentHeading", "Content heading", 120],
    ["contentText", "Content text", 1000]
  ];

  if (!config || typeof config !== "object") {
    return {
      valid: false,
      errors: ["Screen configuration is missing."]
    };
  }

  for (const [key, label, maximum] of fields) {
    const value = config[key];

    if (
      typeof value !== "string" ||
      !value.trim() ||
      value.length > maximum
    ) {
      errors.push(
        `${label} must contain between 1 and ${maximum} characters.`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}