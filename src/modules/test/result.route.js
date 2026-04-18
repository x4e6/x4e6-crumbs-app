import { el } from "../../core/dom.js";
import { loadState, resetState } from "../../core/store.js";
import { computeScores } from "./test.logic.js";
import { loadTestDefinition } from "./test.load.js";

export function render(ctx) {
  const card = el("section", { className: "card" });
  card.appendChild(
    el("div", { className: "card__header" }, [
      el("h1", { className: "h1", text: "Финал" }),
      el("p", { className: "muted", text: "Подсчет результатов…" }),
    ]),
  );
  ctx.mountEl.appendChild(card);

  let disposed = false;

  loadTestDefinition().then((test) => {
    if (disposed) return;

    const state = loadState();
    const scores = computeScores(test, state.answers || {});

    card.innerHTML = "";

    card.appendChild(
      el("div", { className: "card__header" }, [
        el("h1", { className: "h1", text: "Финал" }),
        el("p", { className: "muted", text: "Выводы сформулированы на основе набранных баллов." }),
      ]),
    );

    const stats = el("div", { className: "stats" }, [
      el("div", { className: "stat" }, [
        el("div", { className: "stat__label", text: "Сумма A" }),
        el("div", { className: "stat__value", text: String(scores.sumA) }),
      ]),
      el("div", { className: "stat" }, [
        el("div", { className: "stat__label", text: "Сумма B" }),
        el("div", { className: "stat__value", text: String(scores.sumB) }),
      ]),
      el("div", { className: "stat stat--primary" }, [
        el("div", { className: "stat__label", text: "Индекс" }),
        el("div", { className: "stat__value", text: String(Math.round(scores.index)) }),
      ]),
    ]);

    card.appendChild(stats);

    const band = scores.resultBand;
    if (band) {
      card.appendChild(el("h2", { className: "h2", text: band.title }));
      const ul = el("ul", { className: "bullets" });
      for (const b of band.bullets || []) ul.appendChild(el("li", { text: b }));
      card.appendChild(ul);
    } else {
      card.appendChild(
        el("div", { className: "callout" }, [
          el("div", { className: "callout__title", text: "Нет формулы выводов" }),
          el("div", { className: "muted", text: "Подключите правила выводов из Google Sheets." }),
        ]),
      );
    }

    const actions = el("div", { className: "actions" });
    const backToTest = el("a", { className: "btn btn--primary", href: "#/test?q=0", text: "Пройти снова" });
    const crumbs = el("a", { className: "btn", href: "#/crumbs", text: "Collect crumbs" });
    const reset = el("button", { className: "btn btn--ghost", text: "Стереть ответы" });

    reset.addEventListener("click", () => {
      resetState();
      ctx.navigate("/test?q=0");
    });

    actions.appendChild(backToTest);
    actions.appendChild(crumbs);
    actions.appendChild(reset);
    card.appendChild(actions);
  });

  return () => {
    disposed = true;
  };
}

