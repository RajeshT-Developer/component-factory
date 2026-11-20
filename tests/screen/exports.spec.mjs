import { test, expect } from "@playwright/test";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createServer } from "node:http";
import { readFile, writeFile, mkdir, mkdtemp, rm, cp } from "node:fs/promises";
import path from "node:path";
const repo = fileURLToPath(new URL("../../", import.meta.url));
const { unzipSync, strFromU8 } = createRequire(new URL("../../apps/workbench/package.json", import.meta.url))("fflate");
const title = 'Export <screen> & "quotes"';
const rows = [{ id: "host-1", model: "Freshly exported vehicle", status: "Available" }];

async function write(target, content) {
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, content, "utf8");
}
async function serve(directory) {
  const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json" };
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
      const target = path.resolve(directory, "." + (pathname === "/" ? "/index.html" : pathname));
      if (!target.startsWith(directory + path.sep)) { response.writeHead(403).end(); return; }
      const content = await readFile(target);
      response.writeHead(200, { "Content-Type": types[path.extname(target)] || "application/octet-stream" });
      response.end(content);
    } catch { response.writeHead(404).end(); }
  });
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  return { server, url: `http://127.0.0.1:${server.address().port}/` };
}
async function buildConsumer(scratch, framework, consumerRoot) {
  await write(path.join(scratch, "package.json"), '{"private":true,"type":"module"}');
  const entry = framework === "react" ? "main.jsx" : "main.js";
  await write(path.join(scratch, "index.html"), `<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>Fresh export check</title></head><body><div id="root"></div><script type="module" src="/src/${entry}"></script></body></html>`);
  if (framework === "react") {
    await write(path.join(scratch, "src/main.jsx"), `import { useState } from "react";
import { createRoot } from "react-dom/client";
import ConfiguredScreen from "./generated/ConfiguredScreen.jsx";
function Host() {
  const [rows, setRows] = useState(${JSON.stringify(rows)});
  const [status, setStatus] = useState("Ready");
  return <><p data-testid="export-feedback">{status}</p><button onClick={() => setRows([])}>Clear exported rows</button><ConfiguredScreen rows={rows} onRowAction={(action, row) => setStatus(action + ":" + row.id)} /></>;
}
createRoot(document.getElementById("root")).render(<Host />);`);
  } else {
    await write(path.join(scratch, "src/main.js"), 'import { createApp } from "vue"; import Host from "./Host.vue"; createApp(Host).mount("#root");');
    await write(path.join(scratch, "src/Host.vue"), `<script setup>
import { ref } from "vue";
import ConfiguredScreen from "./generated/ConfiguredScreen.vue";
const rows = ref(${JSON.stringify(rows)});
const status = ref("Ready");
function action(name, row) { status.value = name + ":" + row.id; }
</script>
<template><p data-testid="export-feedback">{{ status }}</p><button @click="rows = []">Clear exported rows</button><ConfiguredScreen :rows="rows" @row-action="action" /></template>`);
  }
  const require = createRequire(path.join(consumerRoot, "package.json"));
  const { build } = await import(pathToFileURL(require.resolve("vite")).href);
  const { default: plugin } = await import(pathToFileURL(require.resolve(framework === "react" ? "@vitejs/plugin-react" : "@vitejs/plugin-vue")).href);
  await build({ root: scratch, configFile: false, plugins: [plugin()], logLevel: "warn", build: { outDir: "dist", emptyOutDir: true } });
  return path.join(scratch, "dist");
}
for (const framework of ["html", "react", "vue"]) {
  test(`fresh ${framework} ZIP exports run outside the workbench`, async ({ page }, info) => {
    test.setTimeout(90000);
    let scratch, server, exportedPage;
    try {
      await page.goto("/");
      await page.getByLabel("Mode", { exact: true }).selectOption("screen");
      await page.getByLabel("Content type", { exact: true }).selectOption("table");
      await page.getByLabel("Screen title", { exact: true }).fill(title);
      const panel = page.getByRole("region", { name: "Export screen", exact: true });
      await panel.getByRole("combobox").selectOption(framework);
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        panel.getByRole("button", { name: "Download package (.zip)", exact: true }).click()
      ]);
      expect(await download.failure()).toBeNull();
      const entries = unzipSync(await readFile(await download.path()));
      expect(Object.keys(entries)).toContain("README.txt");
      const consumerRoot = path.join(repo, "examples", framework === "vue" ? "screen-vue" : "screen-react");
      scratch = await mkdtemp(path.join(consumerRoot, ".export-check-"));
      const destination = framework === "html" ? scratch : path.join(scratch, "src/generated");
      for (const [name, source] of Object.entries(entries)) {
        if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(name) || name.includes("..")) throw new Error("Unsafe export filename: " + name);
        await write(path.join(destination, name), strFromU8(source));
      }
      const directory = framework === "html" ? scratch : await buildConsumer(scratch, framework, consumerRoot);
      const hosted = await serve(directory);
      server = hosted.server;
      exportedPage = await page.context().newPage();
      const errors = [];
      exportedPage.on("pageerror", error => errors.push(error.message));
      await exportedPage.goto(hosted.url);
      await expect(exportedPage.getByRole("heading", { level: 1 })).toHaveText(title);
      if (framework === "html") {
        await exportedPage.evaluate(() => {
          document.addEventListener("table-row-action", event => {
            document.documentElement.dataset.selectedRow = event.detail.action + ":" + event.detail.row.id;
          });
        });
        await exportedPage.getByRole("button", { name: "View: vehicle-1", exact: true }).click();
        await expect(exportedPage.locator(".screen-feedback")).toHaveText("View: vehicle-1");
        await expect(exportedPage.locator("html")).toHaveAttribute("data-selected-row", "view:vehicle-1");
      } else {
        await expect(exportedPage.getByRole("cell", { name: "Freshly exported vehicle", exact: true })).toBeVisible();
        await exportedPage.getByRole("button", { name: "View: host-1", exact: true }).click();
        await expect(exportedPage.getByTestId("export-feedback")).toHaveText("view:host-1");
        await exportedPage.getByRole("button", { name: "Clear exported rows", exact: true }).click();
        await expect(exportedPage.getByRole("cell", { name: "No vehicles available.", exact: true })).toBeVisible();
      }
      expect(errors).toEqual([]);
    } catch (error) {
      if (scratch) await cp(scratch, info.outputPath("fresh-export"), { recursive: true }).catch(() => {});
      throw error;
    } finally {
      if (exportedPage) await exportedPage.close();
      if (server) await new Promise(resolve => server.close(resolve));
      if (scratch) await rm(scratch, { recursive: true, force: true });
    }
  });
}
