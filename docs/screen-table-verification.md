# Table consumers and verification

Both independent example applications now include table-mode ConfiguredScreen and
ConfiguredTable snapshots plus their stylesheet. Existing screen text, configured
Button/Dropdown components and action callback contracts are retained. The React
example adds vite.config.js as a wrapper around the existing vite-config.js so
Vite loads its configured plugin and server/preview ports.

The host owns two sample vehicle rows. View updates host feedback; it does not open
a modal or call an API. Show empty table and Restore sample rows demonstrate
reactive data and empty states. Consumer sample rows reset on a full reload; only
the workbench workspace has browser persistence.

After installing locked dependencies at the repository root, apps/workbench,
examples/screen-react and examples/screen-vue, run from the root:

    npx playwright install chromium
    node scripts/verify-screen-table.cjs --browser

The runner executes three Node unit-test files, builds the workbench and both
consumers, then runs the dedicated browser suite when --browser is supplied.
The browser suite serves production builds on ports 5190 (builder), 5191 (React),
and 5192 (Vue). Those ports must be free. It covers preview row feedback, invalid
JSON, persisted empty rows, host callbacks, empty/restore, mobile keyboard actions,
primary/dropdown regression behavior and native link navigation.

The GitHub workflow runs the same checks on branch pushes and pull requests.
Workflow presence is not evidence of a passing run: review its actual result.
Existing component parity tests remain unchanged and are separate. To run them
as well, install fixture dependencies and add --parity, or run npm test separately.
No HTML dropdown parity pass is inferred from the table suite.

The first table increment does not implement API integration, sorting, filtering,
pagination, editable cells, virtualization or production deployment. Do not merge
until build/browser checks pass; passing unit source tests alone is insufficient.
