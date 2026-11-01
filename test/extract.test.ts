import { describe, expect, it } from "vitest";
import { extract } from "../src/services/extract.js";

describe("extract", () => {
  it("pulls keywords, tender terms, deadlines and budgets from tender text", () => {
    const result = extract(
      "Dokumen tender pembangunan gedung. Anggaran Rp 1.500.000.000 dengan batas waktu 12 Desember 2026. Penawaran wajib menyertakan dokumen kualifikasi untuk vendor.",
    );

    expect(result.keywords).toContain("dokumen");
    expect(result.keywords).not.toContain("untuk");
    expect(result.tenderTerms).toEqual(
      expect.arrayContaining(["tender", "anggaran", "dokumen", "batas waktu"]),
    );
    expect(result.deadlines).toEqual(["2026-12-12"]);
    expect(result.budgets).toEqual([
      { raw: "Rp 1.500.000.000", amount: 1_500_000_000, currency: "IDR" },
    ]);
  });

  it("returns empty collections for empty text", () => {
    expect(extract("")).toEqual({
      keywords: [],
      tenderTerms: [],
      deadlines: [],
      budgets: [],
    });
  });

  it("ignores text with nothing to extract", () => {
    expect(extract("hello world")).toEqual({
      keywords: ["hello", "world"],
      tenderTerms: [],
      deadlines: [],
      budgets: [],
    });
  });

  it("normalizes English month names and comma decimals", () => {
    const result = extract("Bid deadline 3 March 2027, budget Rp 2.000,50");

    expect(result.deadlines).toEqual(["2027-03-03"]);
    expect(result.budgets[0]?.amount).toBe(2000.5);
  });
});
