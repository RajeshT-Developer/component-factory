import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { createDefaultTableConfig } from "../../apps/workbench/src/models/tableConfig.js";
import { htmlTable, htmlTableRuntime, frameworkTable, serialize } from "../../apps/workbench/src/generators/tableSource.js";

test("HTML includes caption, scoped headers and native buttons", () => {
  const html = htmlTable(createDefaultTableConfig());
  assert.match(html, /<caption>Vehicle inventory<\/caption>/);
  assert.match(html, /<th scope="col">Model/);
  assert.match(html, /type="button" data-row="0"/);
});
test("HTML escapes labels, cells and attribute values", () => {
  const config = createDefaultTableConfig();
  config.caption = '<img src=x onerror="bad()">';
  config.columns[0].label = "<script>bad()</script>";
  config.rows[0].model = "<svg onload=bad()>";
  config.actions[0].label = '"<action>';
  const html = htmlTable(config);
  assert.doesNotMatch(html, /<img|<script|<svg|<action>/);
  assert.match(html, /&lt;svg/);
});
test("empty state spans the correct number of columns", () => {
  const config = createDefaultTableConfig(); config.rows = [];
  assert.match(htmlTable(config), /colspan="3"/);
  config.actions = [];
  assert.match(htmlTable(config), /colspan="2"/);
  assert.doesNotMatch(htmlTable(config), /<th scope="col">Actions/);
});
test("zero and false are preserved; absent cells are blank", () => {
  const config = createDefaultTableConfig();
  config.rows = [{ id: "one", model: false, status: 0 }, { id: "two" }];
  const html = htmlTable(config);
  assert.match(html, /<td>false<\/td><td>0<\/td>/);
  assert.match(html, /<td><\/td><td><\/td>/);
});
test("invalid table configurations and frameworks are rejected", () => {
  assert.throws(() => htmlTable(null));
  assert.throws(() => htmlTableRuntime(null));
  assert.throws(() => frameworkTable(null, "react"));
  assert.throws(() => frameworkTable(createDefaultTableConfig(), "other"));
});
test("serialized data cannot terminate a script element", () => {
  const value = { text: "</script><script>&\u2028\u2029" };
  const source = serialize(value);
  assert.doesNotMatch(source, /<|>|&|\u2028|\u2029/);
  assert.deepEqual(JSON.parse(source), value);
});
test("HTML runtime dispatches selected action and row", () => {
  let listener, emitted;
  const feedback = { textContent: "" };
  const button = { dataset: { row: "1", action: "0" } };
  class Element { closest() { return button; } }
  const region = {
    contains: value => value === button,
    closest: () => ({ querySelector: () => feedback }),
    addEventListener: (_, handler) => { listener = handler; },
    dispatchEvent: event => { emitted = event; }
  };
  vm.runInNewContext(htmlTableRuntime(createDefaultTableConfig()), {
    Element, document: { querySelector: () => region },
    CustomEvent: class { constructor(type, options) { this.type = type; Object.assign(this, options); } }
  });
  listener({ target: new Element() });
  assert.equal(emitted.type, "table-row-action");
  assert.equal(emitted.bubbles, true);
  assert.equal(emitted.detail.action, "view");
  assert.equal(emitted.detail.row.id, "vehicle-2");
  assert.match(feedback.textContent, /vehicle-2/);
  emitted = undefined; button.dataset.row = "999";
  listener({ target: new Element() });
  assert.equal(emitted, undefined);
});
for (const framework of ["react", "vue"]) {
  test(`${framework} output omits sample data and exposes row actions`, () => {
    const config = createDefaultTableConfig(); config.rows[0].model = "PRIVATE_SAMPLE";
    const source = frameworkTable(config, framework);
    assert.doesNotMatch(source, /PRIVATE_SAMPLE/);
    assert.match(source, /row-action|onRowAction/);
    assert.match(source, /checkedRows/);
    assert.match(source, /screen.css/);
  });
}
