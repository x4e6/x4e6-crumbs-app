import { createRouter } from "./router.js";
import { routes } from "./routes.js";
import { ensureStyles } from "../core/dom.js";

ensureStyles();

const routeRoot = document.getElementById("route-root");
const router = createRouter({
  routes,
  mountEl: routeRoot,
});

router.start();
