const express = require("express");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");

const routes = require("./config/routes.json");
const {
  blockedPortPage,
  listenerStatus,
} = require("./middleware/listenerStatus");
const { rateLimit } = require("./middleware/rateLimit");
const { resolveTarget } = require("./utils/resolveTarget");
const { renderUnknownRoute } = require("./views/errorPages");

const app = express();
const APPS_DIR = path.join(process.env.HOME || "", "ahola", "apps");

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use(blockedPortPage);
app.use(listenerStatus);
app.use(rateLimit);

app.use((req, res, next) => {
  const host = req.hostname;
  const target = resolveTarget(host, routes, APPS_DIR);

  console.log(new Date(), host, req.method, req.url, target ? `-> ${target}` : "");

  if (!target) {
    return renderUnknownRoute(req, res);
  }

  return createProxyMiddleware({
    target,
    changeOrigin: true,
  })(req, res, next);
});

module.exports = app;
