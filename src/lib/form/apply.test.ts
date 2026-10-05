import { describe, expect, it } from "vitest";
import { pickOptionIndex } from "./apply";

const opts = [
  { value: "", text: "Select..." },
  { value: "US", text: "United States" },
  { value: "CA", text: "Canada" },
  { value: "UK", text: "United Kingdom" },
];

describe("pickOptionIndex", () => {
  it("matches by value or text, case-insensitively", () => {
    expect(pickOptionIndex(opts, "us")).toBe(1);
    expect(pickOptionIndex(opts, "canada")).toBe(2);
  });
  it("accepts a unique substring match", () => {
    expect(pickOptionIndex(opts, "Kingdom")).toBe(3);
  });
  it("rejects ambiguous substrings and unknown values", () => {
    expect(pickOptionIndex(opts, "United")).toBe(-1);
    expect(pickOptionIndex(opts, "Mars")).toBe(-1);
  });
  it("never selects the empty placeholder or empty input", () => {
    expect(pickOptionIndex(opts, "")).toBe(-1);
    expect(pickOptionIndex(opts, "Select...")).toBe(-1);
  });
});
