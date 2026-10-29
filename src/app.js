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
const {
  renderGatewayError,
  renderUnknownRoute,
} = require("./views/errorPages");
const { logError, logInfo } = require("./utils/logger");

const app = express();
const APPS_DIR = path.join(process.env.HOME || "", "ahola", "apps");

function handleProxyError(error, req, res) {
  logError("upstream_request_failed", {
    host: req.hostname,
    method: req.method,
    path: req.path,
    code: error.code || null,
    message: error.message,
  });

  if (typeof res.status === "function" && !res.headersSent) {
    return renderGatewayError(req, res, 502);
  }

  if (typeof res.destroy === "function") {
    return res.destroy();
  }
}

const proxyMiddleware = createProxyMiddleware({
  router: (req) => req.gatewayTarget,
  changeOrigin: true,
  on: {
    error: handleProxyError,
  },
});

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use(blockedPortPage);
app.use(listenerStatus);
app.use(rateLimit);

app.use((req, res, next) => {
  const host = req.hostname;
  const target = resolveTarget(host, routes, APPS_DIR);

  if (!target) {
    logInfo("route_not_found", {
      host,
      method: req.method,
      path: req.path,
    });
    return renderUnknownRoute(req, res);
  }

  req.gatewayTarget = target;
  logInfo("request_proxy", {
    host,
    method: req.method,
    path: req.path,
  });

  return proxyMiddleware(req, res, next);
});

app.use((error, req, res, next) => {
  const statusCode = Number.isInteger(error.statusCode) && error.statusCode >= 400 && error.statusCode <= 599
    ? error.statusCode
    : Number.isInteger(error.status) && error.status >= 400 && error.status <= 599
      ? error.status
      : 500;

  logError("request_failed", {
    host: req.hostname,
    method: req.method,
    path: req.path,
    statusCode,
    code: error.type || error.code || null,
    message: error.message,
  });

  if (res.headersSent) {
    return next(error);
  }

  return renderGatewayError(req, res, statusCode);
});

module.exports = app;
