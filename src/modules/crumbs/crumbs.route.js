import { el } from "../../core/dom.js";

function pigeonSvg() {
  // Simple inline SVG so we don't need assets/build steps.
  return `
  <svg class="pigeon" viewBox="0 0 220 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="wing" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#9aa7b5"/>
        <stop offset="1" stop-color="#6f7c88"/>
      </linearGradient>
    </defs>
    <g class="pigeon__body">
      <ellipse cx="105" cy="72" rx="56" ry="30" fill="#8b98a6"/>
      <ellipse cx="145" cy="54" rx="25" ry="18" fill="#8b98a6"/>
      <path d="M93 54 C115 40, 135 40, 156 52 C140 65, 115 70, 90 63 Z" fill="url(#wing)"/>
      <circle cx="153" cy="50" r="2.7" fill="#0b1220"/>
      <path d="M165 55 L186 62 L165 66 Z" fill="#f2b24a"/>
      <path d="M72 82 L56 92" stroke="#c7d0d9" stroke-width="5" stroke-linecap="round"/>
      <path d="M98 84 L86 98" stroke="#c7d0d9" stroke-width="5" stroke-linecap="round"/>
    </g>
    <g class="crumbs">
      <circle cx="78" cy="104" r="3" fill="#e8d3a3"/>
      <circle cx="92" cy="108" r="2.5" fill="#e8d3a3"/>
      <circle cx="110" cy="104" r="2.8" fill="#e8d3a3"/>
      <circle cx="128" cy="110" r="2.2" fill="#e8d3a3"/>
    </g>
  </svg>
  `;
}

export function render(ctx) {
  const card = el("section", { className: "card" });
  card.appendChild(
    el("div", { className: "card__header" }, [
      el("h1", { className: "h1", text: "crumbs" }),
      el("p", { className: "muted", text: "Модуль-заглушка. Позже сюда можно добавить `crumbs.html` и `crumbs.js`." }),
    ]),
  );

  const btn = el("button", { className: "btn btn--primary", text: "collect crumbs" });
  const placeholder = el("div", { className: "crumbs-box", hidden: true }, [
    el("div", { className: "crumbs-box__title", text: "Gather..." }),
    el("div", { className: "crumbs-box__scene", "aria-label": "Animated pigeon pecking crumbs" }),
  ]);

  const scene = placeholder.querySelector(".crumbs-box__scene");
  scene.innerHTML = pigeonSvg();

  btn.addEventListener("click", () => {
    placeholder.hidden = false;
    btn.disabled = true;
    setTimeout(() => {
      btn.disabled = false;
    }, 900);
  });

  const back = el("a", { className: "btn btn--ghost", href: "#/test", text: "Назад к тесту" });

  card.appendChild(el("div", { className: "actions" }, [back, btn]));
  card.appendChild(placeholder);

  ctx.mountEl.appendChild(card);
  return () => {};
}

