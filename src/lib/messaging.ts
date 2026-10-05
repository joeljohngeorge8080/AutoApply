/**
 * chrome.storage.local key the popup writes a profile to immediately
 * before injecting the content script, and that the content script reads
 * (and clears) on startup. Used because executeScript's `files` form has
 * no direct way to pass arguments.
 */
export const FILL_REQUEST_KEY = "autoapply_fill_request";

/** Set by the popup to ask the content script to highlight fields instead of filling. */
export const HIGHLIGHT_REQUEST_KEY = "autoapply_highlight_request";

/**
 * The content script is a classic IIFE bundle, so executeScript cannot see its
 * completion value. It parks its result promise on this global instead, and the
 * popup reads it back with a second executeScript call (same isolated world).
 */
export const RESULT_GLOBAL = "__autoapplyResult";
