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
  <title>403 - Access Denied</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #fff;
      color: #333;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .container { max-width: 820px; width: 100%; }
    .header { margin-bottom: 2.5rem; }
    .title { font-size: 3rem; font-weight: 700; color: #333; }
    .error-badge {
      display: inline-block;
      margin-left: 0.75rem;
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
      border: 1px solid #dcdcdc;
      color: #777;
      font-size: 0.8rem;
      vertical-align: middle;
    }
    .subtitle { margin-top: 0.5rem; font-size: 1rem; color: #555; }
    .status-row {
      display: flex;
      justify-content: space-between;
      gap: 1.5rem;
      margin: 2rem 0;
    }
    .status-item { flex: 1; text-align: center; }
    .status-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 0.75rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
    }
    .status-icon.ok { background: #d4edda; color: #28a745; }
    .status-icon.error { background: #f8d7da; color: #dc3545; }
    .status-label { font-size: 0.85rem; color: #888; margin-top: 0.25rem; }
    .status-value { font-size: 0.95rem; color: #333; font-weight: 600; margin-top: 0.15rem; }
    .section-title { font-size: 1.1rem; font-weight: 600; color: #222; margin-bottom: 0.5rem; }
    .section-text { font-size: 0.95rem; color: #555; line-height: 1.5; }
    .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 1.5rem; }
    .footer { margin-top: 2.5rem; text-align: center; font-size: 0.8rem; color: #999; }
    @media (max-width: 560px) {
      body { padding: 1.5rem; }
      .columns { grid-template-columns: 1fr; gap: 1.25rem; }
      .header { margin-bottom: 2rem; }
      .title { font-size: 2.5rem; }
    }
  </style>
</head>
<body>
  <main class="container">
    <header class="header">
      <div>
        <span class="title">403</span>
        <span class="error-badge">Error code 403</span>
      </div>
      <p class="subtitle">This port is not available on this Ahola node.</p>
    </header>

    <section class="status-row" aria-label="Connection status">
      <div class="status-item">
        <div class="status-icon ok" aria-hidden="true">&#10003;</div>
        <div class="status-label">Browser</div>
        <div class="status-value">Working</div>
      </div>
      <div class="status-item">
        <div class="status-icon error" aria-hidden="true">&#10007;</div>
        <div class="status-label">Ahola Gateway</div>
        <div class="status-value">Access denied</div>
      </div>
    </section>

    <section class="columns">
      <div>
        <h2 class="section-title">What happened?</h2>
        <p class="section-text">Port ${req.socket.localPort} is on this node’s blocked-port list, so the gateway denied the request.</p>
      </div>
      <div>
        <h2 class="section-title">What can I do?</h2>
        <p class="section-text">Check the address and port. If you believe this port should be available, contact the node operator.</p>
      </div>
    </section>

    <footer class="footer">Ahola Node</footer>
  </main>
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
