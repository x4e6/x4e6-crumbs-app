export const routes = [
  {
    path: "/",
    load: () => import("../modules/intro/intro.route.js"),
  },
  {
    path: "/intro",
    load: () => import("../modules/intro/intro.route.js"),
  },
  {
    path: "/description",
    load: () => import("../modules/description/description.route.js"),
  },
  {
    path: "/test",
    load: () => import("../modules/test/test.route.js"),
  },
  {
    path: "/result",
    load: () => import("../modules/test/result.route.js"),
  },
  {
    path: "/crumbs",
    // This indirection is intentional: later you can drop in `crumbs.html` + `crumbs.js`
    // and only update the crumbs module internals without touching test navigation/router.
    load: () => import("../modules/crumbs/crumbs.route.js"),
  },
];

