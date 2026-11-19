# First-release readiness

This is an acceptance checklist, not a record that the release has passed.
Do not mark an item complete without evidence from the final candidate commit.

## Required before merge/release

- [ ] verify job passes unit tests, workbench/React/Vue production builds, and all
      screen browser checks, including fresh HTML/React/Vue ZIP consumption and project-file round trips.
- [ ] parity job passes the unchanged component suite for HTML, React and Vue;
      inspect any skips rather than inferring coverage from a green job alone.
- [ ] Fix actual failures without disabling tests or replacing assertions with
      weaker checks. Review source changes and generated-output differences.
- [ ] Confirm project JSON save/open and browser restoration retain applied table
      settings. Unapplied drafts should not be presented as persisted changes.
- [ ] Root README setup/export/consumer instructions match current commands.
- [ ] Review known limits, licensing and distribution scope before publishing.
- [ ] Record the final candidate SHA, CI run references, pass/skip counts and any
      remaining limitations. A release tag must refer to that verified candidate.

## Verification layers

1. Model/source unit tests catch invalid configuration and source/runtime defects.
2. Committed consumer tests check example integration and existing action contracts.
3. Fresh-export tests use actual downloaded ZIPs. React/Vue are compiled and served
   from disposable projects; HTML is served with its own exported scripts/styles.
   These projects reuse installed tooling/dependencies, not committed generated
   component files. This does not test every framework/dependency version.
4. Separate component parity tests cover the existing framework fixture scenarios.

The workbench table workflow already merged via PR #2. Passing that earlier
workflow does not establish fresh-export or full parity results for this branch.

## Deferred, not release blockers for this scope

Backend/API behavior, sorting/filtering, pagination, editable cells, virtualization,
multi-screen anchor namespacing, public package publishing and hosted deployment.
No publication, tag or deployment is performed by this readiness change.
