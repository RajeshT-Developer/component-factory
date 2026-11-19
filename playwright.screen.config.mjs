import { defineConfig, devices } from "@playwright/test";
const apps = [
  { name: "builder", directory: "apps/workbench", port: 5190, match: /(?:builder|exports|project)\.spec\.mjs/ },
  { name: "react", directory: "examples/screen-react", port: 5191, match: /consumers\.spec\.mjs/ },
  { name: "vue", directory: "examples/screen-vue", port: 5192, match: /consumers\.spec\.mjs/ }
];
export default defineConfig({
  testDir: "./tests/screen",
  workers: 1,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  timeout: 30000,
  reporter: "list",
  use: { ...devices["Desktop Chrome"], trace: "retain-on-failure" },
  projects: apps.map(app => ({ name: app.name, testMatch: app.match, use: { baseURL: `http://127.0.0.1:${app.port}` } })),
  webServer: apps.map(app => ({
    command: `npm --prefix ${app.directory} run preview -- --host 127.0.0.1 --port ${app.port} --strictPort`,
    url: `http://127.0.0.1:${app.port}`,
    reuseExistingServer: false,
    timeout: 120000
  }))
});
