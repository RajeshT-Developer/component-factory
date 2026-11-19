import { readFile } from "node:fs/promises";

const reportUrl = new URL(
  "../reports/parity-results.json",
  import.meta.url
);

function collectTests(suites, parentTitles = []) {
  const collected = [];

  for (const suite of suites) {
    const titles = [...parentTitles, suite.title].filter(Boolean);

    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) {
        const attempts = test.results ?? [];
        const latestAttempt = attempts.at(-1);

        collected.push({
          framework: test.projectName,
          check: [...titles, spec.title].join(" › "),

          // Playwright's assessment, such as expected,
          // unexpected, flaky, or skipped.
          outcome: test.status ?? "unknown",

          // Actual latest attempt status, such as passed,
          // failed, timedOut, skipped, or interrupted.
          latestStatus: latestAttempt?.status ?? "not-run",

          attempts: attempts.length,

          durationMs: latestAttempt?.duration ?? 0
        });
      }
    }

    collected.push(
      ...collectTests(suite.suites ?? [], titles)
    );
  }

  return collected;
}

async function main() {
  const contents = await readFile(reportUrl, "utf8");
  const report = JSON.parse(contents);

  if (!Array.isArray(report.suites)) {
    throw new Error("Report does not contain a suites array.");
  }

  const tests = collectTests(report.suites);

  console.log("\nPARITY REPORT");
  console.log("Started:", report.stats?.startTime ?? "Unavailable");
  console.log("Duration (ms):", report.stats?.duration ?? "Unavailable");
  console.log("Reported test cases:", tests.length);

  console.log("\nPlaywright run statistics:");
  console.log(JSON.stringify(report.stats ?? {}, null, 2));

  console.log("\nPer-test results:");
  console.table(tests);

  const globalErrors = report.errors ?? [];

  if (globalErrors.length > 0) {
    console.error("\nRun-level errors:");
    console.error(JSON.stringify(globalErrors, null, 2));
  }

  console.log(
    "\nScope note: this report represents the executed command. " +
    "Project filters and test-name filters may produce a partial run."
  );
}

main().catch(error => {
  console.error(
    "\nCould not inspect parity results:",
    error.message
  );

  process.exitCode = 1;
});