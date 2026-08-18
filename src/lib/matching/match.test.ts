import { describe, expect, it } from "vitest";
import { SAMPLE_PROFILE } from "./fixtures";
import { matchField, matchFields, type FieldSignal } from "./match";
import { ageFromDob } from "./transforms";

describe("matchField — exact matches", () => {
  it("matches 'Last Name' label to lastName", () => {
    const signal: FieldSignal = { index: 0, label: "Last Name" };
    const result = matchField(signal, SAMPLE_PROFILE);
    expect(result).toEqual({ index: 0, canonicalField: "lastName", confidence: "exact", value: "Lovelace" });
  });

  it("matches the 'Surname' synonym to lastName", () => {
    const signal: FieldSignal = { index: 1, label: "Surname" };
    const result = matchField(signal, SAMPLE_PROFILE);
    expect(result?.canonicalField).toBe("lastName");
    expect(result?.value).toBe("Lovelace");
  });

  it("matches the 'DOB' synonym to dateOfBirth", () => {
    const signal: FieldSignal = { index: 2, placeholder: "DOB" };
    const result = matchField(signal, SAMPLE_PROFILE);
    expect(result).toEqual({
      index: 2,
      canonicalField: "dateOfBirth",
      confidence: "exact",
      value: "1990-06-15",
    });
  });

  it("matches 'Age' and derives it from date of birth via the ageFromDob transform", () => {
    const signal: FieldSignal = { index: 3, label: "Age" };
    const result = matchField(signal, SAMPLE_PROFILE);
    expect(result?.canonicalField).toBe("age");
    expect(result?.value).toBe(ageFromDob(SAMPLE_PROFILE.personal.dateOfBirth));
  });
});

describe("matchField — fuzzy matches", () => {
  it("matches a verbose placeholder containing the 'last name' phrase", () => {
    const signal: FieldSignal = { index: 4, placeholder: "Enter your last name here" };
    const result = matchField(signal, SAMPLE_PROFILE);
    expect(result?.canonicalField).toBe("lastName");
    expect(result?.confidence).toBe("fuzzy");
    expect(result?.value).toBe("Lovelace");
  });

  it("matches 'your full name' to fullName via partial token coverage", () => {
    const signal: FieldSignal = { index: 5, label: "what is your full name" };
    const result = matchField(signal, SAMPLE_PROFILE);
    expect(result?.canonicalField).toBe("fullName");
    expect(result?.confidence).toBe("fuzzy");
    expect(result?.value).toBe("Ada Lovelace");
  });

  it("matches 'current employer' to employer (exact via expanded dictionary)", () => {
    const signal: FieldSignal = { index: 6, label: "current employer" };
    const result = matchField(signal, SAMPLE_PROFILE);
    expect(result?.canonicalField).toBe("employer");
    expect(result?.confidence).toBe("exact");
    expect(result?.value).toBe("Analytical Engines Inc");
  });

  it("matches 'contact email' to email (exact via expanded dictionary)", () => {
    const signal: FieldSignal = { index: 7, placeholder: "contact email" };
    const result = matchField(signal, SAMPLE_PROFILE);
    expect(result?.canonicalField).toBe("email");
    expect(result?.confidence).toBe("exact");
    expect(result?.value).toBe("ada@example.com");
  });

  it("matches 'best phone number' to phone via improved fuzzy (key token present)", () => {
    const signal: FieldSignal = { index: 8, label: "best phone number" };
    const result = matchField(signal, SAMPLE_PROFILE);
    expect(result?.canonicalField).toBe("phone");
    expect(result?.confidence).toBe("fuzzy");
    expect(result?.value).toBe("555-0100");
  });

  it("matches 'job title' to jobTitle (exact via expanded dictionary)", () => {
    const signal: FieldSignal = { index: 9, label: "job title" };
    const result = matchField(signal, SAMPLE_PROFILE);
    expect(result?.canonicalField).toBe("jobTitle");
    expect(result?.confidence).toBe("exact");
    expect(result?.value).toBe("Software Pioneer");
  });

  it("matches 'when did you graduate' to educationEndDate (exact via expanded dictionary)", () => {
    const signal: FieldSignal = { index: 10, placeholder: "when did you graduate" };
    const result = matchField(signal, SAMPLE_PROFILE);
    expect(result?.canonicalField).toBe("educationEndDate");
    expect(result?.confidence).toBe("exact");
    expect(result?.value).toBe("2012-06-01");
  });

  it("matches a partial-token phrase via improved fuzzy matching", () => {
    const signal: FieldSignal = { index: 11, label: "please tell us your street address" };
    const result = matchField(signal, SAMPLE_PROFILE);
    expect(result?.canonicalField).toBe("addressStreet");
    expect(result?.confidence).toBe("fuzzy");
    expect(result?.value).toBe("1 Analytical Engine Way");
  });

  it("matches a partial-token phrase with just key token present", () => {
    const signal: FieldSignal = { index: 12, placeholder: "we need your organization" };
    const result = matchField(signal, SAMPLE_PROFILE);
    expect(result?.canonicalField).toBe("employer");
    expect(result?.confidence).toBe("fuzzy");
    expect(result?.value).toBe("Analytical Engines Inc");
  });
});

