export const TABLE_LIMITS = Object.freeze({
  columns: 12,
  rows: 100,
  actions: 5,
  cellLength: 2000
});

const forbiddenKeys = new Set(["__proto__", "prototype", "constructor"]);

function isRecord(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isText(value, maximum) {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maximum;
}

function isKey(value) {
  return typeof value === "string" && /^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(value) && !forbiddenKeys.has(value);
}

function isCell(value) {
  return value === null ||
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value)) ||
    (typeof value === "string" && value.length <= TABLE_LIMITS.cellLength);
}

export function createDefaultTableConfig() {
  return {
    caption: "Vehicle inventory",
    emptyMessage: "No vehicles available.",
    columns: [
      { key: "model", label: "Model" },
      { key: "status", label: "Status" }
    ],
    rows: [
      { id: "vehicle-1", model: "City hatchback", status: "Available" },
      { id: "vehicle-2", model: "Family SUV", status: "Reserved" }
    ],
    actions: [{ id: "view", label: "View" }]
  };
}

export function validateTableConfig(config) {
  const errors = [];
  if (!isRecord(config)) return { valid: false, errors: ["Table configuration must be an object."] };

  if (!isText(config.caption, 120)) errors.push("Table caption must contain between 1 and 120 characters.");
  if (!isText(config.emptyMessage, 200)) errors.push("Empty-state message must contain between 1 and 200 characters.");

  const columnKeys = new Set();
  if (!Array.isArray(config.columns) || config.columns.length < 1 || config.columns.length > TABLE_LIMITS.columns) {
    errors.push(`Table must contain between 1 and ${TABLE_LIMITS.columns} columns.`);
  } else {
    config.columns.forEach((column, index) => {
      if (!isRecord(column) || !isKey(column.key) || !isText(column.label, 80)) {
        errors.push(`Column ${index + 1} needs a safe key and a label of 1 to 80 characters.`);
        return;
      }
      if (columnKeys.has(column.key)) errors.push(`Duplicate column key: ${column.key}.`);
      columnKeys.add(column.key);
    });
  }

  if (!Array.isArray(config.rows) || config.rows.length > TABLE_LIMITS.rows) {
    errors.push(`Sample rows must be an array containing at most ${TABLE_LIMITS.rows} rows.`);
  } else {
    const rowIds = new Set();
    config.rows.forEach((row, index) => {
      if (!isRecord(row) || !Object.hasOwn(row, "id") || !isText(row.id, 80)) {
        errors.push(`Row ${index + 1} needs a non-empty string id of at most 80 characters.`);
        return;
      }
      if (rowIds.has(row.id)) errors.push(`Duplicate row id: ${row.id}.`);
      rowIds.add(row.id);
      for (const [key, value] of Object.entries(row)) {
        if (forbiddenKeys.has(key) || (key !== "id" && !columnKeys.has(key))) {
          errors.push(`Row ${index + 1} contains an unconfigured or unsafe field: ${key}.`);
        } else if (!isCell(value)) {
          errors.push(`Row ${index + 1}, field ${key}: use text up to ${TABLE_LIMITS.cellLength} characters, a finite number, a boolean, or null.`);
        }
      }
    });
  }

  if (!Array.isArray(config.actions) || config.actions.length > TABLE_LIMITS.actions) {
    errors.push(`Row actions must be an array containing at most ${TABLE_LIMITS.actions} actions.`);
  } else {
    const actionIds = new Set();
    config.actions.forEach((action, index) => {
      if (!isRecord(action) || !isKey(action.id) || !isText(action.label, 80)) {
        errors.push(`Action ${index + 1} needs a safe id and a label of 1 to 80 characters.`);
        return;
      }
      if (actionIds.has(action.id)) errors.push(`Duplicate action id: ${action.id}.`);
      actionIds.add(action.id);
    });
  }

  return { valid: errors.length === 0, errors };
}
