# Learnings — API v3.0 Migration

## [2026-02-27] Task Execution Start

### Key Architecture Decisions

- **Iframe-native approach**: Build viewer UI inside plugin's iframe, use `showContainer('fullscreen')` for display
- **SafeDocument for host DOM**: All host DOM access through `risuai.getRootDocument()` → SafeElement
- **pluginStorage for settings**: Replaces localStorage for cross-device sync

### SafeElement Critical Restrictions

- `data-*` attributes: NOT POSSIBLE (only x- prefix)
- `getComputedStyle()`: NOT AVAILABLE
- `element.closest()`: NOT AVAILABLE (use getParent() loop)
- Events blocked: input, change, focus, blur, submit, resize, load, error

### Files Already Identified for Rewrite

- src/index.js — Entry point
- src/core/risu-api.js — API wrapper
- src/App.svelte — Root component
- src/utils/selector.js — DOM selectors
- src/utils/svelte-helper.js — Mount utilities
- src/utils/dom-helper.js — Button cloning

### Files That Work As-Is (iframe internal)

- src/core/viewer/pc/page-manager.js
- src/core/viewer/pc/text-splitter.js
- src/core/viewer/mobile/text-splitter-mobile.js
- src/core/viewer/mobile/touch-handler.js

### Constants Review — v3 Compatibility Check (`src/constants.js`)

- **[2026-02-27]** Reviewed `src/constants.js`; no `v2`, `2.0`, `2.1`, or `__pluginApis__` references were found.
- Existing constants (`PLUGIN_NAME`, `PLUGIN_VERSION`, etc.) are version-agnostic and require no changes for v3 compatibility.
- **[2026-02-27]** Updated build banner in `vite.config.js` `viteBannerPlugin()` from `//@api 2.1` to `//@api 3.0`; `npm run build` succeeds and `dist/risu-ebooklike-viewer.js` header includes `//@api 3.0`.

### IDB Storage Assessment in v3 Iframe

- **[2026-02-27]** Decision: keep API compatibility and fall back to in-memory cache when `IndexedDB` is blocked in sandbox.
- **Evidence:** `rfp/pluginv3/plugins/apiV3/factory.ts` only adds `allow-scripts` and `allow-modals` (no `allow-same-origin`); migration guide states v3 plugins run in sandboxed iframe isolation.
- **Choice:** Option C (in-memory only). IndexedDB initialization failures in `src/core/idb-storage.js` now route to `Map` fallback so caching degrades safely without functional breakage.

## [2026-02-27] Task 2 Wrapper Rewrite Notes

- v3 wrapper now relies only on `globalThis.risuai`; removed constructor dependency on `pluginApis` and `getInstance()` argument.
- All core API calls are now async wrappers to risuai Promise APIs; `subscribeToChar`/`subscribeToDatabase` polling path now uses awaited snapshots.
- `globalThis.__pluginApis__` does not appear in rewritten `src/core/risu-api.js`.

## 2026-02-27 Task 15 — Shared Components (iframe safety)

- Reviewed `src/ui/components/viewer/ViewerToast.svelte` and `src/ui/components/viewer/LoadingOverlay.svelte` for host DOM assumptions.
- No host DOM references found (`document`, `window`, `parent`, `iframe`, `addEventListener`, `querySelector`, etc.); only local Svelte state/props and transitions.
- Both components are DOM-context agnostic and should work in iframe mode as-is.
- Result: no code changes required.

## 2026-02-27 Task 16 — Deprecated Features Cleanup

- Deleted deprecated `src/ui/components/BookButton.svelte` and `src/ui/components/SmallBookButton.svelte`.
- Verified via search that `BookButton` / `SmallBookButton` are no longer referenced from `src/` code files.
- Verified no remaining v2.1 compatibility references to `safeGlobalThis`, `safeDocument`, `alertStore` compatibility layer, or `SafeFunction` under `src/`.

## 2026-02-27 Task 12 — PC Sub-Components Adaptation
- `src/ui/components/viewer/pc/BookHeader.svelte`: removed action button cloning and header action UI (`cloneButtonsWithEventDelegation`, `buttons`/container removed).
- `BookHeader` now uses async `risuAPI.getChar()` inside an effect for fallback display name and keeps the close chat/chat index controls.
- `BookHeader` close control still calls `onClose` prop, which is wired to `hideViewer()` in App v3 flow.
- `src/ui/components/viewer/pc/NavControls.svelte`, `BookPages.svelte`, `SettingsMenu.svelte`, `CustomCssModal.svelte`: reviewed; no direct host DOM calls, no `dispatchEvent`, and no additional v2 API calls needed for v3 iframe mode.

## 2026-02-27 Task 12 — Mobile Sub-Components Adaptation
- `src/ui/components/viewer/mobile/MobileBookHeader.svelte`: removed action-button row (copy/edit/etc), kept chat title/close/settings; switched to async-safe `RisuAPI.getChar()` fallback for title name with cancellable effect.
- `src/ui/components/viewer/mobile/MobileNavFooter.svelte`: chat navigation callbacks now wrapped as async handlers to satisfy v3 async-call convention.
- `src/ui/components/viewer/mobile/MobileCustomCssModal.svelte`: aligned closer to PC behavior, initialized with mobile default CSS on open/reset, made close interactions keyboard-safe, and kept prop-driven handler flow.
- `src/ui/components/viewer/mobile/MobileLBPanel.svelte`: preserved panel behavior, improved accessibility on overlay/content handlers, and normalized module label truncation.
- Verified `src/ui/components/viewer/mobile/MobileBookPage.svelte`, `MobileSettingsPanel.svelte` remain mostly as-is.
- Verification: `npm run build` succeeds after finalization; remaining warning is unrelated pre-existing `ViewerToast.svelte` a11y tabIndex warning.
