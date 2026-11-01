import { describe, expect, it } from "vitest";
import { createInMemoryAnalysisRepository } from "../src/repositories/analysis-repository.ts";
import { extract } from "../src/services/extract.ts";

describe("in-memory analysis repository", () => {
  it("saves an analysis and reads it back by id", async () => {
    const repository = createInMemoryAnalysisRepository();
    const text = "Tender pengadaan alat tulis, anggaran Rp 5.000.000";
    const extraction = extract(text);

    const saved = await repository.save(text, extraction);

    expect(saved.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(saved.createdAt).toEqual(expect.any(String));
    expect(saved.text).toBe(text);
    expect(saved.extraction).toEqual(extraction);
    await expect(repository.findById(saved.id)).resolves.toEqual(saved);
  });

  it("returns null for an unknown id", async () => {
    const repository = createInMemoryAnalysisRepository();

    await expect(repository.findById("missing")).resolves.toBeNull();
  });
});
