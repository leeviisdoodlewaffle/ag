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
  <meta name="theme-color" content="#101522">
  <title>Access denied · Ahola Gateway</title>
  <style>
    :root {
      color-scheme: dark;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #101522;
      color: #f3f5fa;
      font-synthesis: none;
      text-rendering: optimizeLegibility;
    }
    * { box-sizing: border-box; }
    body {
      display: grid;
      min-height: 100vh;
      margin: 0;
      padding: 32px 20px;
      place-items: center;
      background:
        radial-gradient(ellipse at 50% 0%, rgba(108, 91, 214, 0.2), transparent 55%),
        #101522;
    }
    .card {
      width: min(100%, 520px);
      padding: 48px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      background: rgba(24, 31, 47, 0.92);
      box-shadow: 0 28px 90px rgba(0, 0, 0, 0.35);
      text-align: center;
    }
    .brand {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 36px;
      color: #c6cbe0;
      font-size: 0.9rem;
      font-weight: 650;
      letter-spacing: 0.04em;
    }
    .brand-mark {
      display: grid;
      width: 30px;
      height: 30px;
      border-radius: 9px;
      background: #7667e8;
      color: white;
      font-size: 1.15rem;
      place-items: center;
    }
    .icon {
      display: grid;
      width: 88px;
      height: 88px;
      margin: 0 auto 24px;
      border: 1px solid rgba(255, 194, 107, 0.24);
      border-radius: 26px;
      background: rgba(255, 194, 107, 0.09);
      color: #ffc26b;
      place-items: center;
    }
    .eyebrow {
      margin: 0 0 12px;
      color: #ffc26b;
      font-size: 0.76rem;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }
    h1 {
      margin: 0;
      font-size: clamp(2rem, 8vw, 2.7rem);
      letter-spacing: -0.055em;
      line-height: 1.1;
    }
    .description {
      margin: 16px 0 28px;
      color: #aeb6c9;
      font-size: 1rem;
      line-height: 1.7;
    }
    .port {
      display: inline-flex;
      align-items: center;
      gap: 9px;
      padding: 11px 15px;
      border: 1px solid rgba(255, 255, 255, 0.09);
      border-radius: 999px;
      background: rgba(9, 13, 22, 0.42);
      color: #e5e8f1;
      font-size: 0.88rem;
    }
    .port-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #ffc26b;
      box-shadow: 0 0 12px rgba(255, 194, 107, 0.65);
    }
    .footer {
      margin: 36px 0 0;
      color: #747e94;
      font-size: 0.78rem;
    }
    @media (max-width: 480px) {
      .card { padding: 36px 24px; border-radius: 20px; }
      .brand { margin-bottom: 30px; }
    }
  </style>
</head>
<body>
  <main class="card">
    <div class="brand"><span class="brand-mark" aria-hidden="true">A</span> AHOLA GATEWAY</div>
    <div class="icon" aria-hidden="true">
      <svg width="42" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3 19 6v5c0 4.7-2.9 8.2-7 10-4.1-1.8-7-5.3-7-10V6l7-3Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
        <path d="M9.5 10V8.8a2.5 2.5 0 0 1 5 0V10m-5.7 0h6.4v5.2H8.8V10Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <p class="eyebrow">403 · Access restricted</p>
    <h1>This port is blocked</h1>
    <p class="description">This port is on the gateway’s blocked-port list. The request was denied to protect this service.</p>
    <div class="port"><span class="port-dot" aria-hidden="true"></span>Port ${req.socket.localPort} · Access denied</div>
    <p class="footer">Protected by Ahola Gateway</p>
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
