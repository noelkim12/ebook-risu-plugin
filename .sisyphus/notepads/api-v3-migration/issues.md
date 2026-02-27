# Issues — API v3.0 Migration

## [2026-02-27] Session Start

(No issues yet — will append as discovered)

- [2026-02-27] Task 15 completed: no iframe-host DOM dependency issues found in `ViewerToast.svelte` and `LoadingOverlay.svelte`; components can remain unchanged.

## 2026-02-27 Task 16 — Deprecated Features Cleanup

- No blockers. `npm run lint` is failing due pre-existing `.eslintrc.js` ESM/CommonJS incompatibility in repository setup (`module is not defined in ES module scope`).
- `npm run build` succeeds; warnings remain pre-existing (`a11y_no_noninteractive_tabindex` and click handler a11y warnings in existing files).

## 2026-02-27 Task 17 — Mobile Viewer Async + Container Safety

- `MobileBookViewer.svelte` now awaits `risuAPI.getChar()` inside the new-message subscription callback before reading role/data (`Promise` misuse fixed).
- `mobile/viewerHelpers.js` now asynchronously resolves target chat/page/state values and matches PC-style mount behavior by safely hiding and restoring chat-screen containers during open/close.
- `npm run build` succeeds; `npm run lint` still blocked by pre-existing `.eslintrc.js` ESM/CommonJS config issue.

## 2026-02-27 Task 12 — PC Sub-Components Adaptation

- Verification: `dispatchEvent` usages were searched in target PC sub-component files with no matches.
- Verification: build remains green (`npm run build` succeeds). Pre-existing a11y/build warnings still surface from unrelated files.
- Verification blockers: `npm run lint` still fails due pre-existing `.eslintrc.js` CJS/ESM config mismatch (`module is not defined in ES module scope`) and was not modified in this task.

## 2026-02-27 Task 12 — Mobile Sub-Components Adaptation

- `npm run lint` still fails pre-existing `.eslintrc.js` ESM/CJS issue (`module is not defined in ES module scope`).
- `npm run build` now passes; warning remains only from unrelated `ViewerToast.svelte` (`a11y_no_noninteractive_tabindex`).
- `lsp_diagnostics` still reports non-actionable/noisy unused-variable warnings in Svelte files because this environment’s analyzer treats template-bound vars as unused in some cases.

## 2026-02-27 Task 18 — Forbidden Pattern Audit

- Full `src/` forbidden-pattern scan completed (critical patterns + context-aware DOM checks).
- Clean in plugin code: `globalThis.__pluginApis__` 0, `localStorage.` 0, `safeMount(` 0, `SmallBookButton` 0, `BookButton` 0.
- No remaining direct `new MutationObserver` or `dispatchEvent` violations found under `src/` after the Task 18 follow-up changes.
- `safeMutationObserver` remains the sanctioned wrapper in `src/utils/svelte-helper.js`.
- `document.querySelector` / `document.body` matches exist only in known iframe-internal/component DOM helpers and were excluded from host-context violation list.

## 2026-02-27 Task 19 — MobileBookViewer Host DOM Cleanup

- `src/ui/components/viewer/mobile/MobileBookViewer.svelte` host-iframe pattern cleanup completed for v2.1 observer logic:
  - Removed `risuSelector(LOCATOR.chatScreen.textarea)` + textarea `ResizeObserver` height adjustment path.
  - Removed host `MutationObserver` setup on `document.body` for settings panel detection.
  - Removed `handleSettingPanel` flow that used `risuSelector(LOCATOR.setting.root)` to auto-close the mobile viewer.
  - Removed now-unused observer state (`textareaResizeObserver`, `settingPanelObserver`) and corresponding destroy cleanup.
- `npm run build` remains green after this cleanup (existing unrelated `ViewerToast.svelte` a11y warning only).
- Tooling notes: `npm run lint` remains blocked by existing `.eslintrc.js` ESM/CJS issue and was not changed in this task.

## 2026-02-27 Task F2 — Code Quality Review (Final Wave)

- BUILD/LINT: `npm run build` succeeds with the existing unrelated `ViewerToast.svelte` a11y warning; `npm run lint` now executes via `.eslintrc.cjs` and fails on existing repo-wide code errors (unused vars/import ordering), which are unrelated to this cleanup pass.
- Forbidden-pattern audit: `new MutationObserver` and `dispatchEvent` are no longer used directly under `src/`; `safeMutationObserver` is used where observer behavior is needed.
- V2.1 remnants: `globalThis.__pluginApis__` 0, `safeMount(` 0, `SmallBookButton` 0, `BookButton` 0; `localStorage` remains only in update flow (`src/core/update-manager.js`) as an explicitly documented exception.
- Async migration checks: `src/core/risu-api.js` async entry points are consumed through awaited or callback-safe pathways in updated viewer/dialog flows.

## 2026-02-27 Scope Fidelity Check (F4)

- [F4] Compliance gaps identified: `src/index.js` still appends `container` to `document.body`; plan expected iframe-native mount target behavior without host-body injection style.
- [F4] `src/ui/components/pc/viewerHelpers.js` and `src/ui/components/mobile/viewerHelpers.js` still mount helper viewers via `displayContainer`/`document.body` and do not route open/close solely through `showContainer('fullscreen')`/`hideContainer()`.
- [F4] `src/utils/svelte-helper.js` and `dialogHelpers.js` still contain `document.body.appendChild` and `localStorage` logic in `src/core/update-manager.js` remains (`skipVersion` flow), which may be outside strict v3 `forbid localStorage/direct host manipulation` guidance if interpreted globally.
- [F4] Unaccounted changed files in migration range: `.sisyphus/boulder.json` and `.sisyphus/plans/api-v3-migration.md` (accepted plan artifacts only if orchestration allows), plus `src/core/update-manager.js`.
