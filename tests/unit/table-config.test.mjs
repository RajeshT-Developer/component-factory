import test from "node:test";
import assert from "node:assert/strict";
import { createDefaultTableConfig, validateTableConfig, TABLE_LIMITS } from "../../apps/workbench/src/models/tableConfig.js";
import { createDefaultScreenConfig, validateScreenConfig } from "../../apps/workbench/src/models/screenConfig.js";

function checkMutation(mutate) {
  const config = createDefaultTableConfig();
  mutate(config);
  assert.equal(validateTableConfig(config).valid, false);
}

const invalidCases = [
  ["duplicate column keys", c => c.columns.push({ ...c.columns[0] })],
  ["unsafe column keys", c => { c.columns[0].key = "constructor"; }],
  ["nested column paths", c => { c.columns[0].key = "vehicle.model"; }],
  ["empty columns", c => { c.columns = []; }],
  ["too many columns", c => { c.columns = Array.from({ length: TABLE_LIMITS.columns + 1 }, (_, i) => ({ key: `field${i}`, label: `Field ${i}` })); }],
  ["blank caption", c => { c.caption = " "; }],
  ["blank empty-state message", c => { c.emptyMessage = ""; }],
  ["duplicate row ids", c => { c.rows[1].id = c.rows[0].id; }],
  ["missing row ids", c => { delete c.rows[0].id; }],
  ["numeric row ids", c => { c.rows[0].id = 1; }],
  ["unconfigured row fields", c => { c.rows[0].unknown = "value"; }],
  ["nested cell objects", c => { c.rows[0].model = { label: "nested" }; }],
  ["non-finite numbers", c => { c.rows[0].model = Infinity; }],
  ["oversized cells", c => { c.rows[0].model = "x".repeat(TABLE_LIMITS.cellLength + 1); }],
  ["too many sample rows", c => { c.rows = Array.from({ length: TABLE_LIMITS.rows + 1 }, (_, i) => ({ id: `row-${i}` })); }],
  ["duplicate action ids", c => c.actions.push({ ...c.actions[0] })],
  ["unsafe action ids", c => { c.actions[0].id = "__proto__"; }],
  ["too many actions", c => { c.actions = Array.from({ length: TABLE_LIMITS.actions + 1 }, (_, i) => ({ id: `action${i}`, label: `Action ${i}` })); }],
  ["array instead of row", c => { c.rows = [[]]; }],
  ["unsafe JSON row key", c => { c.rows = [JSON.parse('{"id":"row-1","__proto__":"unsafe"}')]; }]
];

for (const [name, mutate] of invalidCases) {
  test(`rejects ${name}`, () => checkMutation(mutate));
}

test("default table and screen configurations are valid", () => {
  assert.equal(validateTableConfig(createDefaultTableConfig()).valid, true);
  assert.equal(validateScreenConfig(createDefaultScreenConfig()).valid, true);
});

test("default table configurations do not share nested references", () => {
  const first = createDefaultTableConfig();
  const second = createDefaultTableConfig();
  first.columns[0].label = "Changed";
  first.rows[0].model = "Changed";
  first.actions[0].label = "Changed";
  assert.equal(second.columns[0].label, "Model");
  assert.equal(second.rows[0].model, "City hatchback");
  assert.equal(second.actions[0].label, "View");
});

test("empty rows and no row actions are valid", () => {
  const config = createDefaultTableConfig();
  config.rows = [];
  config.actions = [];
  assert.equal(validateTableConfig(config).valid, true);
});

test("scalar cells and omitted cells are valid", () => {
  for (const value of [null, false, true, 0, 12.5, ""]) {
    const config = createDefaultTableConfig();
    config.rows[0].model = value;
    assert.equal(validateTableConfig(config).valid, true);
  }
  const config = createDefaultTableConfig();
  delete config.rows[0].model;
  assert.equal(validateTableConfig(config).valid, true);
});

test("legacy screens without table fields remain valid", () => {
  const screen = createDefaultScreenConfig();
  delete screen.contentMode;
  delete screen.table;
  assert.equal(validateScreenConfig(screen).valid, true);
});

test("table mode requires a valid table", () => {
  const screen = createDefaultScreenConfig();
  screen.contentMode = "table";
  assert.equal(validateScreenConfig(screen).valid, true);
  delete screen.table;
  assert.equal(validateScreenConfig(screen).valid, false);
});

test("invalid content modes and malformed optional tables are rejected", () => {
  const screen = createDefaultScreenConfig();
  screen.contentMode = "unsupported";
  assert.equal(validateScreenConfig(screen).valid, false);
  screen.contentMode = "text";
  screen.table = null;
  assert.equal(validateScreenConfig(screen).valid, false);
});

test("invalid top-level table input returns validation errors", () => {
  for (const value of [null, undefined, [], "table", 1]) {
    assert.equal(validateTableConfig(value).valid, false);
  }
});

test("JSON round trip preserves valid table screen configuration", () => {
  const screen = createDefaultScreenConfig();
  screen.contentMode = "table";
  const restored = JSON.parse(JSON.stringify(screen));
  assert.deepEqual(restored, screen);
  assert.equal(validateScreenConfig(restored).valid, true);
});
