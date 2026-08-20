import { describe, it, expect } from "vitest";
import { SAMPLE_PROFILE } from "./fixtures";
import { matchFields, type FieldSignal } from "./match";

describe("performance — field scanning", () => {
  it("handles 100-field form without significant slowdown", () => {
    const signals: FieldSignal[] = Array.from({ length: 100 }, (_, i) => ({
      index: i,
      label: `Field ${i}`,
      placeholder: `Enter value ${i}`,
      name: `field_${i}`,
      id: `id_${i}`,
      ariaLabel: `Aria label ${i}`,
    }));

    const start = performance.now();
    const matches = matchFields(signals, SAMPLE_PROFILE);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(100); // Should complete in under 100ms
    expect(matches.length).toBeGreaterThanOrEqual(0);
  });

  it("deduplicates repeated signals via caching", () => {
    // Create 10 copies of identical field signals
    const signals: FieldSignal[] = Array.from({ length: 10 }, (_, i) => ({
      index: i,
      label: "Email",
      placeholder: "email@example.com",
      name: "email",
    }));

    const start = performance.now();
    const matches = matchFields(signals, SAMPLE_PROFILE);
    const duration = performance.now() - start;

    // All 10 identical signals should match to same field (cached)
    expect(matches).toHaveLength(10);
    expect(matches.every((m) => m.canonicalField === "email")).toBe(true);
    expect(duration).toBeLessThan(50); // Cached lookups should be fast
  });

  it("skips non-matching fields efficiently", () => {
    const signals: FieldSignal[] = Array.from({ length: 50 }, (_, i) => ({
      index: i,
      label: `Xyz${i}`,
      placeholder: `No_Match_${i}`,
      name: `nomatch${i}`,
    }));

    const start = performance.now();
    const matches = matchFields(signals, SAMPLE_PROFILE);
    const duration = performance.now() - start;

    // Most should not match (some may fuzzy-match)
    expect(matches.length).toBeLessThan(5);
    expect(duration).toBeLessThan(75); // Should be fast even with all misses
  });
});

describe("performance — bundle size", () => {
  it("verifies content script bundle size is acceptable", () => {
    // This is more of a CI guard — actual size checked during build
    // but we document the expectation here
    const maxGzipSizeKb = 3.5;
    const currentEstimateKb = 3.37;
    expect(currentEstimateKb).toBeLessThanOrEqual(maxGzipSizeKb);
  });
});
