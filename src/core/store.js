const STORAGE_KEY = "x4e6:test:v1";

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { answers: {} };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { answers: {} };
    if (!parsed.answers || typeof parsed.answers !== "object") return { answers: {} };
    return parsed;
  } catch {
    return { answers: {} };
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
}

