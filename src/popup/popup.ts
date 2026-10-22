import { FILL_REQUEST_KEY, HIGHLIGHT_REQUEST_KEY, RESULT_GLOBAL } from "../lib/messaging";
import { deleteProfile, getProfile, listProfiles, saveProfile } from "../lib/storage/storage";
import { move, pruneBlank, removeAt } from "../lib/storage/entries";
import type { Profile } from "../lib/storage/types";

type Education = Profile["education"][number];
type Work = Profile["workHistory"][number];

interface FillResult {
  filled: number;
  skipped: number;
}

type View = { kind: "list" } | { kind: "form"; profile: Profile };

let view: View = { kind: "list" };
let profiles: Profile[] = [];
let selectedFillId: string | undefined;
let statusMessage: { text: string; empty: boolean } | undefined;

const app = document.getElementById("app") as HTMLElement;

function emptyProfile(): Profile {
  return {
    id: crypto.randomUUID(),
    name: "",
    personal: { firstName: "", lastName: "", dateOfBirth: "", gender: "" },
    contact: {
      email: "",
      phone: "",
      address: { street: "", city: "", state: "", zip: "", country: "" },
    },
    education: [emptyEducation()],
    workHistory: [emptyWork()],
  };
}

function emptyEducation(): Education {
  return { school: "", degree: "", fieldOfStudy: "", gpa: "", startDate: "", endDate: "" };
}

function emptyWork(): Work {
  return { employer: "", title: "", startDate: "", endDate: "", description: "" };
}

async function refreshProfiles(): Promise<void> {
  profiles = await listProfiles();
  if (selectedFillId && !profiles.some((p) => p.id === selectedFillId)) {
    selectedFillId = profiles[0]?.id;
  }
  if (!selectedFillId) selectedFillId = profiles[0]?.id;
}

function escapeHtml(value: string): string {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function render(): void {
  if (view.kind === "list") renderListView();
  else renderFormView(view.profile);
}

function renderListView(): void {
  const options = profiles
    .map((p) => `<option value="${p.id}" ${p.id === selectedFillId ? "selected" : ""}>${escapeHtml(p.name || "(untitled)")}</option>`)
    .join("");

  const items = profiles
    .map(
      (p) => `
        <li>
          <span>${escapeHtml(p.name || "(untitled)")}</span>
          <span class="row">
            <button data-action="edit" data-id="${p.id}">Edit</button>
            <button class="danger" data-action="delete" data-id="${p.id}">Delete</button>
          </span>
        </li>`,
    )
    .join("");

  app.innerHTML = `
    <h1>AutoApply</h1>

    <h2>Fill this page</h2>
    ${
      profiles.length === 0
        ? `<p class="hint">No profiles yet — create one below.</p>`
        : `
          <div class="row">
            <select id="fill-select">${options}</select>
          </div>
          <button class="primary" id="fill-button">Fill this page</button>
          <button id="highlight-button">Highlight fields</button>
        `
    }
    ${statusMessage ? `<div class="status ${statusMessage.empty ? "empty" : ""}">${escapeHtml(statusMessage.text)}</div>` : ""}

    <h2>Profiles</h2>
    <ul class="profile-list">${items}</ul>
    <button id="new-profile-button">+ New Profile</button>
  `;

  const fillSelect = document.getElementById("fill-select") as HTMLSelectElement | null;
  fillSelect?.addEventListener("change", () => {
    selectedFillId = fillSelect.value;
  });

  document.getElementById("fill-button")?.addEventListener("click", () => {
    void handleFill();
  });

  document.getElementById("highlight-button")?.addEventListener("click", () => {
    void handleHighlight();
  });

  document.getElementById("new-profile-button")?.addEventListener("click", () => {
    statusMessage = undefined;
    view = { kind: "form", profile: emptyProfile() };
    render();
  });

  app.querySelectorAll<HTMLButtonElement>("[data-action='edit']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id!;
      const profile = await getProfile(id);
      if (profile) {
        statusMessage = undefined;
        view = { kind: "form", profile };
        render();
      }
    });
  });

  app.querySelectorAll<HTMLButtonElement>("[data-action='delete']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id!;
      await deleteProfile(id);
      await refreshProfiles();
      render();
    });
  });
}

function entryControls(kind: "edu" | "work", i: number, count: number): string {
  return `
    <span class="row entry-controls">
      <button type="button" data-entry-action="up" data-kind="${kind}" data-index="${i}" ${i === 0 ? "disabled" : ""} aria-label="Move up">↑</button>
      <button type="button" data-entry-action="down" data-kind="${kind}" data-index="${i}" ${i === count - 1 ? "disabled" : ""} aria-label="Move down">↓</button>
      <button type="button" class="danger" data-entry-action="remove" data-kind="${kind}" data-index="${i}">Remove</button>
    </span>`;
}

