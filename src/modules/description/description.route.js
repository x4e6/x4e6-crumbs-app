import { el } from "../../core/dom.js";
import { loadDescriptionFilledCells } from "../intro/intro.load.js";

function buildProgress({ total, currentIndex }) {
  const dots = el("div", { className: "progress__dots", role: "list" });
  for (let i = 0; i < total; i++) {
    const isDone = i < currentIndex;
    const isCurrent = i === currentIndex;
    dots.appendChild(
      el("div", {
        className: `progress__dot${isDone ? " is-done" : ""}${isCurrent ? " is-current" : ""}`,
        role: "listitem",
        "aria-label": `Карточка ${i + 1} из ${total}`,
      }),
    );
  }
  return el("div", { className: "progress" }, [
    el("div", { className: "progress__meta", text: `Карточка ${currentIndex + 1} / ${total}` }),
    dots,
  ]);
}

export function render(ctx) {
  const card = el("section", { className: "card" });
  card.appendChild(
    el("div", { className: "card__header" }, [
      el("h1", { className: "h1", text: "Описание" }),
      el("p", { className: "muted", text: "Загрузка…" }),
    ]),
  );
  ctx.mountEl.appendChild(card);

  let disposed = false;

  loadDescriptionFilledCells().then((cells) => {
    if (disposed) return;

    const values = (cells || []).map((c) => String(c?.value ?? "").trim()).filter(Boolean);
    if (!values.length) {
      card.innerHTML = "";
      card.appendChild(
        el("div", { className: "card__header" }, [
          el("h1", { className: "h1", text: "Описание" }),
          el("p", { className: "muted", text: "Нет данных во вкладке «Описание» — можно начинать тест." }),
        ]),
      );
      const go = el("button", { className: "btn btn--primary", text: "Поехали" });
      go.addEventListener("click", () => ctx.navigate("/test?q=0"));
      card.appendChild(el("div", { className: "actions" }, [go]));
      return;
    }

    let idx = Number(ctx.query.get("i") ?? 0);
    if (!Number.isFinite(idx) || idx < 0) idx = 0;
    if (idx >= values.length) idx = values.length - 1;

    card.innerHTML = "";

    const header = el("div", { className: "card__header" }, [
      el("h1", { className: "h1", text: "Описание" }),
      el("p", { className: "muted", text: "Прочитайте карточки перед тестом." }),
    ]);
    const progress = buildProgress({ total: values.length, currentIndex: idx });

    const body = el("div", { className: "question" }, [
      el("div", { className: "badge", text: "Описание" }),
      el("div", { className: "question__text", text: values[idx] }),
    ]);

    const isLast = idx === values.length - 1;
    const nextBtn = el("button", {
      className: "btn btn--primary",
      text: isLast ? "Поехали" : "Дальше",
    });

    nextBtn.addEventListener("click", () => {
      if (isLast) ctx.navigate("/test?q=0");
      else ctx.navigate(`/description?i=${idx + 1}`);
    });

    const actions = el("div", { className: "actions" }, [
      el("a", { className: "btn btn--ghost", href: "#/intro", text: "Назад" }),
      nextBtn,
    ]);

    card.appendChild(header);
    card.appendChild(progress);
    card.appendChild(body);
    card.appendChild(actions);
  });

  return () => {
    disposed = true;
  };
}

