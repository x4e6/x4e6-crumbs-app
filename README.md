# x4e6

Веб‑приложение: “один вопрос = один экран”, финальная страница с выводами, и отдельный модуль `crumbs` с кнопкой `collect crumbs`.

## Как запустить локально

Важно: из‑за ES‑модулей приложение нужно открывать **через локальный HTTP‑сервер**, а не как `file://`.

Примеры (любой один способ):

- Python:

```bash
cd x4e6-crumbs-app
python3 -m http.server 5173
```

- Node (если установлен):

```bash
cd x4e6-crumbs-app
npx serve -l 5173
```

Дальше откройте `http://localhost:5173` и перейдите на `#/test`.

## Подключение Google Sheets

Сейчас проект использует локальные данные `src/modules/test/test.data.sample.js`.

Чтобы загрузка работала “из таблицы”, удобнее всего:

1. В Google Sheets: **File → Share → Share with others** и выставить доступ **Anyone with the link → Viewer**  
2. Затем: **File → Share → Publish to web** → выбрать лист → формат **CSV** → Publish

После публикации у вас будет CSV‑URL вида:

`https://docs.google.com/spreadsheets/d/e/<...>/pub?gid=<...>&single=true&output=csv`

Далее можно заменить sample‑данные на загрузку из CSV и парсинг структуры (будет добавлено следующим шагом).

## crumbs

Маршрут `#/crumbs` — отдельный модуль. Идея структуры: позже вы сможете добавить `crumbs.html` и `crumbs.js` внутрь `src/modules/crumbs/` и заменить реализацию модуля, **не меняя** роутер и навигацию теста.

