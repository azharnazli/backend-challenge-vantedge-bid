import type { Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.ts";
import { createInMemoryAnalysisRepository } from "../src/repositories/analysis-repository.ts";

describe("POST /api/tenders/analyze", () => {
  const repository = createInMemoryAnalysisRepository();
  let server: Server;
  let url: string;

  beforeAll(async () => {
    server = createApp(repository).listen(0, "127.0.0.1");
    await new Promise<void>((resolve) => server.once("listening", resolve));
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("No test port");
    url = `http://127.0.0.1:${address.port}/api/tenders/analyze`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  });

  const post = (body: unknown): Promise<Response> =>
    fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

  it("returns saved analysis without exposing original text", async () => {
    const text =
      "Pembangunan gedung anggaran Rp 1.500.000.000, batas 12 Desember 2026";
    const response = await post({ text });

    expect(response.status).toBe(200);
    const result: unknown = await response.json();
    if (
      result === null ||
      typeof result !== "object" ||
      !("id" in result) ||
      typeof result.id !== "string" ||
      !("createdAt" in result) ||
      typeof result.createdAt !== "string"
    ) {
      throw new Error("Response missing id or createdAt");
    }
    expect(result.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(result.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(result).toMatchObject({
      extraction: {
        keywords: ["pembangunan", "gedung", "anggaran", "batas", "desember"],
        tenderTerms: ["anggaran"],
        deadlines: ["2026-12-12"],
        budgets: [
          { raw: "Rp 1.500.000.000", amount: 1500000000, currency: "IDR" },
        ],
      },
    });
    expect(result).not.toHaveProperty("text");
    await expect(repository.findById(result.id)).resolves.toMatchObject({
      text,
    });
  });

  it.each([{}, { text: "" }, { text: "  " }, { text: 42 }, { text: null }])(
    "rejects invalid text in %j",
    async (body) => {
      const response = await post(body);
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: "text must be a non-empty string",
      });
    },
  );

  it("does not expose storage errors", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const failingServer = createApp({
      save: () => Promise.reject(new Error("private database credentials")),
      findById: () => Promise.resolve(null),
    }).listen(0, "127.0.0.1");

    try {
      await new Promise<void>((resolve) =>
        failingServer.once("listening", resolve),
      );
      const address = failingServer.address();
      if (!address || typeof address === "string")
        throw new Error("No test port");
      const response = await fetch(
        `http://127.0.0.1:${address.port}/api/tenders/analyze`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ text: "Tender pengadaan barang" }),
        },
      );

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({ error: "internal error" });
      expect(log).toHaveBeenCalled();
    } finally {
      await new Promise<void>((resolve, reject) =>
        failingServer.close((error) => (error ? reject(error) : resolve())),
      );
      log.mockRestore();
    }
  });
});
