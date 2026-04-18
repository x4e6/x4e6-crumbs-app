import { clearElement } from "../core/dom.js";

function normalizeHash(hash) {
  const raw = (hash || "").replace(/^#/, "").trim();
  return raw.startsWith("/") ? raw : `/${raw}`;
}

function parseRoute(hash) {
  const path = normalizeHash(hash);
  const [pathname, queryString] = path.split("?");
  const query = new URLSearchParams(queryString || "");
  return { pathname: pathname || "/", query };
}

export function createRouter({ routes, mountEl }) {
  if (!mountEl) throw new Error("Router mount element is required");

  let currentCleanup = null;

  async function render() {
    const { pathname, query } = parseRoute(window.location.hash);
    const match =
      routes.find((r) => r.path === pathname) ||
      routes.find((r) => r.path === "/") ||
      null;

    if (!match) {
      clearElement(mountEl);
      mountEl.appendChild(
        Object.assign(document.createElement("div"), {
          className: "card",
          textContent: "No routes configured.",
        }),
      );
      return;
    }

    if (typeof currentCleanup === "function") {
      try {
        currentCleanup();
      } finally {
        currentCleanup = null;
      }
    }

    clearElement(mountEl);

    const ctx = {
      pathname,
      query,
      navigate: (to) => {
        window.location.hash = to.startsWith("#") ? to : `#${to}`;
      },
      mountEl,
    };

    const mod = await match.load();
    const cleanup = mod?.render?.(ctx);
    currentCleanup = typeof cleanup === "function" ? cleanup : null;
  }

  function start() {
    window.addEventListener("hashchange", render);
    if (!window.location.hash) window.location.hash = "#/test";
    render();
  }

  return { start };
}

