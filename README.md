# Component Factory

Configure reusable Button and Dropdown components, compose a text/table screen,
and export source packages for HTML, React and Vue. This repository contains the
Vue workbench, shared component implementations, parity fixtures and independent
screen consumers. It is not a backend application or a hosted deployment.

## Requirements and quick start

Use Node.js 22 and npm (the CI application runtime is Node 22). Run commands from
the repository root. Each application has its own package manifest and lockfile.

    npm ci
    npm ci --prefix apps/workbench
    npm --prefix apps/workbench run dev

Open the address Vite prints. Keep the same hostname/port when checking browser
persistence; workspaces saved at localhost are separate from 127.0.0.1.

## Workbench workflow

1. In Component editor, configure the Button and Dropdown.
2. Select Screen builder. Edit screen text and choose Text or Table content.
3. For tables, edit columns/actions and sample-row JSON, then Apply table changes.
   Draft table edits are not saved until applied. Rows require unique string ids.
4. Preview the screen at available or mobile width. View updates the preview
   feedback; it does not open a details page or perform a business operation.
5. Choose HTML, React or Vue in Export screen and download the source ZIP.

Browser saving and Save project/Open project preserve editable configurations.
A project JSON file is not a generated application or a source export.
Old projects without table fields continue to use text content.

## Consume exported screens

HTML: extract all files together and open index.html. HTML output includes the
configured sample rows; review that data before distributing the package.

React/Vue: keep all exported files together in an existing application with the
appropriate framework compiler and CSS-import support. Render ConfiguredScreen.
Exports are source components, not complete application scaffolds.

React accepts rows, onPrimaryAction, onDropdownAction and onRowAction(action, row).
Vue accepts rows and emits primary-action, dropdown-action and row-action(action,
row). Framework exports do not embed table sample rows; rows default to [].
HTML emits screen-action, dropdown-action and table-row-action DOM events; the
table event.detail contains { action, row }.

The host implements navigation destinations and business/API operations.
Table cells display text, not injected HTML. Existing content anchors include
#factory-cars; rendering multiple screens requires managing anchor collisions.

## Run the independent examples

    npm ci --prefix examples/screen-react
    npm ci --prefix examples/screen-vue
    npm --prefix examples/screen-react run build
    npm --prefix examples/screen-vue run build

In separate terminals, run each preview command:

    npm --prefix examples/screen-react run preview
    npm --prefix examples/screen-vue run preview

Use the addresses printed by Vite. Both examples demonstrate host-owned rows,
row-action feedback and empty/restore controls. Their host data resets on reload;
only the workbench workspace has browser persistence.

## Verification

Install root/workbench/both example dependencies as above, then:

    npx playwright install chromium
    node scripts/verify-screen-table.cjs --browser

This runs Node unit tests, all three application builds and the screen suite.
The suite uses production previews on ports 5190-5192; those ports must be free.
It checks project save/open and legacy project imports, and downloads fresh HTML/React/Vue ZIPs from the workbench. HTML runs as a
standalone page; React/Vue are built in disposable consumers using installed
framework dependencies, without replacing the committed consumer source files.

For the separate existing component parity suite:

    npm ci --prefix fixtures/html
    npm ci --prefix fixtures/react
    npm ci --prefix fixtures/vue
    npm test

Both verify and parity jobs must be green in GitHub Actions before a release.
New workflow/tests are not proof of a passing run. See docs/release-checklist.md.

## Repository map

- apps/workbench: authoring UI, configuration models and source generators.
- shared and packages: shared styles/runtimes and framework components.
- fixtures: component-level HTML/React/Vue parity applications.
- examples/screen-react and examples/screen-vue: independent screen consumers.
- tests/unit, tests/screen and tests/parity: distinct verification layers.
- docs: table integration guidance and release readiness checklist.

## Scope and security

This first-release scope excludes API integration, sorting/filtering, pagination,
editable cells, virtualization, package-registry publishing and deployment.
Do not commit credentials, private keys or secret-bearing .env files. Do not put
private production data in examples intended for exported packages or CI artifacts.
