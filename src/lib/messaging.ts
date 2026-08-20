/**
 * chrome.storage.local key the popup writes a profile to immediately
 * before injecting the content script, and that the content script reads
 * (and clears) on startup. Used because executeScript's `files` form has
 * no direct way to pass arguments.
 */
export const FILL_REQUEST_KEY = "autoapply_fill_request";