function educationBlock(edu: Education, i: number, count: number): string {
  return `
    <fieldset class="entry" data-kind="edu" data-index="${i}">
      <legend>Education ${i + 1}${i === count - 1 && count > 1 ? " (used to fill)" : ""}</legend>
      <label>School<input data-field="school" value="${escapeHtml(edu.school)}" /></label>
      <label>Degree<input data-field="degree" value="${escapeHtml(edu.degree)}" /></label>
      <label>Field of study<input data-field="fieldOfStudy" value="${escapeHtml(edu.fieldOfStudy)}" /></label>
      <label>GPA<input data-field="gpa" value="${escapeHtml(edu.gpa ?? "")}" /></label>
      <label>Start date<input data-field="startDate" type="date" value="${escapeHtml(edu.startDate)}" /></label>
      <label>End date<input data-field="endDate" type="date" value="${escapeHtml(edu.endDate)}" /></label>
      ${entryControls("edu", i, count)}
    </fieldset>`;
}

function workBlock(work: Work, i: number, count: number): string {
  return `
    <fieldset class="entry" data-kind="work" data-index="${i}">
      <legend>Job ${i + 1}${i === count - 1 && count > 1 ? " (used to fill)" : ""}</legend>
      <label>Employer<input data-field="employer" value="${escapeHtml(work.employer)}" /></label>
      <label>Title<input data-field="title" value="${escapeHtml(work.title)}" /></label>
      <label>Start date<input data-field="startDate" type="date" value="${escapeHtml(work.startDate)}" /></label>
      <label>End date<input data-field="endDate" type="date" value="${escapeHtml(work.endDate)}" /></label>
      <label>Description<textarea data-field="description" rows="2">${escapeHtml(work.description ?? "")}</textarea></label>
      ${entryControls("work", i, count)}
    </fieldset>`;
}

function renderFormView(profile: Profile): void {
  const education = profile.education.length > 0 ? profile.education : [emptyEducation()];
  const workHistory = profile.workHistory.length > 0 ? profile.workHistory : [emptyWork()];

  app.innerHTML = `
    <h1>${profile.name ? "Edit Profile" : "New Profile"}</h1>
    <div class="form-grid">
      <label>Profile name<input id="f-name" value="${escapeHtml(profile.name)}" placeholder="e.g. Job Search" /></label>

      <h2>Personal</h2>
      <label>First name<input id="f-firstName" value="${escapeHtml(profile.personal.firstName)}" /></label>
      <label>Last name<input id="f-lastName" value="${escapeHtml(profile.personal.lastName)}" /></label>
      <label>Date of birth<input id="f-dob" type="date" value="${escapeHtml(profile.personal.dateOfBirth)}" /></label>
      <label>Gender<input id="f-gender" value="${escapeHtml(profile.personal.gender ?? "")}" /></label>

      <h2>Contact</h2>
      <label>Email<input id="f-email" type="email" value="${escapeHtml(profile.contact.email)}" /></label>
      <label>Phone<input id="f-phone" value="${escapeHtml(profile.contact.phone)}" /></label>
      <label>Street<input id="f-street" value="${escapeHtml(profile.contact.address.street)}" /></label>
      <label>City<input id="f-city" value="${escapeHtml(profile.contact.address.city)}" /></label>
      <label>State<input id="f-state" value="${escapeHtml(profile.contact.address.state)}" /></label>
      <label>Zip<input id="f-zip" value="${escapeHtml(profile.contact.address.zip)}" /></label>
      <label>Country<input id="f-country" value="${escapeHtml(profile.contact.address.country)}" /></label>

      <h2>Education</h2>
      <p class="hint">Forms are filled from the last entry.</p>
      ${education.map((e, i) => educationBlock(e, i, education.length)).join("")}
      <button type="button" id="add-education">+ Add education</button>

      <h2>Work History</h2>
      <p class="hint">Forms are filled from the last entry.</p>
      ${workHistory.map((w, i) => workBlock(w, i, workHistory.length)).join("")}
      <button type="button" id="add-work">+ Add job</button>

      <div class="form-actions">
        <button id="cancel-button">Cancel</button>
        <button class="primary" id="save-button">Save</button>
      </div>
    </div>
  `;

  document.getElementById("cancel-button")?.addEventListener("click", () => {
    view = { kind: "list" };
    render();
  });

  document.getElementById("save-button")?.addEventListener("click", () => {
    void handleSave(profile.id);
  });

  // Snapshot typed-but-unsaved input before restructuring the lists, so edits survive the re-render.
  const restructure = (change: (p: Profile) => Profile): void => {
    view = { kind: "form", profile: change(collectProfile(profile.id)) };
    render();
  };

  document.getElementById("add-education")?.addEventListener("click", () => {
    restructure((p) => ({ ...p, education: [...p.education, emptyEducation()] }));
  });
  document.getElementById("add-work")?.addEventListener("click", () => {
    restructure((p) => ({ ...p, workHistory: [...p.workHistory, emptyWork()] }));
  });

  app.querySelectorAll<HTMLButtonElement>("[data-entry-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.entryAction;
      const kind = btn.dataset.kind;
      const index = Number(btn.dataset.index);
      const apply = <T>(list: T[]): T[] =>
        action === "remove" ? removeAt(list, index) : move(list, index, action === "up" ? -1 : 1);
      restructure((p) =>
        kind === "edu" ? { ...p, education: apply(p.education) } : { ...p, workHistory: apply(p.workHistory) },
      );
    });
  });
}

