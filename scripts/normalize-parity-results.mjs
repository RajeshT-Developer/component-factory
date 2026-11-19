import { readFile, writeFile } from "node:fs/promises";

const inputUrl = new URL(
  "../reports/parity-results.json",
  import.meta.url
);

const outputUrl = new URL(
  "../reports/parity-summary.json",
  import.meta.url
);

const statuses = [
  "passed",
  "failed",
  "flaky",
  "skipped",
  "not-run",
  "error"
];

function createCounts() {
  return Object.fromEntries(
    statuses.map(status => [status, 0])
  );
}

function normalizeStatus(test) {
  const attempts = test.results ?? [];
  const latest = attempts.at(-1);

  if (!latest) {
    return "not-run";
  }

  if (latest.status === "skipped") {
    return "skipped";
  }

  if (
    latest.status === "timedOut" ||
    latest.status === "interrupted"
  ) {
    return "error";
  }

  if (latest.status === "failed") {
    return "failed";
  }

  if (latest.status !== "passed") {
    return "error";
  }

  // A passing attempt can still be unexpected:
  // for example, a test annotated as expected to fail.
  if (test.status === "unexpected") {
    return "failed";
  }

  const hadUnsuccessfulAttempt = attempts.some(attempt =>
    ["failed", "timedOut", "interrupted"].includes(
      attempt.status
    )
  );

  if (
    test.status === "flaky" ||
    hadUnsuccessfulAttempt
  ) {
    return "flaky";
  }

  if (test.status !== "expected") {
    return "error";
  }

  return "passed";
}

function collectChecks(suites, parentTitles = []) {
  const checks = [];

  for (const suite of suites) {
    const suiteTitles = [
      ...parentTitles,
      suite.title
    ].filter(Boolean);

    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) {
        const attempts = test.results ?? [];

        const errors = attempts.flatMap(attempt =>
          (attempt.errors ?? []).map(error =>
            error.message ??
            error.value ??
            "Unknown test error"
          )
        );

        checks.push({
          framework: test.projectName ?? "unknown",

          title: spec.title,

          suitePath: suiteTitles,

          location: {
            file: spec.file ?? suite.file ?? null,
            line: spec.line ?? null
          },

          status: normalizeStatus(test),

          playwrightOutcome: test.status ?? "unknown",

          latestAttemptStatus:
            attempts.at(-1)?.status ?? "not-run",

          attemptCount: attempts.length,

          durationMs: attempts.reduce(
            (total, attempt) =>
              total + (attempt.duration ?? 0),
            0
          ),

          errors
        });
      }
    }

    checks.push(
      ...collectChecks(
        suite.suites ?? [],
        suiteTitles
      )
    );
  }

  return checks;
}

async function main() {
  const rawContents = await readFile(inputUrl, "utf8");
  const report = JSON.parse(rawContents);

  if (!Array.isArray(report.suites)) {
    throw new Error(
      "Invalid Playwright report: suites must be an array."
    );
  }

  const checks = collectChecks(report.suites);

  const frameworkNames = [
    ...new Set([
      ...(report.config?.projects ?? [])
        .map(project => project.name),

      ...checks.map(check => check.framework)
    ])
  ];

  const frameworks = frameworkNames.map(name => {
    const frameworkChecks = checks.filter(
      check => check.framework === name
    );

    const counts = createCounts();

    for (const check of frameworkChecks) {
      counts[check.status] += 1;
    }

    return {
      name,
      reportedCheckCount: frameworkChecks.length,
      counts,
      checks: frameworkChecks
    };
  });

  const counts = createCounts();

  for (const check of checks) {
    counts[check.status] += 1;
  }

  const summary = {
    schemaVersion: 1,

    component: "Button",

    scope: "reported-tests-only",

    sourceReport: "parity-results.json",

    generatedAt: new Date().toISOString(),

    run: {
      startedAt: report.stats?.startTime ?? null,
      durationMs: report.stats?.duration ?? null,
      errors: (report.errors ?? []).map(error =>
        error.message ??
        error.value ??
        "Unknown run-level error"
      )
    },

    reportedCheckCount: checks.length,

    counts,

    frameworks
  };

  await writeFile(
    outputUrl,
    JSON.stringify(summary, null, 2) + "\n",
    "utf8"
  );

  console.log("\nParity summary written successfully.");

  console.table(
    frameworks.map(framework => ({
      framework: framework.name,
      reported: framework.reportedCheckCount,
      ...framework.counts
    }))
  );

  console.log(
    "\nRun-level errors:",
    summary.run.errors.length
  );

  console.log(
    "Scope: reported tests only; completeness is not verified."
  );
}

main().catch(error => {
  console.error(
    "\nCould not normalize parity results:",
    error.message
  );

  process.exitCode = 1;
});