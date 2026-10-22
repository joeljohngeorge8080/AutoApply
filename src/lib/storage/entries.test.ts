import { describe, expect, it } from "vitest";
import { isBlankEntry, move, pruneBlank, removeAt } from "./entries";

describe("isBlankEntry", () => {
  it("is true when every value is empty or whitespace/undefined", () => {
    expect(isBlankEntry({ school: "", degree: "  ", gpa: undefined })).toBe(true);
  });

  it("is false when any value has content", () => {
    expect(isBlankEntry({ school: "MIT", degree: "" })).toBe(false);
  });
});

describe("pruneBlank", () => {
  it("drops blank entries and keeps order of the rest", () => {
    const list = [{ a: "x" }, { a: "" }, { a: "y" }];
    expect(pruneBlank(list)).toEqual([{ a: "x" }, { a: "y" }]);
  });

  it("returns an empty array when everything is blank", () => {
    expect(pruneBlank([{ a: "" }, { a: " " }])).toEqual([]);
  });
});

describe("removeAt", () => {
  it("removes by index without mutating the input", () => {
    const list = [1, 2, 3];
    expect(removeAt(list, 1)).toEqual([1, 3]);
    expect(list).toEqual([1, 2, 3]);
  });

  it("ignores out-of-range indexes", () => {
    expect(removeAt([1, 2], 5)).toEqual([1, 2]);
    expect(removeAt([1, 2], -1)).toEqual([1, 2]);
  });
});

describe("move", () => {
  it("moves an item up and down", () => {
    expect(move(["a", "b", "c"], 1, -1)).toEqual(["b", "a", "c"]);
    expect(move(["a", "b", "c"], 1, 1)).toEqual(["a", "c", "b"]);
  });

  it("is a no-op at the edges and for bad indexes", () => {
    expect(move(["a", "b"], 0, -1)).toEqual(["a", "b"]);
    expect(move(["a", "b"], 1, 1)).toEqual(["a", "b"]);
    expect(move(["a", "b"], 9, -1)).toEqual(["a", "b"]);
  });
});
