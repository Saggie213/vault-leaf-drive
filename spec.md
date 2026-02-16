# Specification

## Summary
**Goal:** Fix Drive file “Open” so it reliably opens files in a new tab when possible, and otherwise falls back to downloading with clear user feedback.

**Planned changes:**
- Update Drive list view and grid view click handlers so clicking a file consistently triggers a shared open-in-new-tab with download fallback behavior.
- Make FileActions “Open” and context menu “Open” call the same shared open/download utility used by list/grid clicks.
- Harden `frontend/src/utils/fileOpen.ts` to avoid silent/blank opens, choose appropriate MIME types when creating blobs/object URLs, preserve filenames on download, and revoke object URLs.
- Add user-facing English toasts for popup-blocked fallback-to-download and for open/download failures (using the existing `normalizeError` helper).
- Perform a focused manual smoke-test pass (post Internet Identity login) verifying open via list click, grid click, FileActions > Open, and context menu > Open for both a viewable file type and a non-viewable file type.

**User-visible outcome:** Users can open Drive files reliably (new tab when allowed, otherwise download), and they receive clear English messages when popups are blocked or when an open/download fails.
