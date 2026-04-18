import { el } from "../../core/dom.js";
import { loadState, resetState } from "../../core/store.js";
import { computeScores } from "./test.logic.js";
import { loadTestDefinition } from "./test.load.js";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatDateForFilename(date) {
  const dd = pad2(date.getDate());
  const mm = pad2(date.getMonth() + 1);
  const yyyy = String(date.getFullYear());
  return `${dd}-${mm}-${yyyy}`;
}

function buildResultsPayload({ test, answers, scores, completedAt }) {
  const questions = (test.questions || []).map((q) => {
    const raw = answers?.[q.id];
    const val = typeof raw === "number" ? raw : Number(raw);
    return {
      id: q.id,
      text: q.text,
      scale: q.scale,
      answer: Number.isFinite(val) ? val : null,
      points: Number.isFinite(val) ? val : null,
    };
  });

  return {
    completedAt: completedAt.toISOString(),
    completedAtLocal: completedAt.toLocaleString("ru-RU"),
    questions,
    scores: scores
      ? {
          sumA: scores.sumA,
          sumB: scores.sumB,
          index: scores.index,
          base: scores.base,
        }
      : null,
  };
}

function downloadJson({ payload, filename }) {
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

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
    const completedAt = new Date();

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

    // Download / send results (buttons should sit under the insights block)
    const sendStatus = el("div", { className: "muted", text: "" });
    const iframeName = "gas-results-target";
    const targetFrame = el("iframe", {
      name: iframeName,
      title: "gas-results-target",
      style: "display:none; width:0; height:0; border:0;",
    });
    const sendForm = el("form", {
      className: "actions",
      action: "https://script.google.com/macros/s/AKfycbxWXRRr9My51OVfRt62V1YZZHfYt-XdLwHxdfZNScUxDgETUMahZxGEBvh-9m0DZ7um/exec",
      method: "post",
      target: iframeName,
    });
    const payloadInput = el("input", { type: "hidden", name: "payload", value: "" });
    sendForm.appendChild(payloadInput);

    const sendBtn = el("button", { className: "btn btn--primary", type: "submit", text: "Скачать и отправить разработчику результаты" });
    const downloadBtn = el("button", { className: "btn", type: "button", text: "Только скачать результаты" });

    downloadBtn.addEventListener("click", () => {
      const payload = buildResultsPayload({
        test,
        answers: loadState().answers || {},
        scores,
        completedAt,
      });
      const filename = `results_${formatDateForFilename(completedAt)}.json`;
      downloadJson({ payload, filename });
    });

    sendForm.addEventListener("submit", (e) => {
      e.preventDefault();
      sendStatus.textContent = "";

      const payload = buildResultsPayload({
        test,
        answers: loadState().answers || {},
        scores,
        completedAt,
      });
      const filename = `results_${formatDateForFilename(completedAt)}.json`;

      // 1) Always download locally
      downloadJson({ payload, filename });

      sendBtn.disabled = true;
      sendBtn.textContent = "Отправка…";

      // 2) Send to Apps Script via regular form POST (avoids CORS issues)
      payloadInput.value = JSON.stringify(payload);

      let settled = false;
      let timeoutId = null;

      const cleanup = () => {
        targetFrame.removeEventListener("load", onLoad);
        if (timeoutId) window.clearTimeout(timeoutId);
        sendBtn.disabled = false;
        sendBtn.textContent = "Скачать и отправить разработчику результаты";
      };

      const onLoad = () => {
        if (settled) return;
        settled = true;
        sendStatus.textContent = "Отправлено";
        cleanup();
      };

      targetFrame.addEventListener("load", onLoad);
      timeoutId = window.setTimeout(() => {
        if (settled) return;
        settled = true;
        sendStatus.textContent = "Ошибка";
        cleanup();
      }, 12000);

      sendForm.submit();
    });

    sendForm.appendChild(sendBtn);
    sendForm.appendChild(downloadBtn);
    card.appendChild(targetFrame);
    card.appendChild(sendForm);
    card.appendChild(sendStatus);

    const actions = el("div", { className: "actions" });
    const backToTest = el("a", { className: "btn", href: "#/test?q=0", text: "Пройти снова" });
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

