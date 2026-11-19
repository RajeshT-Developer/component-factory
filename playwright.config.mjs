import { defineConfig, devices } from "@playwright/test";

const fixtures = [
  {
    name: "html",
    port: 5174
  },
  {
    name: "react",
    port: 5175
  },
  {
    name: "vue",
    port: 5176
  }
];

export default defineConfig({
  testDir: "./tests/parity",

  timeout: 30_000,

  expect: {
    timeout: 5_000
  },

  fullyParallel: false,

  workers: 1,

  retries: 0,

  forbidOnly: Boolean(process.env.CI),

  reporter: [
    ["list"],

    ["html", {
      open: "never"
    }],

    ["json", {
      outputFile: "reports/parity-results.json"
    }]
  ],

  use: {
    ...devices["Desktop Chrome"],

    viewport: {
      width: 1280,
      height: 900
    },

    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },

  projects: fixtures.map(fixture => ({
    name: fixture.name,

    use: {
      baseURL: `http://127.0.0.1:${fixture.port}`
    }
  })),

  webServer: fixtures.map(fixture => ({
    command: `npm --prefix fixtures/${fixture.name} run dev`,

    url: `http://127.0.0.1:${fixture.port}`,

    timeout: 120_000,

    reuseExistingServer: false
  }))
});