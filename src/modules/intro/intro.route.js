import { el } from "../../core/dom.js";
import { loadIntroCards } from "./intro.load.js";

export function render(ctx) {
  const card = el("section", { className: "card" });
  card.appendChild(
    el("div", { className: "card__header" }, [
      el("h1", { className: "h1", text: "x4e6" }),
      el("p", { className: "muted", text: "Короткое вступление перед тестом." }),
    ]),
  );

  const start = el("button", { className: "btn btn--cta", text: "Начать" });
  start.addEventListener("click", () => ctx.navigate("/description?i=0"));

  const goTest = el("a", { className: "btn btn--ghost", href: "#/test?q=0", text: "Пропустить" });

  const actions = el("div", { className: "actions" }, [start, goTest]);

  const content = el("div", { className: "question" }, [
    el("div", { className: "badge", text: "Перед стартом" }),
    el("div", { className: "question__text", text: "Загрузка…" }),
  ]);

  card.appendChild(content);
  card.appendChild(actions);
  ctx.mountEl.appendChild(card);

  let disposed = false;

  loadIntroCards().then((cards) => {
    if (disposed) return;
    const text =
      (cards || []).filter(Boolean).join("\n\n") ||
      "Перед тестом будет несколько карточек с описанием. Нажмите «Начать».";
    content.innerHTML = "";
    content.appendChild(el("div", { className: "badge", text: "Перед стартом" }));
    content.appendChild(el("div", { className: "question__text", text }));
  });

  return () => {
    disposed = true;
  };
}

