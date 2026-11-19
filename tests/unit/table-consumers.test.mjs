import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
for (const framework of ["react", "vue"]) {
  const extension = framework === "react" ? "jsx" : "vue";
  const base = new URL(`../../examples/screen-${framework}/src/generated/`, import.meta.url);
  test(`${framework}: table definition contains no sample rows`, async () => {
    const source = await readFile(new URL(`ConfiguredTable.${extension}`, base), "utf8");
    const definition = JSON.parse(source.match(/const table = ([\s\S]*?);/)[1]);
    assert.equal(Object.hasOwn(definition, "rows"), false);
    assert.equal(definition.columns.length, 2);
    assert.equal(definition.actions[0].id, "view");
  });
  test(`${framework}: exported runtime validates host data`, async () => {
    const source = await readFile(new URL(`ConfiguredTable.${extension}`, base), "utf8");
    const end = framework === "react" ? "export default function" : "const data = computed";
    const code = source.slice(source.indexOf("const table ="), source.indexOf(end))
      .replace(/const props = defineProps\([^\n]+\);\n/, "")
      .replace(/const emit = defineEmits\([^\n]+\);\n/, "");
    const check = vm.runInNewContext(code + "\ncheckedRows;", {});
    assert.throws(() => check(null));
    assert.throws(() => check([{ id: "one" }, { id: "one" }]));
    assert.throws(() => check([{ id: "one", model: {} }]));
    assert.throws(() => check([{ id: "one", model: Infinity }]));
    assert.equal(check([]).length, 0);
    assert.equal(check([{ id: "one", model: false, status: 0 }]).length, 1);
  });
  test(`${framework}: screen forwards existing and new host actions`, async () => {
    const source = await readFile(new URL(`ConfiguredScreen.${extension}`, base), "utf8");
    const definition = JSON.parse(source.match(/const screen = ([\s\S]*?);/)[1]);
    assert.equal(definition.contentMode, "table");
    assert.equal(Object.hasOwn(definition, "table"), false);
    assert.match(source, /onPrimaryAction|primary-action/);
    assert.match(source, /onDropdownAction|dropdown-action/);
    assert.match(source, /onRowAction|row-action/);
    assert.match(source, /rows/);
  });
  test(`${framework}: table stylesheet is included`, async () => {
    const css = await readFile(new URL("screen.css", base), "utf8");
    assert.match(css, /\.screen-table-scroll/);
    assert.match(css, /overflow-x: auto/);
    assert.match(css, /focus-visible/);
  });
}
