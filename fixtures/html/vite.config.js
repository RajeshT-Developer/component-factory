import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const buttonCssPath = fileURLToPath(
  new URL(
    "../../apps/workbench/src/styles/button.css",
    import.meta.url
  )
);

const dropdownCssPath = fileURLToPath(
  new URL(
    "../../shared/dropdown/dropdown.css",
    import.meta.url
  )
);

const dropdownJsPath = fileURLToPath(
  new URL(
    "../../shared/dropdown/dropdown.js",
    import.meta.url
  )
);

export default defineConfig({
  server: {
    host: "127.0.0.1",
    port: 5174,
    strictPort: true,

    fs: {
      allow: [
        fileURLToPath(new URL(".", import.meta.url)),
        buttonCssPath,
        dropdownCssPath,
        dropdownJsPath
      ]
    }
  },

  preview: {
    host: "127.0.0.1",
    port: 4174,
    strictPort: true
  }
});