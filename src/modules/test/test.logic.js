export function computeScores(test, answers) {
  const byScale = { A: 0, B: 0 };
  for (const q of test.questions) {
    const raw = answers?.[q.id];
    const val = typeof raw === "number" ? raw : Number(raw);
    if (!Number.isFinite(val)) continue;
    if (q.scale === "A" || q.scale === "B") byScale[q.scale] += val;
  }

  const base = Number(test?.meta?.baseIndex ?? 0);
  const index = base + byScale.B - byScale.A;

  const resultBand =
    (test.results || []).find((r) => index >= r.min && index <= r.max) || null;

  return {
    base,
    sumA: byScale.A,
    sumB: byScale.B,
    index,
    resultBand,
  };
}

