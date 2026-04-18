function unquote(v) {
  const s = v.trim();
  if (s.startsWith('"') && s.endsWith('"')) return s.slice(1, -1).replaceAll('""', '"');
  return s;
}

// Minimal CSV parser (commas + quotes). Enough for Google "Publish to web" CSV.
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }

    if (ch === ",") {
      row.push(unquote(cur));
      cur = "";
      continue;
    }

    if (ch === "\n") {
      row.push(unquote(cur));
      rows.push(row);
      row = [];
      cur = "";
      continue;
    }

    if (ch === "\r") continue;
    cur += ch;
  }

  // trailing cell
  row.push(unquote(cur));
  rows.push(row);

  // Trim empty trailing rows
  while (rows.length && rows[rows.length - 1].every((c) => String(c || "").trim() === "")) {
    rows.pop();
  }
  return rows;
}

