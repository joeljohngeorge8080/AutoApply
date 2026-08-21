import type { Fillable } from "../../content/fill";

export interface FormInfo {
  id: string;
  name?: string;
  fieldCount: number;
  fillableCount: number;
  elements: Fillable[];
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

function getFormName(formEl: HTMLElement | Document): string | undefined {
  if (formEl instanceof HTMLFormElement && formEl.name) return formEl.name;
  if (formEl instanceof HTMLElement && formEl.id) return formEl.id;

  const heading = (formEl as HTMLElement).querySelector?.("h1, h2, h3, h4, legend");
  if (heading?.textContent?.trim()) return heading.textContent.trim();

  return undefined;
}

export function detectForms(): FormInfo[] {
  const forms: FormInfo[] = [];
  const formMap = new Map<Element, Fillable[]>();

  // Find all fillable fields
  const allFields = Array.from(document.querySelectorAll("input, select, textarea")).filter(isFillable);

  // Group fields by form or container
  for (const field of allFields) {
    // Find parent form or fieldset
    let container: Element | null = field.closest("form, fieldset");
    if (!container) {
      // If no form/fieldset, use the field's closest .form or [role=form]
      container = field.closest("[role='form'], .form, .form-group, .form-container");
    }
    if (!container) {
      // Fall back to body (uncontained fields)
      container = document.body;
    }

    if (!formMap.has(container)) {
      formMap.set(container, []);
    }
    formMap.get(container)!.push(field);
  }

  // Create FormInfo for each container
  let formId = 0;
  for (const [container, elements] of formMap) {
    if (elements.length === 0) continue;

    const name = container instanceof HTMLFormElement ? getFormName(container as HTMLFormElement) : undefined;
    forms.push({
      id: `form_${formId++}`,
      name,
      fieldCount: elements.length,
      fillableCount: elements.filter((el) => !el.disabled && !el.hidden).length,
      elements,
    });
  }

  return forms;
}

export function getFormStats(): { totalForms: number; totalFields: number; fillableFields: number } {
  const forms = detectForms();
  const totalFields = forms.reduce((sum, f) => sum + f.fieldCount, 0);
  const fillableFields = forms.reduce((sum, f) => sum + f.fillableCount, 0);
  return { totalForms: forms.length, totalFields, fillableFields };
}