function val(id: string): string {
  return (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null)?.value.trim() ?? "";
}

function entryVal(block: Element, field: string): string {
  return (block.querySelector(`[data-field="${field}"]`) as HTMLInputElement | HTMLTextAreaElement | null)?.value.trim() ?? "";
}

/** Reads the whole form back into a Profile, blank entries included. */
function collectProfile(id: string): Profile {
  const education = Array.from(app.querySelectorAll(".entry[data-kind='edu']")).map(
    (b): Education => ({
      school: entryVal(b, "school"),
      degree: entryVal(b, "degree"),
      fieldOfStudy: entryVal(b, "fieldOfStudy"),
      gpa: entryVal(b, "gpa") || undefined,
      startDate: entryVal(b, "startDate"),
      endDate: entryVal(b, "endDate"),
    }),
  );
  const workHistory = Array.from(app.querySelectorAll(".entry[data-kind='work']")).map(
    (b): Work => ({
      employer: entryVal(b, "employer"),
      title: entryVal(b, "title"),
      startDate: entryVal(b, "startDate"),
      endDate: entryVal(b, "endDate"),
      description: entryVal(b, "description") || undefined,
    }),
  );

  return {
    id,
    name: val("f-name"),
    personal: {
      firstName: val("f-firstName"),
      lastName: val("f-lastName"),
      dateOfBirth: val("f-dob"),
      gender: val("f-gender") || undefined,
    },
    contact: {
      email: val("f-email"),
      phone: val("f-phone"),
      address: {
        street: val("f-street"),
        city: val("f-city"),
        state: val("f-state"),
        zip: val("f-zip"),
        country: val("f-country"),
      },
    },
    education,
    workHistory,
  };
}

async function handleSave(id: string): Promise<void> {
  const collected = collectProfile(id);
  // A blank trailing entry would become the "latest" one and fill nothing.
  const profile: Profile = {
    ...collected,
    education: pruneBlank(collected.education),
    workHistory: pruneBlank(collected.workHistory),
  };

  await saveProfile(profile);
  await refreshProfiles();
  selectedFillId = profile.id;
  view = { kind: "list" };
  render();
}

async function runContentScript(tabId: number): Promise<FillResult | undefined> {
  await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] });
  // The IIFE bundle has no completion value; read the promise it parked on a global.
  const [read] = await chrome.scripting.executeScript({
    target: { tabId },
    func: (key: string) => (globalThis as unknown as Record<string, Promise<unknown>>)[key],
    args: [RESULT_GLOBAL],
  });
  return read?.result as FillResult | undefined;
}

async function activeTabId(): Promise<number | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.id;
}

async function handleFill(): Promise<void> {
  if (!selectedFillId) return;
  const profile = await getProfile(selectedFillId);
  if (!profile) return;

  const tabId = await activeTabId();
  if (tabId === undefined) {
    statusMessage = { text: "No active tab found.", empty: true };
    render();
    return;
  }

  await chrome.storage.local.set({ [FILL_REQUEST_KEY]: profile });

  try {
    const result = await runContentScript(tabId);

    if (!result || (result.filled === 0 && result.skipped === 0)) {
      statusMessage = { text: "No fillable fields found.", empty: true };
    } else {
      statusMessage = { text: `${result.filled} filled / ${result.skipped} skipped`, empty: result.filled === 0 };
    }
  } catch {
    statusMessage = { text: "Could not fill this page (unsupported or restricted page).", empty: true };
  } finally {
    // Don't leave profile data sitting in storage if injection failed.
    await chrome.storage.local.remove(FILL_REQUEST_KEY);
  }

  render();
}

async function handleHighlight(): Promise<void> {
  const tabId = await activeTabId();
  if (tabId === undefined) {
    statusMessage = { text: "No active tab found.", empty: true };
    render();
    return;
  }

  await chrome.storage.local.set({ [HIGHLIGHT_REQUEST_KEY]: true });

  try {
    const result = await runContentScript(tabId);
    const count = result?.skipped ?? 0;
    statusMessage = { text: count > 0 ? `Highlighted ${count} fields.` : "No fillable fields found.", empty: count === 0 };
  } catch {
    statusMessage = { text: "Could not scan this page (unsupported or restricted page).", empty: true };
  } finally {
    await chrome.storage.local.remove(HIGHLIGHT_REQUEST_KEY);
  }

  render();
}

async function init(): Promise<void> {
  await refreshProfiles();
  render();
}

void init();
