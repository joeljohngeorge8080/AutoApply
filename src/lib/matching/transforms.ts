/**
 * Named transforms that derive a value instead of copying one directly.
 * Each returns `undefined` when it cannot produce a value — callers must
 * treat that as "skip this field", never a blank or guessed fill.
 */

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function ageFromDob(dob: string, asOf: Date = new Date()): string | undefined {
  const match = ISO_DATE_RE.exec(dob);
  if (!match) return undefined;

  const [, yearStr, monthStr, dayStr] = match;
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  let age = asOf.getFullYear() - year;
  const hasHadBirthdayThisYear =
    asOf.getMonth() + 1 > month || (asOf.getMonth() + 1 === month && asOf.getDate() >= day);
  if (!hasHadBirthdayThisYear) age -= 1;

  if (age < 0 || age > 150) return undefined;
  return String(age);
}

export function fullNameFromParts(firstName: string, lastName: string): string | undefined {
  const first = firstName.trim();
  const last = lastName.trim();
  if (!first && !last) return undefined;
  return [first, last].filter(Boolean).join(" ");
}

export function initialsFromName(firstName: string, lastName: string): string | undefined {
  const first = firstName.trim().charAt(0)?.toUpperCase();
  const last = lastName.trim().charAt(0)?.toUpperCase();
  if (!first && !last) return undefined;
  return [first, last].filter(Boolean).join("");
}

export function yearsOfExperience(workHistory: Array<{ startDate: string }> | undefined, asOf: Date = new Date()): string | undefined {
  if (!workHistory || workHistory.length === 0) return undefined;
  const mostRecent = workHistory[workHistory.length - 1];
  const match = ISO_DATE_RE.exec(mostRecent.startDate);
  if (!match) return undefined;

  const startYear = Number(match[1]);
  const startMonth = Number(match[2]);
  const startDay = Number(match[3]);

  let years = asOf.getFullYear() - startYear;
  const hasCompletedYear =
    asOf.getMonth() + 1 > startMonth || (asOf.getMonth() + 1 === startMonth && asOf.getDate() >= startDay);
  if (!hasCompletedYear) years -= 1;

  if (years < 0) return undefined;
  return String(years);
}

export type DateFormat = "YYYY-MM-DD" | "MM/DD/YYYY" | "DD/MM/YYYY" | "MM/YYYY" | "MMM YYYY";

export function dateReformat(input: string, targetFormat: DateFormat): string | undefined {
  const parts = parseKnownDateFormat(input);
  if (!parts) return undefined;
  const { year, month, day } = parts;

  const yyyy = String(year).padStart(4, "0");
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");

  switch (targetFormat) {
    case "YYYY-MM-DD":
      return `${yyyy}-${mm}-${dd}`;
    case "MM/DD/YYYY":
      return `${mm}/${dd}/${yyyy}`;
    case "DD/MM/YYYY":
      return `${dd}/${mm}/${yyyy}`;
    case "MM/YYYY":
      return `${mm}/${yyyy}`;
    case "MMM YYYY":
      return `${getMonthName(month)} ${yyyy}`;
  }
}

export function fullAddress(street: string, city: string, state: string, zip: string, country?: string): string | undefined {
  const parts = [street, city, `${state} ${zip}`, country].filter((p) => p?.trim());
  if (parts.length === 0) return undefined;
  return parts.join(", ");
}

export function monthYearFromDate(input: string, targetFormat: "MM/YYYY" | "MMM YYYY"): string | undefined {
  const parts = parseKnownDateFormat(input);
  if (!parts) return undefined;
  const { year, month } = parts;

  const yyyy = String(year).padStart(4, "0");
  const mm = String(month).padStart(2, "0");

  switch (targetFormat) {
    case "MM/YYYY":
      return `${mm}/${yyyy}`;
    case "MMM YYYY":
      return `${getMonthName(month)} ${yyyy}`;
  }
}

function getMonthName(month: number): string {
  const names = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return names[month] || "";
}

function parseKnownDateFormat(input: string): { year: number; month: number; day: number } | undefined {
  const iso = ISO_DATE_RE.exec(input);
  if (iso) {
    return { year: Number(iso[1]), month: Number(iso[2]), day: Number(iso[3]) };
  }

  const slash = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(input);
  if (slash) {
    // Ambiguous as MM/DD vs DD/MM without more context; assume MM/DD/YYYY
    // (the input's own stored convention), since Profile dates are stored
    // as ISO and this branch only handles reformatting already-slash-format
    // strings passed in explicitly by a caller that knows the source format.
    return { year: Number(slash[3]), month: Number(slash[1]), day: Number(slash[2]) };
  }

  return undefined;
}
