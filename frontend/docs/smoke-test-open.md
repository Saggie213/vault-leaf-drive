# Smoke Test: File Open Behavior

This document provides a manual smoke-test checklist to verify that file opening works correctly across all interaction paths in VaultLeaf Drive.

## Prerequisites

1. Deploy the application to a test environment
2. Log in using Internet Identity
3. Upload at least two test files:
   - One browser-viewable file (e.g., image.jpg, document.pdf, or text.txt)
   - One non-viewable file (e.g., archive.zip, document.docx)

## Test Cases

### 1. List View - Click File Name/Row

**Browser-viewable file:**
- [ ] Click on the file name or row in list view
- [ ] Verify the file opens in a new browser tab
- [ ] Verify the file content displays correctly

**Non-viewable file:**
- [ ] Click on the file name or row in list view
- [ ] Verify the file downloads automatically
- [ ] Verify the downloaded file has the correct name

### 2. Grid View - Click File Card/Name

**Browser-viewable file:**
- [ ] Click on the file card or name in grid view
- [ ] Verify the file opens in a new browser tab
- [ ] Verify the file content displays correctly

**Non-viewable file:**
- [ ] Click on the file card or name in grid view
- [ ] Verify the file downloads automatically
- [ ] Verify the downloaded file has the correct name

### 3. File Actions Dropdown - Open Action

**Browser-viewable file:**
- [ ] Click the three-dot menu (⋮) on a file
- [ ] Click "Open" from the dropdown
- [ ] Verify the file opens in a new browser tab
- [ ] Verify the file content displays correctly

**Non-viewable file:**
- [ ] Click the three-dot menu (⋮) on a file
- [ ] Click "Open" from the dropdown
- [ ] Verify the file downloads automatically
- [ ] Verify the downloaded file has the correct name

### 4. Context Menu - Open Action

**Browser-viewable file:**
- [ ] Right-click on a file
- [ ] Click "Open" from the context menu
- [ ] Verify the file opens in a new browser tab
- [ ] Verify the file content displays correctly

**Non-viewable file:**
- [ ] Right-click on a file
- [ ] Click "Open" from the context menu
- [ ] Verify the file downloads automatically
- [ ] Verify the downloaded file has the correct name

### 5. Popup Blocker Fallback

**With popup blocker enabled:**
- [ ] Enable popup blocking in your browser for the test site
- [ ] Try to open a browser-viewable file using any method above
- [ ] Verify a toast notification appears with message: "Popup blocked. Downloading file instead."
- [ ] Verify the file downloads automatically as a fallback
- [ ] Verify the downloaded file has the correct name

### 6. Error Handling

**Network/blob fetch failure:**
- [ ] Simulate a network error (e.g., disconnect network briefly)
- [ ] Try to open a file
- [ ] Verify an error toast appears with a clear English error message
- [ ] Verify the UI remains responsive (no frozen state)

## Expected Behavior Summary

- **Browser-viewable files** (images, PDFs, text files): Should open in a new tab when possible
- **Non-viewable files** (archives, Office docs): Should download automatically
- **Popup blocked**: Should show an informative toast and fall back to download
- **Errors**: Should display clear English error messages using toast notifications
- **All paths**: List click, grid click, dropdown "Open", and context menu "Open" should behave identically

## Notes

- Browser-viewable types include: images (jpg, png, gif, webp, svg), PDFs, text files, HTML, video (mp4, webm), and audio (mp3, wav)
- The MIME type is inferred from the file extension to ensure proper browser handling
- Object URLs are properly cleaned up to prevent memory leaks
