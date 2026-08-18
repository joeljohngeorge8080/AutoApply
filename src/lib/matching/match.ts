import type { Profile } from "../storage/types";
import { DICTIONARY, type CanonicalField } from "./dictionary";
import { ageFromDob, fullNameFromParts, initialsFromName, yearsOfExperience, fullAddress, monthYearFromDate } from "./transforms";

/** Raw text signals extracted for one form field, before normalization. */
export interface FieldSignal {
  index: number;
  label?: string;
  placeholder?: string;
  name?: string;
  id?: string;
  ariaLabel?: string;
}

export type MatchConfidence = "exact" | "fuzzy";

export interface FieldMatch {
  index: number;
  canonicalField: CanonicalField;
  confidence: MatchConfidence;
  value: string;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string): string[] {
  const normalized = normalize(text);
  return normalized ? normalized.split(" ") : [];
}

const EXACT_INDEX = new Map<string, CanonicalField[]>();
const FUZZY_ENTRIES: Array<{ field: CanonicalField; tokens: string[] }> = [];

for (const [field, variants] of Object.entries(DICTIONARY) as Array<[CanonicalField, string[]]>) {
  for (const variant of variants) {
    const norm = normalize(variant);
    const existing = EXACT_INDEX.get(norm) ?? [];
    existing.push(field);
    EXACT_INDEX.set(norm, existing);
    FUZZY_ENTRIES.push({ field, tokens: tokenize(variant) });
  }
}

const SIGNAL_PRIORITY: Array<keyof Omit<FieldSignal, "index">> = [
  "label",
  "placeholder",
  "name",
  "id",
  "ariaLabel",
];

function classifyField(signal: FieldSignal): { field: CanonicalField; confidence: MatchConfidence } | undefined {
  // Exact tier: try each signal text in priority order, first unambiguous
  // exact match wins.
  for (const key of SIGNAL_PRIORITY) {
    const raw = signal[key];
    if (!raw) continue;
    const norm = normalize(raw);
    if (!norm) continue;
    const exactFields = EXACT_INDEX.get(norm);
    if (exactFields && exactFields.length === 1) {
      return { field: exactFields[0], confidence: "exact" };
    }
  }

  // Fuzzy tier: union all signal tokens, find dictionary variants whose
  // tokens are sufficiently contained within that union. Ambiguous ties (two
  // canonical fields matching with equally-good coverage) are skipped.
  const allTokens = new Set<string>();
  for (const key of SIGNAL_PRIORITY) {
    const raw = signal[key];
    if (!raw) continue;
    for (const token of tokenize(raw)) allTokens.add(token);
  }
  if (allTokens.size === 0) return undefined;

  // Score each entry: (matched tokens, has first token, variant length)
  const scored = FUZZY_ENTRIES.filter((entry) => entry.tokens.length > 0).map((entry) => {
    const matchedTokens = entry.tokens.filter((t) => allTokens.has(t)).length;
    const coverage = matchedTokens / entry.tokens.length;
    const hasFirstToken = entry.tokens.length > 0 && allTokens.has(entry.tokens[0]);
    return { entry, matchedTokens, coverage, hasFirstToken };
  });

  // Filter to high-confidence matches: at least 50% token coverage
  const candidates = scored.filter((s) => s.coverage >= 0.5);
  if (candidates.length === 0) return undefined;

  // Sort by coverage (desc), then by first-token presence (desc), then by variant length (desc)
  candidates.sort((a, b) => {
    if (a.coverage !== b.coverage) return b.coverage - a.coverage;
    if (a.hasFirstToken !== b.hasFirstToken) return (b.hasFirstToken ? 1 : 0) - (a.hasFirstToken ? 1 : 0);
    return b.entry.tokens.length - a.entry.tokens.length;
  });

  const [best, second] = candidates;
  if (second && best.coverage === second.coverage && best.hasFirstToken === second.hasFirstToken && second.entry.field !== best.entry.field) {
    return undefined; // ambiguous — a missed fill beats a wrong one
  }

  return { field: best.entry.field, confidence: "fuzzy" };
}

function resolveValue(field: CanonicalField, profile: Profile): string | undefined {
  const education = profile.education[profile.education.length - 1];
  const workHistory = profile.workHistory[profile.workHistory.length - 1];

  let raw: string | undefined;
  switch (field) {
    case "firstName":
      raw = profile.personal.firstName;
      break;
    case "lastName":
      raw = profile.personal.lastName;
      break;
    case "fullName":
      raw = fullNameFromParts(profile.personal.firstName, profile.personal.lastName);
      break;
    case "initials":
      raw = initialsFromName(profile.personal.firstName, profile.personal.lastName);
      break;
    case "dateOfBirth":
      raw = profile.personal.dateOfBirth;
      break;
    case "age":
      raw = profile.personal.dateOfBirth ? ageFromDob(profile.personal.dateOfBirth) : undefined;
      break;
    case "gender":
      raw = profile.personal.gender;
      break;
    case "email":
      raw = profile.contact.email;
      break;
    case "phone":
      raw = profile.contact.phone;
      break;
    case "addressStreet":
      raw = profile.contact.address.street;
      break;
    case "addressCity":
      raw = profile.contact.address.city;
      break;
    case "addressState":
      raw = profile.contact.address.state;
      break;
    case "addressZip":
      raw = profile.contact.address.zip;
      break;
    case "addressCountry":
      raw = profile.contact.address.country;
      break;
    case "fullAddress":
      raw = fullAddress(profile.contact.address.street, profile.contact.address.city, profile.contact.address.state, profile.contact.address.zip, profile.contact.address.country);
      break;
    case "school":
      raw = education?.school;
      break;
    case "degree":
      raw = education?.degree;
      break;
    case "fieldOfStudy":
      raw = education?.fieldOfStudy;
      break;
    case "gpa":
      raw = education?.gpa;
      break;
    case "educationStartDate":
      raw = education?.startDate;
      break;
    case "educationEndDate":
      raw = education?.endDate;
      break;
    case "graduationMonthYear":
      raw = education?.endDate ? monthYearFromDate(education.endDate, "MM/YYYY") : undefined;
      break;
    case "employer":
      raw = workHistory?.employer;
      break;
    case "jobTitle":
      raw = workHistory?.title;
      break;
    case "workStartDate":
      raw = workHistory?.startDate;
      break;
    case "workStartMonthYear":
      raw = workHistory?.startDate ? monthYearFromDate(workHistory.startDate, "MM/YYYY") : undefined;
      break;
    case "workEndDate":
      raw = workHistory?.endDate;
      break;
    case "workDescription":
      raw = workHistory?.description;
      break;
    case "yearsOfExperience":
      raw = yearsOfExperience(profile.workHistory);
      break;
  }

  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

/** Matches one field signal against a profile. Returns undefined to skip. */
export function matchField(signal: FieldSignal, profile: Profile): FieldMatch | undefined {
  const classified = classifyField(signal);
  if (!classified) return undefined;

  const value = resolveValue(classified.field, profile);
  if (value === undefined) return undefined;

  return {
    index: signal.index,
    canonicalField: classified.field,
    confidence: classified.confidence,
    value,
  };
}

/** Matches a batch of field signals against a profile, skipping non-matches. */
export function matchFields(signals: FieldSignal[], profile: Profile): FieldMatch[] {
  const matches: FieldMatch[] = [];
  for (const signal of signals) {
    const match = matchField(signal, profile);
    if (match) matches.push(match);
  }
  return matches;
}
