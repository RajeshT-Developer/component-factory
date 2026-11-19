import { generateButtonSource } from "./buttonSource.js";
import { generateDropdownFiles } from "./dropdownSource.js";
import { validateScreenConfig } from "../models/screenConfig.js";
import { generateScreenFrameworkFiles } from "./screenFrameworkSource.js";
import { escapeHtml, htmlTable, htmlTableRuntime, tableCss } from "./tableSource.js";
import screenCss from "../styles/screen.css?raw";

function extract(html, selector) {
  const element = new DOMParser().parseFromString(html, "text/html").querySelector(selector);
  if (!element) throw new Error(`Generated component is missing: ${selector}`);
  return element;
}
export function generateScreenFiles(config, buttonConfig, dropdownConfig, framework = "html") {
  if (!validateScreenConfig(config).valid) return [];
  if (["react", "vue"].includes(framework)) return generateScreenFrameworkFiles(config, buttonConfig, dropdownConfig, framework);
  if (framework !== "html") throw new Error(`Unsupported screen framework: ${framework}`);
  const button = generateButtonSource(buttonConfig, "html");
  const files = generateDropdownFiles(dropdownConfig, "html");
  if (!button || !files.length) return [];
  const source = name => files.find(file => file.filename === name)?.source;
  if (!source("index.html") || !source("dropdown.js") || !source("dropdown.css")) throw new Error("The dropdown export is incomplete.");
  const primary = extract(button.source, "button.ui-button");
  primary.id = "screen-primary-action";
  const dropdown = extract(source("index.html"), "[data-dropdown]");
  const e = escapeHtml;
  const isTable = config.contentMode === "table";
  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(config.title)}</title>
<link rel="stylesheet" href="./button.css">
<link rel="stylesheet" href="./dropdown.css">
<link rel="stylesheet" href="./screen.css">
<script src="./screen.js" defer></script>
</head><body>
<main class="screen-shell">
<header class="screen-header"><h1>${e(config.title)}</h1><p>${e(config.description)}</p></header>
<div class="screen-toolbar" role="group" aria-label="Screen actions">${dropdown.outerHTML}${primary.outerHTML}</div>
<p id="action-result" class="screen-feedback" role="status">Choose a navigation item or an action.</p>
<section id="factory-cars" class="screen-content" aria-labelledby="screen-content-title">
<h2 id="screen-content-title">${e(config.contentHeading)}</h2>
${isTable ? htmlTable(config.table) : `<p>${e(config.contentText)}</p>`}
</section></main>
</body></html>`;
  const javascript = `${source("dropdown.js")}
;(() => {
  const button = document.querySelector("#screen-primary-action");
  const result = document.querySelector("#action-result");
  button?.addEventListener("click", () => {
    if (button.disabled) return;
    if (result) result.textContent = "Primary action received. Connect your application behavior.";
    button.dispatchEvent(new CustomEvent("screen-action", { bubbles: true, detail: { action: "primary-action" } }));
  });
})();
${isTable ? htmlTableRuntime(config.table) : ""}`;
  return [
    { filename: "index.html", mimeType: "text/html", source: html },
    { filename: "button.css", mimeType: "text/css", source: button.stylesheet },
    { filename: "dropdown.css", mimeType: "text/css", source: source("dropdown.css") },
    { filename: "screen.css", mimeType: "text/css", source: screenCss + tableCss },
    { filename: "screen.js", mimeType: "text/javascript", source: javascript }
  ];
}
export function createScreenPreview(files) {
  if (!files.length) return "";
  let html = files.find(file => file.filename === "index.html")?.source;
  if (!html) return "";
  for (const name of ["button.css", "dropdown.css", "screen.css"]) {
    const css = files.find(file => file.filename === name);
    if (!css) throw new Error(`Preview stylesheet is missing: ${name}`);
    html = html.replace(`<link rel="stylesheet" href="./${name}">`, () => `<style>${css.source}</style>`);
  }
  const script = files.find(file => file.filename === "screen.js");
  if (!script) throw new Error("Preview JavaScript is missing.");
  const navigation = `
document.addEventListener("click", event => {
  if (!(event.target instanceof Element)) return;
  const link = event.target.closest("a");
  if (!link) return;
  event.preventDefault();
  const result = document.querySelector("#action-result");
  if (result) result.textContent = "Preview destination: " + link.getAttribute("href");
});`;
  const runtime = (script.source + "\n" + navigation).replace(/<\/script/gi, "<\\/script");
  html = html.replace('<script src="./screen.js" defer></script>', "");
  return html.replace("</body>", () => `<script>${runtime}</script>\n</body>`);
}