describe("matchField — derived fields", () => {
  it("matches 'initials' and derives from first and last name", () => {
    const signal: FieldSignal = { index: 13, label: "initials" };
    const result = matchField(signal, SAMPLE_PROFILE);
    expect(result?.canonicalField).toBe("initials");
    expect(result?.confidence).toBe("exact");
    expect(result?.value).toBe("AL");
  });

  it("matches 'years of experience' and derives from work history", () => {
    const signal: FieldSignal = { index: 14, label: "years of experience" };
    const result = matchField(signal, SAMPLE_PROFILE);
    expect(result?.canonicalField).toBe("yearsOfExperience");
    expect(result?.confidence).toBe("exact");
    expect(result?.value).toBe("13");
  });

  it("matches 'full address' and derives from address fields", () => {
    const signal: FieldSignal = { index: 15, label: "full address" };
    const result = matchField(signal, SAMPLE_PROFILE);
    expect(result?.canonicalField).toBe("fullAddress");
    expect(result?.confidence).toBe("exact");
    expect(result?.value).toBe("1 Analytical Engine Way, London, LDN SW1A 1AA, UK");
  });

  it("matches 'graduation month year' and derives from education end date", () => {
    const signal: FieldSignal = { index: 16, label: "graduation month year" };
    const result = matchField(signal, SAMPLE_PROFILE);
    expect(result?.canonicalField).toBe("graduationMonthYear");
    expect(result?.confidence).toBe("exact");
    expect(result?.value).toBe("06/2012");
  });

  it("matches 'employment month year' and derives from work start date", () => {
    const signal: FieldSignal = { index: 17, placeholder: "employment month year" };
    const result = matchField(signal, SAMPLE_PROFILE);
    expect(result?.canonicalField).toBe("workStartMonthYear");
    expect(result?.confidence).toBe("exact");
    expect(result?.value).toBe("01/2013");
  });
});

describe("matchField — skip behavior", () => {
  it("skips a field that matches a canonical field but has no unmatched dictionary variant", () => {
    const signal: FieldSignal = { index: 5, label: "Favorite Color" };
    expect(matchField(signal, SAMPLE_PROFILE)).toBeUndefined();
  });

  it("skips a matched field when the profile value is empty rather than filling blank", () => {
    const profileWithoutGender = {
      ...SAMPLE_PROFILE,
      personal: { ...SAMPLE_PROFILE.personal, gender: undefined },
    };
    const signal: FieldSignal = { index: 6, label: "Gender" };
    expect(matchField(signal, profileWithoutGender)).toBeUndefined();
  });
});

describe("matchFields", () => {
  it("matches a full batch and skips unmatched fields", () => {
    const signals: FieldSignal[] = [
      { index: 0, label: "First Name" },
      { index: 1, label: "Surname" },
      { index: 2, label: "Email Address" },
      { index: 3, label: "Favorite Color" },
    ];
    const results = matchFields(signals, SAMPLE_PROFILE);
    expect(results).toHaveLength(3);
    expect(results.map((r) => r.canonicalField)).toEqual(["firstName", "lastName", "email"]);
  });
});
