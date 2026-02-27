# Issues — API v3.0 Migration

## [2026-02-27] Session Start

(No issues yet — will append as discovered)

- [2026-02-27] Task 15 completed: no iframe-host DOM dependency issues found in `ViewerToast.svelte` and `LoadingOverlay.svelte`; components can remain unchanged.

## 2026-02-27 Task 16 — Deprecated Features Cleanup

- No blockers. `npm run lint` is failing due pre-existing `.eslintrc.js` ESM/CommonJS incompatibility in repository setup (`module is not defined in ES module scope`).
- `npm run build` succeeds; warnings remain pre-existing (`a11y_no_noninteractive_tabindex` and click handler a11y warnings in existing files).

## 2026-02-27 Task 12 — PC Sub-Components Adaptation
- Verification: `dispatchEvent` usages were searched in target PC sub-component files with no matches.
- Verification: build remains green (`npm run build` succeeds). Pre-existing a11y/build warnings still surface from unrelated files.
- Verification blockers: `npm run lint` still fails due pre-existing `.eslintrc.js` CJS/ESM config mismatch (`module is not defined in ES module scope`) and was not modified in this task.

## 2026-02-27 Task 12 — Mobile Sub-Components Adaptation
- `npm run lint` still fails pre-existing `.eslintrc.js` ESM/CJS issue (`module is not defined in ES module scope`).
- `npm run build` now passes; warning remains only from unrelated `ViewerToast.svelte` (`a11y_no_noninteractive_tabindex`).
- `lsp_diagnostics` still reports non-actionable/noisy unused-variable warnings in Svelte files because this environment’s analyzer treats template-bound vars as unused in some cases.
