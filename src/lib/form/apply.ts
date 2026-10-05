export interface OptionLike {
  value: string;
  text: string;
}

const norm = (s: string): string => s.trim().toLowerCase().replace(/\s+/g, " ");

/**
 * Picks the index of the <option> that best matches `wanted`:
 * exact value/text first, then a unique substring match. Returns -1 when
 * nothing (or more than one option) matches, so we never guess.
 */
export function pickOptionIndex(options: OptionLike[], wanted: string): number {
  const w = norm(wanted);
  if (!w) return -1;
  const exact = options.findIndex((o) => o.value !== "" && (norm(o.value) === w || norm(o.text) === w));
  if (exact !== -1) return exact;
  const partial = options
    .map((o, i) => ({ o, i }))
    .filter(({ o }) => o.value !== "" && (norm(o.text).includes(w) || w.includes(norm(o.text)) && norm(o.text).length > 2));
  return partial.length === 1 ? partial[0].i : -1;
}

type TextLike = HTMLInputElement | HTMLTextAreaElement;

function setNativeValue(el: TextLike, value: string): void {
  // React/Vue track value via the prototype setter; assigning el.value directly
  // is swallowed by their value trackers and the framework state never updates.
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  if (setter) setter.call(el, value);
  else el.value = value;
}

function fire(el: HTMLElement): void {
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

/** Returns true only if the field was actually changed. Never overwrites existing user input. */
export function applyValue(el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, value: string): boolean {
  if (el instanceof HTMLSelectElement) {
    // Same rule as text fields: respect a choice already made (placeholder options have value "").
    if (el.value !== "") return false;
    const idx = pickOptionIndex(
      Array.from(el.options).map((o) => ({ value: o.value, text: o.text })),
      value,
    );
    if (idx === -1) return false;
    el.selectedIndex = idx;
    fire(el);
    return true;
  }
  if (el.value.trim() !== "") return false;
  setNativeValue(el, value);
  fire(el);
  return true;
}
