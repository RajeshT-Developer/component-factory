import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "node:url";

const workbenchSourcePath = fileURLToPath(
  new URL("../../apps/workbench/src/", import.meta.url)
);

const buttonComponentPath = fileURLToPath(
  new URL(
    "../../apps/workbench/src/components/ui/UiButton.vue",
    import.meta.url
  )
);

const fixtureCssPath = fileURLToPath(
  new URL("../html/src/style.css", import.meta.url)
);

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      "@factory-button": buttonComponentPath
    },

    dedupe: ["vue"]
  },

  server: {
    host: "127.0.0.1",
    port: 5176,
    strictPort: true,

    fs: {
      allow: [
        fileURLToPath(new URL(".", import.meta.url)),
        workbenchSourcePath,
        fixtureCssPath
      ]
    }
  },

  preview: {
    host: "127.0.0.1",
    port: 4176,
    strictPort: true
  }
});