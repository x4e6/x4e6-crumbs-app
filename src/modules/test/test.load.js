import { config } from "../../app/config.js";
import { parseCsv } from "../../core/csv.js";
import { sampleTest } from "./test.data.sample.js";

let cached = null;

function safeNum(v) {
  const n = Number(String(v ?? "").replace(",", ".").trim());
  return Number.isFinite(n) ? n : null;
}

function isHeaderRow(r) {
  const a = String(r?.[0] ?? "").toLowerCase();
  const b = String(r?.[1] ?? "").toLowerCase();
  return a.includes("шкала") && b.includes("оценка");
}

function parseBaseIndex(rows) {
  // In the provided sheet, the first row contains "... индекс, -30" at the end.
  // As a fallback, scan for any small negative number that looks like a base offset.
  let baseIndex = -30;

  const firstRow = rows?.[0] || [];
  for (let i = firstRow.length - 1; i >= 0; i--) {
    const n = safeNum(firstRow[i]);
    if (n != null && n < 0 && n >= -200) return n;
  }

  for (const r of rows) {
    for (const cell of r) {
      const n = safeNum(cell);
      if (n != null && n < 0 && n >= -200) baseIndex = n;
    }
  }
  return baseIndex;
}

function parseResultsBands(rows) {
  // Try to detect a "bands" section in the sheet:
  // any row that contains two numbers (min/max) beyond the 0..10 question scale
  // and some meaningful text.
  const bands = [];

  for (const r of rows) {
    if (!r || r.length < 3) continue;

    const nums = [];
    for (let i = 0; i < r.length; i++) {
      const n = safeNum(r[i]);
      if (n != null) nums.push({ n, i });
    }
    if (nums.length < 2) continue;

    const min = nums[0].n;
    const max = nums[1].n;

    // Avoid mis-detecting question rows (they tend to be within 0..10 like "10,10")
    const looksLikeQuestionScale = Math.abs(min) <= 10 && Math.abs(max) <= 10;
    if (looksLikeQuestionScale) continue;

    const textCells = r
      .filter((c, idx) => idx !== nums[0].i && idx !== nums[1].i)
      .map((c) => String(c ?? "").trim())
      .filter(Boolean);
    if (!textCells.length) continue;

    const title = textCells[0];
    const bullets = textCells
      .slice(1)
      .join("\n")
      .split(/\n+|;\s*/g)
      .map((s) => s.trim())
      .filter(Boolean);

    bands.push({
      min: Math.min(min, max),
      max: Math.max(min, max),
      title,
      bullets,
    });
  }

  // Keep stable order
  bands.sort((a, b) => a.min - b.min);

  return bands.length ? bands : null;
}

// Heuristic parser for the provided sheet layout:
// - Column A: "Шкала A" (text), Column B: "Оценка A" (often "10")
// - Column D: "Шкала B" (text), Column E: "Оценка B" (often "10")
// - First row contains a base offset like "-30"
export function testFromSheetRows(rows) {
  const questions = [];
  const baseIndex = parseBaseIndex(rows);
  const resultsBands = parseResultsBands(rows);

  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    const r = rows[rowIdx];
    if (rowIdx === 0 && isHeaderRow(r)) continue;
    if (isHeaderRow(r)) continue;

    const aText = String(r?.[0] ?? "").trim();
    const aMax = safeNum(r?.[1]);
    const bText = String(r?.[3] ?? "").trim();
    const bMax = safeNum(r?.[4]);

    if (aText && aMax != null) questions.push({ id: `a_${questions.length + 1}`, scale: "A", text: aText });
    if (bText && bMax != null) questions.push({ id: `b_${questions.length + 1}`, scale: "B", text: bText });
  }

  // If parsing fails, return sample.
  if (questions.length < 3) return null;

  return {
    meta: {
      title: "x4e6 — sheet import",
      scaleMin: 0,
      scaleMax: 10,
      baseIndex,
    },
    questions,
    results: resultsBands || sampleTest.results,
  };
}

export async function loadTestDefinition() {
  if (cached) return cached;

  const url = String(config.SHEET_CSV_URL || "").trim();
  if (!url) {
    cached = sampleTest;
    return cached;
  }

  const tryFetchCsv = async (u) => {
    const res = await fetch(u, { cache: "no-store" });
    if (!res.ok) throw new Error(`CSV fetch failed: ${res.status}`);
    return await res.text();
  };

  try {
    let text;
    try {
      text = await tryFetchCsv(url);
    } catch (e) {
      // Google Sheets "publish to web" sometimes hits CORS restrictions.
      // Retry via a text proxy that usually adds permissive CORS headers.
      const isGoogle = /docs\.google\.com\/spreadsheets\//i.test(url);
      if (!isGoogle) throw e;
      const proxyUrl = `https://r.jina.ai/http://${url.replace(/^https?:\/\//i, "")}`;
      text = await tryFetchCsv(proxyUrl);
    }
    const rows = parseCsv(text);
    const parsed = testFromSheetRows(rows);
    cached = parsed || sampleTest;
    return cached;
  } catch {
    cached = sampleTest;
    return cached;
  }
}

