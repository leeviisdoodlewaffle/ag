const portStatuses = new Map();
const BLOCKED_PORTS = new Set([1111]);

function setPortStatus(port, state, errorCode = null) {
  portStatuses.set(port, { port, state, errorCode });
}

function blockedPortPage(req, res, next) {
  if (!BLOCKED_PORTS.has(req.socket.localPort)) {
    return next();
  }

  return res.status(403).type("html").send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>403 - Port Blocked</title>
</head>
<body>
  <h1>403 - Port Blocked</h1>
  <p>This port is on the Ahola Gateway blocked-port list, so access is intentionally denied.</p>
</body>
</html>`);
}

function listenerStatus(req, res, next) {
  if (req.method !== "GET" || req.path !== "/_status") {
    return next();
  }

  const rows = [...portStatuses.values()]
    .map(({ port, state, errorCode }) => {
      const status = state === "listening"
        ? "Listening"
        : state === "starting"
          ? "Starting"
          : "Blocked / not listening";
      const reason = errorCode ? ` (${errorCode})` : "";

      return `<tr><td>${port}</td><td>${status}${reason}</td></tr>`;
    })
    .join("");

  res.type("html").send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gateway listener status</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 700px; margin: 3rem auto; padding: 0 1rem; color: #222; }
    table { border-collapse: collapse; width: 100%; margin: 1.5rem 0; }
    th, td { border: 1px solid #ddd; padding: 0.75rem; text-align: left; }
    th { background: #f5f5f5; }
    .note { color: #555; line-height: 1.5; }
  </style>
</head>
<body>
  <h1>Gateway listener status</h1>
  <table>
    <thead><tr><th>Port</th><th>Status</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <p class="note">This reports whether the gateway could bind each port locally. It cannot detect incoming connections silently blocked by a firewall or network.</p>
</body>
</html>`);
}

module.exports = {
  BLOCKED_PORTS,
  blockedPortPage,
  listenerStatus,
  setPortStatus,
};
