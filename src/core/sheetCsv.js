import { parseCsv } from "./csv.js";

function withGid(url, gid) {
  if (!gid) return url;
  const u = new URL(url);
  u.searchParams.set("gid", String(gid));
  u.searchParams.set("output", "csv");
  return u.toString();
}

async function fetchTextNoStore(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`CSV fetch failed: ${res.status}`);
  return await res.text();
}

async function fetchCsvTextWithCorsFallback(url) {
  try {
    return await fetchTextNoStore(url);
  } catch (e) {
    // Google Sheets "publish to web" sometimes hits CORS restrictions.
    // Retry via a text proxy that usually adds permissive CORS headers.
    const isGoogle = /docs\.google\.com\/spreadsheets\//i.test(url);
    if (!isGoogle) throw e;
    const proxyUrl = `https://r.jina.ai/http://${url.replace(/^https?:\/\//i, "")}`;
    return await fetchTextNoStore(proxyUrl);
  }
}

export async function loadSheetTabRowsFromCsv({ csvUrl, gid }) {
  const baseUrl = String(csvUrl || "").trim();
  const gidStr = String(gid || "").trim();
  if (!baseUrl || !gidStr) return [];

  const url = withGid(baseUrl, gidStr);
  const text = await fetchCsvTextWithCorsFallback(url);
  return parseCsv(text);
}

/**
 * Reads all non-empty cells from a CSV published from a Google Sheet tab.
 * Returns a flat list of filled cells with 0-based coordinates.
 */
export async function loadFilledCellsFromSheetTabCsv({ csvUrl, gid }) {
  const rows = await loadSheetTabRowsFromCsv({ csvUrl, gid });
  const cells = [];

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r] || [];
    for (let c = 0; c < row.length; c++) {
      const v = String(row[c] ?? "").trim();
      if (!v) continue;
      cells.push({ row: r, col: c, value: v });
    }
  }

  return cells;
}

