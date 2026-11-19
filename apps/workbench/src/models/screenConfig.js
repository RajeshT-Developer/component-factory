import { createDefaultTableConfig, validateTableConfig } from "./tableConfig.js";

export function createDefaultScreenConfig() {
  return {
    title: "Vehicle inventory",
    description: "Browse available vehicles and manage listings.",
    contentHeading: "Inventory",
    contentText: "Your application content goes here. Connect your data and application behavior.",
    contentMode: "text",
    table: createDefaultTableConfig()
  };
}

export function validateScreenConfig(config) {
  const errors = [];
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    return { valid: false, errors: ["Screen configuration is missing."] };
  }

  const fields = [
    ["title", "Screen title", 120],
    ["description", "Description", 300],
    ["contentHeading", "Content heading", 120],
    ["contentText", "Content text", 1000]
  ];

  for (const [key, label, maximum] of fields) {
    const value = config[key];
    if (typeof value !== "string" || !value.trim() || value.length > maximum) {
      errors.push(`${label} must contain between 1 and ${maximum} characters.`);
    }
  }

  // Version-1 saved screens without these optional fields remain valid.
  if (config.contentMode !== undefined && !["text", "table"].includes(config.contentMode)) {
    errors.push("Content mode must be text or table.");
  }
  if (config.table !== undefined || config.contentMode === "table") {
    errors.push(...validateTableConfig(config.table).errors);
  }

  return { valid: errors.length === 0, errors };
}
