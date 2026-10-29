const { renderRateLimitPage } = require("../views/errorPages");

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 120;
const rateLimits = new Map();

function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function rateLimit(req, res, next) {
  const ip = getClientIp(req);
  const now = Date.now();
  const window = rateLimits.get(ip);

  if (!window || now - window.start > RATE_LIMIT_WINDOW_MS) {
    rateLimits.set(ip, { start: now, count: 1 });
    return next();
  }

  window.count += 1;
  rateLimits.set(ip, window);

  if (window.count > RATE_LIMIT_MAX) {
    return renderRateLimitPage(req, res);
  }

  next();
}

module.exports = {
  getClientIp,
  rateLimit,
  rateLimits,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX,
};
