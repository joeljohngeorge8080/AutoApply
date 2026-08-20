import { FILL_REQUEST_KEY } from "../lib/messaging";
import { deleteProfile, getProfile, listProfiles, saveProfile } from "../lib/storage/storage";
import type { Profile } from "../lib/storage/types";

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
    education: [{ school: "", degree: "", fieldOfStudy: "", gpa: "", startDate: "", endDate: "" }],
    workHistory: [{ employer: "", title: "", startDate: "", endDate: "", description: "" }],
  };
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

function renderFormView(profile: Profile): void {
  const edu = profile.education[0] ?? { school: "", degree: "", fieldOfStudy: "", gpa: "", startDate: "", endDate: "" };
  const work = profile.workHistory[0] ?? { employer: "", title: "", startDate: "", endDate: "", description: "" };

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
      <label>School<input id="f-school" value="${escapeHtml(edu.school)}" /></label>
      <label>Degree<input id="f-degree" value="${escapeHtml(edu.degree)}" /></label>
      <label>Field of study<input id="f-fieldOfStudy" value="${escapeHtml(edu.fieldOfStudy)}" /></label>
      <label>GPA<input id="f-gpa" value="${escapeHtml(edu.gpa ?? "")}" /></label>
      <label>Start date<input id="f-eduStart" type="date" value="${escapeHtml(edu.startDate)}" /></label>
      <label>End date<input id="f-eduEnd" type="date" value="${escapeHtml(edu.endDate)}" /></label>

      <h2>Work History</h2>
      <label>Employer<input id="f-employer" value="${escapeHtml(work.employer)}" /></label>
      <label>Title<input id="f-title" value="${escapeHtml(work.title)}" /></label>
      <label>Start date<input id="f-workStart" type="date" value="${escapeHtml(work.startDate)}" /></label>
      <label>End date<input id="f-workEnd" type="date" value="${escapeHtml(work.endDate)}" /></label>
      <label>Description<textarea id="f-description" rows="2">${escapeHtml(work.description ?? "")}</textarea></label>

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
}

function val(id: string): string {
  return (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null)?.value.trim() ?? "";
}

async function handleSave(id: string): Promise<void> {
  const profile: Profile = {
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
    education: [
      {
        school: val("f-school"),
        degree: val("f-degree"),
        fieldOfStudy: val("f-fieldOfStudy"),
        gpa: val("f-gpa") || undefined,
        startDate: val("f-eduStart"),
        endDate: val("f-eduEnd"),
      },
    ],
    workHistory: [
      {
        employer: val("f-employer"),
        title: val("f-title"),
        startDate: val("f-workStart"),
        endDate: val("f-workEnd"),
        description: val("f-description") || undefined,
      },
    ],
  };

  await saveProfile(profile);
  await refreshProfiles();
  selectedFillId = profile.id;
  view = { kind: "list" };
  render();
}

async function handleFill(): Promise<void> {
  if (!selectedFillId) return;
  const profile = await getProfile(selectedFillId);
  if (!profile) return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    statusMessage = { text: "No active tab found.", empty: true };
    render();
    return;
  }

  await chrome.storage.local.set({ [FILL_REQUEST_KEY]: profile });

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });
    const result = results[0]?.result as FillResult | undefined;

    if (!result || (result.filled === 0 && result.skipped === 0)) {
      statusMessage = { text: "No fillable fields found.", empty: true };
    } else {
      statusMessage = { text: `${result.filled} filled / ${result.skipped} skipped`, empty: result.filled === 0 };
    }
  } catch {
    statusMessage = { text: "Could not fill this page (unsupported or restricted page).", empty: true };
  }

  render();
}

async function init(): Promise<void> {
  await refreshProfiles();
  render();
}

void init();
