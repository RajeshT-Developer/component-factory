<script>
const allowedStatuses = [
  "passed",
  "failed",
  "flaky",
  "skipped",
  "not-run",
  "error"
];

export default {
  name: "ParityResultsPanel",

  data() {
    return {
      report: null,
      error: "",
      loading: false
    };
  },

  computed: {
    rows() {
      if (!this.report) return [];

      return this.report.frameworks.flatMap(framework =>
        framework.checks.map(check => ({
          framework: framework.name,
          title: check.title,
          status: check.status,
          errors: check.errors
        }))
      );
    },

    passedCount() {
      return this.rows.filter(
        row => row.status === "passed"
      ).length;
    }
  },

  methods: {
    validateReport(report) {
      if (
        !report ||
        report.schemaVersion !== 1 ||
        report.component !== "Button" ||
        report.scope !== "reported-tests-only" ||
        !Array.isArray(report.frameworks) ||
        !report.run ||
        !Array.isArray(report.run.errors) ||
        !report.run.errors.every(
          error => typeof error === "string"
        ) ||
        typeof report.run.startedAt !== "string"
      ) {
        throw new Error(
          "Select a supported Button parity-summary.json file."
        );
      }

      if (
        !Number.isFinite(
          new Date(report.run.startedAt).getTime()
        )
      ) {
        throw new Error("The report has an invalid run timestamp.");
      }

      for (const framework of report.frameworks) {
        if (
          !framework ||
          typeof framework.name !== "string" ||
          !Array.isArray(framework.checks)
        ) {
          throw new Error("Invalid framework results.");
        }

        for (const check of framework.checks) {
          if (
            !check ||
            typeof check.title !== "string" ||
            !allowedStatuses.includes(check.status) ||
            !Array.isArray(check.errors) ||
            !check.errors.every(
              error => typeof error === "string"
            )
          ) {
            throw new Error("Invalid check results.");
          }
        }
      }
    },

    async loadReport(event) {
      const file = event.target.files?.[0];

      if (!file) return;

      this.report = null;
      this.error = "";
      this.loading = true;

      try {
        if (file.size > 5 * 1024 * 1024) {
          throw new Error("Select a report smaller than 5 MB.");
        }

        const report = JSON.parse(await file.text());

        this.validateReport(report);

        this.report = report;
      } catch (error) {
        this.error =
          error instanceof SyntaxError
            ? "This file is not valid JSON."
            : error.message;
      } finally {
        this.loading = false;

        // Allow the same file to be selected after regeneration.
        event.target.value = "";
      }
    }
  }
};
</script>

<template>
  <section
    class="factory-panel contract-panel"
    aria-labelledby="parity-results-title"
  >
    <h2 id="parity-results-title">Parity results</h2>

    <p class="field-help">
      Open reports/parity-summary.json from your repository.
      The file is read locally; it is not uploaded.
    </p>

    <div class="report-picker">
      <label for="parity-report-file">
        Select normalized JSON report
      </label>

      <input
        id="parity-report-file"
        type="file"
        accept=".json,application/json"
        :disabled="loading"
        @change="loadReport"
      >
    </div>

    <p v-if="loading" role="status">
      Reading report…
    </p>

    <p v-if="error" class="field-error" role="alert">
      {{ error }}
    </p>

    <template v-if="report">
      <p>
        Passed: {{ passedCount }} /
        {{ rows.length }} reported checks
      </p>

      <p class="field-help">
        Test run: {{ report.run.startedAt }}
      </p>

      <p class="report-notice">
        Saved report only—not a live test run.
        It may be partial and does not verify the current
        playground configuration.
      </p>

      <div v-if="report.run.errors.length">
        <h3>Run-level errors</h3>

        <ul>
          <li
            v-for="(message, index) in report.run.errors"
            :key="index"
            class="report-error"
          >
            {{ message }}
          </li>
        </ul>
      </div>

      <p v-if="rows.length === 0">
        This report contains no checks.
      </p>

      <div v-else class="report-table-wrapper">
        <table class="report-table">
          <caption>
            Reported checks by framework
          </caption>

          <thead>
            <tr>
              <th scope="col">Framework</th>
              <th scope="col">Check</th>
              <th scope="col">Status</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(row, index) in rows"
              :key="index"
            >
              <td>{{ row.framework }}</td>

              <td>
                {{ row.title }}

                <details v-if="row.errors.length">
                  <summary>View error details</summary>

                  <pre
                    v-for="(message, errorIndex) in row.errors"
                    :key="errorIndex"
                    class="report-error"
                  >{{ message }}</pre>
                </details>
              </td>

              <td>{{ row.status }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </section>
</template>

<style scoped>
.report-picker {
  display: grid;
  gap: 0.75rem;
  margin-block: 1rem;
}

.report-picker input {
  max-width: 100%;
}

.report-notice {
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  line-height: 1.6;
}

.report-table-wrapper {
  overflow-x: auto;
  margin-top: 1rem;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.report-table caption {
  padding-bottom: 0.75rem;
  text-align: left;
  font-weight: 600;
}

.report-table th,
.report-table td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
}

.report-table td {
  overflow-wrap: anywhere;
}

.report-error {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  color: #b91c1c;
}
</style>