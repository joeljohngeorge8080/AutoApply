import type { Fillable } from "../../content/fill";

const HIGHLIGHT_CLASS = "autoapply-fillable";
const HIGHLIGHT_STYLE_ID = "autoapply-highlight-styles";

function ensureStyles(): void {
  if (document.getElementById(HIGHLIGHT_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = HIGHLIGHT_STYLE_ID;
  style.textContent = `
    .${HIGHLIGHT_CLASS} {
      border: 2px solid #4CAF50 !important;
      background-color: rgba(76, 175, 80, 0.05) !important;
      transition: all 0.2s ease !important;
      outline: none !important;
    }
    .${HIGHLIGHT_CLASS}:focus {
      background-color: rgba(76, 175, 80, 0.1) !important;
      box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2) !important;
    }
  `;
  document.head.appendChild(style);
}

export function highlightFields(fields: Fillable[]): void {
  ensureStyles();
  for (const field of fields) {
    if (!field.disabled && !field.hidden) {
      field.classList.add(HIGHLIGHT_CLASS);
    }
  }
}

export function clearHighlights(): void {
  const highlighted = document.querySelectorAll(`.${HIGHLIGHT_CLASS}`);
  Array.from(highlighted).forEach((el) => {
    el.classList.remove(HIGHLIGHT_CLASS);
  });
}

export function toggleHighlights(enable: boolean, fields?: Fillable[]): void {
  if (enable && fields) {
    highlightFields(fields);
  } else {
    clearHighlights();
  }
}
