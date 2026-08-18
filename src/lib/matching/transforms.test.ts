import { describe, expect, it } from "vitest";
import { ageFromDob, dateReformat, fullNameFromParts, initialsFromName, yearsOfExperience, fullAddress, monthYearFromDate } from "./transforms";

describe("ageFromDob", () => {
  it("computes age from a date of birth as of a fixed reference date", () => {
    expect(ageFromDob("1990-06-15", new Date("2025-06-15"))).toBe("35");
  });

  it("does not count the birthday early if it has not happened yet this year", () => {
    expect(ageFromDob("1990-06-15", new Date("2025-06-14"))).toBe("34");
  });

  it("returns undefined for a malformed date instead of guessing", () => {
    expect(ageFromDob("not-a-date")).toBeUndefined();
    expect(ageFromDob("")).toBeUndefined();
  });
});

describe("fullNameFromParts", () => {
  it("joins first and last name", () => {
    expect(fullNameFromParts("Ada", "Lovelace")).toBe("Ada Lovelace");
  });

  it("returns undefined when both parts are missing", () => {
    expect(fullNameFromParts("", "")).toBeUndefined();
  });

  it("uses whichever part is present when the other is missing", () => {
    expect(fullNameFromParts("Ada", "")).toBe("Ada");
  });
});

describe("dateReformat", () => {
  it("converts ISO to MM/DD/YYYY", () => {
    expect(dateReformat("2025-06-15", "MM/DD/YYYY")).toBe("06/15/2025");
  });

  it("converts ISO to DD/MM/YYYY", () => {
    expect(dateReformat("2025-06-15", "DD/MM/YYYY")).toBe("15/06/2025");
  });

  it("converts ISO to MM/YYYY", () => {
    expect(dateReformat("2025-06-15", "MM/YYYY")).toBe("06/2025");
  });

  it("converts ISO to MMM YYYY", () => {
    expect(dateReformat("2025-06-15", "MMM YYYY")).toBe("Jun 2025");
  });

  it("returns undefined for unrecognized formats instead of guessing", () => {
    expect(dateReformat("June 15 2025", "YYYY-MM-DD")).toBeUndefined();
  });
});

describe("initialsFromName", () => {
  it("returns first letters of first and last name as uppercase", () => {
    expect(initialsFromName("Ada", "Lovelace")).toBe("AL");
  });

  it("returns initials when one part is missing", () => {
    expect(initialsFromName("Ada", "")).toBe("A");
    expect(initialsFromName("", "Lovelace")).toBe("L");
  });

  it("returns undefined when both parts are missing", () => {
    expect(initialsFromName("", "")).toBeUndefined();
  });

  it("handles names with extra whitespace", () => {
    expect(initialsFromName("  John  ", "  Doe  ")).toBe("JD");
  });
});

describe("yearsOfExperience", () => {
  it("calculates years from most recent work start date", () => {
    const workHistory = [{ startDate: "2020-01-15" }, { startDate: "2013-01-01" }];
    expect(yearsOfExperience(workHistory, new Date("2025-06-15"))).toBe("12");
  });

  it("does not count a full year if anniversary has not occurred yet", () => {
    const workHistory = [{ startDate: "2020-01-15" }];
    expect(yearsOfExperience(workHistory, new Date("2025-01-14"))).toBe("4");
    expect(yearsOfExperience(workHistory, new Date("2025-01-15"))).toBe("5");
  });

  it("returns undefined for empty work history", () => {
    expect(yearsOfExperience([], new Date("2025-06-15"))).toBeUndefined();
    expect(yearsOfExperience(undefined, new Date("2025-06-15"))).toBeUndefined();
  });

  it("returns undefined for malformed dates", () => {
    const workHistory = [{ startDate: "not-a-date" }];
    expect(yearsOfExperience(workHistory)).toBeUndefined();
  });
});

describe("fullAddress", () => {
  it("joins address parts with commas", () => {
    expect(fullAddress("1 Main St", "Anytown", "CA", "12345", "USA")).toBe("1 Main St, Anytown, CA 12345, USA");
  });

  it("omits empty parts", () => {
    expect(fullAddress("1 Main St", "Anytown", "CA", "12345", "")).toBe("1 Main St, Anytown, CA 12345");
  });

  it("handles missing country", () => {
    expect(fullAddress("1 Main St", "Anytown", "CA", "12345")).toBe("1 Main St, Anytown, CA 12345");
  });

  it("returns undefined when all parts are empty", () => {
    expect(fullAddress("", "", "", "")).toBeUndefined();
  });
});

describe("monthYearFromDate", () => {
  it("converts ISO date to MM/YYYY format", () => {
    expect(monthYearFromDate("2025-06-15", "MM/YYYY")).toBe("06/2025");
  });

  it("converts ISO date to MMM YYYY format", () => {
    expect(monthYearFromDate("2013-01-15", "MMM YYYY")).toBe("Jan 2013");
  });

  it("returns undefined for malformed dates", () => {
    expect(monthYearFromDate("not-a-date", "MM/YYYY")).toBeUndefined();
  });
});
