import { config } from "../../app/config.js";
import { parseCsv } from "../../core/csv.js";
import { loadFilledCellsFromSheetTabCsv } from "../../core/sheetCsv.js";

let cached = null;

function withGid(url, gid) {
  if (!gid) return url;
  const u = new URL(url);
  u.searchParams.set("gid", String(gid));
  u.searchParams.set("output", "csv");
  return u.toString();
}

async function fetchCsvText(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`CSV fetch failed: ${res.status}`);
  return await res.text();
}

function parseIntroCards(rows) {
  const cards = [];
  for (const r of rows || []) {
    const cells = (r || []).map((c) => String(c ?? "").trim()).filter(Boolean);
    if (!cells.length) continue;
    cards.push(cells.join("\n\n"));
  }
  return cards;
}

export async function loadDescriptionFilledCells() {
  const baseUrl = String(config.SHEET_CSV_URL || "").trim();
  const gid = String(config.DESCRIPTION_GID || "").trim();
  if (!baseUrl || !gid) return [];

  try {
    return await loadFilledCellsFromSheetTabCsv({ csvUrl: baseUrl, gid });
  } catch {
    return [];
  }
}

export async function loadIntroCards() {
  if (cached) return cached;

  const baseUrl = String(config.SHEET_CSV_URL || "").trim();
  const gid = String(config.DESCRIPTION_GID || "").trim();

  if (!baseUrl || !gid) {
    cached = [];
    return cached;
  }

  const url = withGid(baseUrl, gid);

  try {
    let text;
    try {
      text = await fetchCsvText(url);
    } catch (e) {
      const isGoogle = /docs\.google\.com\/spreadsheets\//i.test(url);
      if (!isGoogle) throw e;
      const proxyUrl = `https://r.jina.ai/http://${url.replace(/^https?:\/\//i, "")}`;
      text = await fetchCsvText(proxyUrl);
    }

    const rows = parseCsv(text);
    cached = parseIntroCards(rows);
    return cached;
  } catch {
    cached = [];
    return cached;
  }
}

