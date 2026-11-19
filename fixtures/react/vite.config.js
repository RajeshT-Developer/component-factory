import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const buttonCssPath = fileURLToPath(
  new URL(
    "../../apps/workbench/src/styles/button.css",
    import.meta.url
  )
);

const fixtureCssPath = fileURLToPath(
  new URL("../html/src/style.css", import.meta.url)
);

const sharedDropdownCssPath = fileURLToPath(
  new URL(
    "../../packages/styles/src/dropdown.css",
    import.meta.url
  )
);

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@factory-dropdown-css": sharedDropdownCssPath
    }
  },

  server: {
    host: "127.0.0.1",
    port: 5175,
    strictPort: true,

    fs: {
      allow: [
        fileURLToPath(new URL(".", import.meta.url)),
        buttonCssPath,
        fixtureCssPath,
        sharedDropdownCssPath
      ]
    }
  },

  preview: {
    host: "127.0.0.1",
    port: 4175,
    strictPort: true
  }
});