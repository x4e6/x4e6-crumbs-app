import { el } from "../../core/dom.js";
import { loadState, resetState, saveState } from "../../core/store.js";
import { loadTestDefinition } from "./test.load.js";

function buildProgress({ total, answered, currentIndex }) {
  const dots = el("div", { className: "progress__dots", role: "list" });
  for (let i = 0; i < total; i++) {
    const isDone = i < answered;
    const isCurrent = i === currentIndex;
    dots.appendChild(
      el("div", {
        className: `progress__dot${isDone ? " is-done" : ""}${isCurrent ? " is-current" : ""}`,
        role: "listitem",
        "aria-label": `Вопрос ${i + 1} из ${total}`,
      }),
    );
  }
  return el("div", { className: "progress" }, [
    el("div", { className: "progress__meta", text: `Вопрос ${currentIndex + 1} / ${total}` }),
    dots,
  ]);
}

export function render(ctx) {
  const card = el("section", { className: "card" });
  card.appendChild(
    el("div", { className: "card__header" }, [
      el("h1", { className: "h1", text: "Тест" }),
      el("p", { className: "muted", text: "Загрузка вопросов…" }),
    ]),
  );
  ctx.mountEl.appendChild(card);

  let disposed = false;

  loadTestDefinition().then((test) => {
    if (disposed) return;
    const state = loadState();
    const total = test.questions.length;

    let idx = Number(ctx.query.get("q") ?? 0);
    if (!Number.isFinite(idx) || idx < 0) idx = 0;
    if (idx >= total) idx = total - 1;

    const q = test.questions[idx];
    const answeredIds = Object.keys(state.answers || {});
    const answeredCount = answeredIds.filter((id) =>
      test.questions.some((qq) => qq.id === id),
    ).length;

    card.innerHTML = "";
    const header = el("div", { className: "card__header" }, [
      el("h1", { className: "h1", text: "Тест" }),
      el("p", { className: "muted", text: "Оцените от 0 до 10, где 0 — вообще не про вас, 10 — “на 100% это я”." }),
    ]);

    const progress = buildProgress({
      total,
      answered: answeredCount,
      currentIndex: idx,
    });

    const statement = el("div", { className: "question" }, [
      el("div", { className: "badge", text: `Шкала ${q.scale}` }),
      el("div", { className: "question__text", text: q.text }),
    ]);

    const existing = state.answers?.[q.id];
    const initialValue =
      typeof existing === "number" && Number.isFinite(existing) ? existing : 5;

    const valueLabel = el("div", { className: "score__value", text: String(initialValue) });
    const nextBtn = el("button", { className: "btn btn--primary", text: "Дальше", disabled: true });
    const range = el("input", {
      className: "range",
      type: "range",
      min: String(test.meta.scaleMin),
      max: String(test.meta.scaleMax),
      step: "1",
      value: String(initialValue),
      oninput: (e) => {
        valueLabel.textContent = e.target.value;
        nextBtn.disabled = false;
      },
    });

    const score = el("div", { className: "score" }, [
      el("div", { className: "score__row" }, [
        el("div", { className: "muted", text: "Ваш балл" }),
        valueLabel,
      ]),
      range,
      el("div", { className: "score__legend" }, [
        el("span", { className: "muted", text: String(test.meta.scaleMin) }),
        el("span", { className: "muted", text: String(test.meta.scaleMax) }),
      ]),
    ]);

    const backBtn = el("button", { className: "btn", text: "Назад", disabled: idx === 0 });
    const restartBtn = el("button", { className: "btn btn--ghost", text: "Сбросить" });

    backBtn.addEventListener("click", () => ctx.navigate(`/test?q=${Math.max(0, idx - 1)}`));

    restartBtn.addEventListener("click", () => {
      resetState();
      ctx.navigate("/test?q=0");
    });

    nextBtn.addEventListener("click", () => {
      const val = Number(range.value);
      const nextState = loadState();
      nextState.answers = nextState.answers || {};
      nextState.answers[q.id] = val;
      saveState(nextState);

      if (idx + 1 < total) ctx.navigate(`/test?q=${idx + 1}`);
      else ctx.navigate("/result");
    });

    const actions = el("div", { className: "actions" }, [backBtn, restartBtn, nextBtn]);

    card.appendChild(header);
    card.appendChild(progress);
    card.appendChild(statement);
    card.appendChild(score);
    card.appendChild(actions);

    // Allow continuing if previously answered
    if (existing != null) nextBtn.disabled = false;
  });

  return () => {
    disposed = true;
  };
}

