import type { Budget, Extraction } from "../types/analysis.ts";
import { MONTHS, MONTH_PATTERN } from "./months.ts";
import { STOPWORDS } from "./stopwords.ts";
import { TENDER_TERMS } from "./tender-terms.ts";

const DATE_PATTERN = new RegExp(
  String.raw`\b(\d{1,2})\s+(${MONTH_PATTERN})\s+(\d{4})\b`,
  "gi",
);
const BUDGET_PATTERN = /\brp\.?\s*(\d+(?:\.\d+)*(?:,\d+)?)/gi;

const MAX_KEYWORDS = 15;

const extractKeywords = (text: string): string[] => {
  const counts = new Map<string, { count: number; firstSeen: number }>();
  const words = text.toLowerCase().match(/[a-z][a-z0-9]+/g) ?? [];

  for (const [index, word] of words.entries()) {
    if (word.length < 4 || STOPWORDS.has(word)) continue;
    const entry = counts.get(word);
    if (entry) entry.count += 1;
    else counts.set(word, { count: 1, firstSeen: index });
  }

  return [...counts.entries()]
    .sort((a, b) => b[1].count - a[1].count || a[1].firstSeen - b[1].firstSeen)
    .slice(0, MAX_KEYWORDS)
    .map(([word]) => word);
};

const extractTenderTerms = (text: string): string[] => {
  const haystack = text.toLowerCase();
  return TENDER_TERMS.filter((term) =>
    new RegExp(`\\b${term}\\b`).test(haystack),
  );
};

const extractDeadlines = (text: string): string[] => {
  const found = new Set<string>();

  for (const match of text.matchAll(DATE_PATTERN)) {
    const day = Number(match[1]);
    const month = MONTHS[match[2]?.toLowerCase() ?? ""];
    const year = Number(match[3]);
    if (!month || day < 1 || day > 31) continue;
    found.add(
      `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    );
  }

  return [...found].sort();
};

const extractBudgets = (text: string): Budget[] => {
  const found = new Map<string, Budget>();

  for (const match of text.matchAll(BUDGET_PATTERN)) {
    const digits = match[1] ?? "";
    const amount = Number(digits.replace(/\./g, "").replace(",", "."));
    const raw = match[0].trim();
    if (!Number.isFinite(amount) || amount <= 0) continue;
    found.set(raw, { raw, amount, currency: "IDR" });
  }

  return [...found.values()];
};

export const extract = (text: string): Extraction => ({
  keywords: extractKeywords(text),
  tenderTerms: extractTenderTerms(text),
  deadlines: extractDeadlines(text),
  budgets: extractBudgets(text),
});
