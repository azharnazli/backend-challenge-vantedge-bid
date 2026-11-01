import { describe, expect, it } from "vitest";
import { hashText } from "../src/repositories/text-hash.ts";

describe("hashText", () => {
  it("returns a stable sha256 hex digest", () => {
    expect(hashText("Tender pengadaan")).toMatch(/^[0-9a-f]{64}$/);
  });

  it("normalizes surrounding and repeated whitespace", () => {
    expect(hashText("  Tender   pengadaan  ")).toBe(
      hashText("Tender pengadaan"),
    );
  });
});
