import { matchFields, type FieldSignal } from "../lib/matching/match";
import { FILL_REQUEST_KEY, HIGHLIGHT_REQUEST_KEY, RESULT_GLOBAL } from "../lib/messaging";
import { applyValue } from "../lib/form/apply";
import type { Profile } from "../lib/storage/types";
import { detectForms, getFormStats } from "../lib/form/detect";
import { highlightFields, clearHighlights } from "../lib/form/highlight";

export type Fillable = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

interface FillResult {
  filled: number;
  skipped: number;
}

const NON_FILLABLE_INPUT_TYPES = new Set([
  "button",
  "submit",
  "reset",
  "hidden",
  "file",
  "image",
  "checkbox",
  "radio",
]);

function isFillable(el: Element): el is Fillable {
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return true;
  if (el instanceof HTMLInputElement) return !NON_FILLABLE_INPUT_TYPES.has(el.type);
  return false;
}

function labelTextFor(el: HTMLElement): string | undefined {
  if (el.id) {
    const labelEl = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    if (labelEl?.textContent?.trim()) return labelEl.textContent;
  }
  const closestLabel = el.closest("label");
  if (closestLabel?.textContent?.trim()) return closestLabel.textContent;
  const ariaLabelledBy = el.getAttribute("aria-labelledby");
  if (ariaLabelledBy) {
    const referenced = document.getElementById(ariaLabelledBy);
    if (referenced?.textContent?.trim()) return referenced.textContent;
  }
  return undefined;
}

function extractSignals(): { elements: Fillable[]; signals: FieldSignal[] } {
  const allElements = Array.from(document.querySelectorAll("input, select, textarea")).filter(isFillable);
  const elements: Fillable[] = [];
  const signals: FieldSignal[] = [];

  for (let i = 0; i < allElements.length; i++) {
    const el = allElements[i];

    // Skip disabled or hidden elements
    if ((el as HTMLInputElement).disabled || (el as HTMLInputElement).hidden) continue;

    // Skip invisible elements (0 width/height)
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;

    const label = labelTextFor(el);
    const placeholder = "placeholder" in el ? el.placeholder || undefined : undefined;
    const name = el.name || undefined;
    const id = el.id || undefined;
    const ariaLabel = el.getAttribute("aria-label") || undefined;

    // One signal per element: sharing signals between look-alike fields would
    // alias their indexes and mis-map fills.
    const inputType = el instanceof HTMLInputElement ? el.type : undefined;
    const signal: FieldSignal = { index: signals.length, label, placeholder, name, id, ariaLabel, inputType };

    elements.push(el);
    signals.push(signal);
  }

  return { elements, signals };
}

async function run(): Promise<FillResult> {
  const stored = await chrome.storage.local.get([FILL_REQUEST_KEY, HIGHLIGHT_REQUEST_KEY]);
  const profile = stored[FILL_REQUEST_KEY] as Profile | undefined;
  const highlightRequest = stored[HIGHLIGHT_REQUEST_KEY] as boolean | undefined;
  await chrome.storage.local.remove(FILL_REQUEST_KEY);
  await chrome.storage.local.remove(HIGHLIGHT_REQUEST_KEY);

  if (highlightRequest) {
    const forms = detectForms();
    const allFields = forms.flatMap((f) => f.elements).filter((el) => !el.disabled && !el.hidden);
    highlightFields(allFields);
    return { filled: 0, skipped: allFields.length };
  }

  if (!profile) return { filled: 0, skipped: 0 };

  // Clear highlights before filling
  clearHighlights();

  const { elements, signals } = extractSignals();
  const matches = matchFields(signals, profile);

  let filled = 0;
  for (const match of matches) {
    // Isolate per-field failures — one bad match must never block the rest.
    try {
      const el = elements[match.index];
      if (el && applyValue(el, match.value)) filled += 1;
    } catch {
      // Leave this field unfilled; the rest of the batch still proceeds.
    }
  }

  return { filled, skipped: signals.length - filled };
}

// On page load: detect forms and store stats
chrome.storage.local.set({ FORM_DETECTION_STATS: getFormStats() }).catch(() => {
  // Storage error; silently continue
});

(globalThis as Record<string, unknown>)[RESULT_GLOBAL] = run();
