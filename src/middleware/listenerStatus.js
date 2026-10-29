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
      display: grid;
      grid-template-columns: 220px minmax(0, 1fr);
      align-items: center;
      gap: 34px;
      width: min(100%, 820px);
      padding: 42px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 28px;
      background: rgba(24, 31, 47, 0.92);
      box-shadow: 0 28px 90px rgba(0, 0, 0, 0.35);
    }
    .mascot {
      width: 100%;
      overflow: visible;
      filter: drop-shadow(0 18px 22px rgba(0, 0, 0, 0.28));
    }
    .brand {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 28px;
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
    .eyebrow {
      margin: 0 0 10px;
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
      margin: 14px 0 24px;
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
      margin: 24px 0 0;
      color: #747e94;
      font-size: 0.78rem;
    }
    @media (max-width: 640px) {
      body { padding: 20px 14px; }
      .card {
        grid-template-columns: 1fr;
        gap: 4px;
        max-width: 460px;
        padding: 28px 24px;
        border-radius: 22px;
        text-align: center;
      }
      .mascot { width: min(190px, 62%); margin: 0 auto; }
      .brand { margin-bottom: 16px; }
      .port { justify-content: center; }
      .footer { margin-top: 20px; }
    }
  </style>
</head>
<body>
  <main class="card">
    <svg class="mascot" viewBox="0 0 240 260" role="img" aria-label="A little orange fox guarding the blocked port" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fox-coat" x1="52" y1="30" x2="180" y2="224" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FFD166"/>
          <stop offset=".52" stop-color="#FF914D"/>
          <stop offset="1" stop-color="#F05D5E"/>
        </linearGradient>
        <linearGradient id="fox-tail" x1="34" y1="104" x2="112" y2="207" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FFB84D"/>
          <stop offset="1" stop-color="#FF6B58"/>
        </linearGradient>
      </defs>
      <circle cx="120" cy="126" r="103" fill="#8068E8" opacity=".12"/>
      <path d="M38 193c-19-9-24-25-14-36 8-9 22-8 31-2-9-16-3-31 10-33 12-2 22 9 23 24 19 2 34 14 39 31l-89 16Z" fill="url(#fox-tail)" stroke="#FFC16B" stroke-width="3" stroke-linejoin="round"/>
      <path d="M30 168c4-8 12-11 20-7 8 4 11 13 8 21-7 1-15-1-21-5-5-3-7-6-7-9Z" fill="#FFF0D7"/>
      <path d="M74 202c5-25 22-43 46-43s42 18 47 43l-7 24H81l-7-24Z" fill="url(#fox-coat)" stroke="#FFB45F" stroke-width="3" stroke-linejoin="round"/>
      <path d="M92 222c4-22 13-38 28-38s25 16 29 38H92Z" fill="#FFF0D7"/>
      <path d="m76 91 5-49c1-8 10-11 15-4l26 34 27-34c5-7 14-4 15 4l5 49c2 33-18 58-46 58S74 124 76 91Z" fill="url(#fox-coat)" stroke="#FFC16B" stroke-width="3" stroke-linejoin="round"/>
      <path d="m87 82 2-27 17 24c-7 0-13 1-19 3Zm67-3 17-24 2 27c-6-2-12-3-19-3Z" fill="#FF7180"/>
      <path d="M90 111c0-5 4-9 9-9s9 4 9 9-4 9-9 9-9-4-9-9Zm43 0c0-5 4-9 9-9s9 4 9 9-4 9-9 9-9-4-9-9Z" fill="#322846"/>
      <circle cx="102" cy="108" r="2.5" fill="white"/><circle cx="145" cy="108" r="2.5" fill="white"/>
      <ellipse cx="86" cy="128" rx="10" ry="6" fill="#FF9B9D" opacity=".8"/><ellipse cx="159" cy="128" rx="10" ry="6" fill="#FF9B9D" opacity=".8"/>
      <path d="M112 129c0-4 4-7 8-7s8 3 8 7c0 3-4 6-8 6s-8-3-8-6Z" fill="#75445C"/>
      <path d="M120 135c-1 6-6 8-11 5m11-5c1 6 6 8 11 5" fill="none" stroke="#75445C" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M72 225h96" stroke="#8068E8" stroke-width="7" stroke-linecap="round"/>
      <path d="m48 68 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Zm145 47 2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" fill="#FFE18A"/>
    </svg>
    <section>
      <div class="brand"><span class="brand-mark" aria-hidden="true">A</span> AHOLA GATEWAY</div>
      <p class="eyebrow">403 · Access restricted</p>
      <h1>This port is blocked</h1>
      <p class="description">Our little gatekeeper fox says this port is on the blocked list, so this request can’t come through.</p>
      <div class="port"><span class="port-dot" aria-hidden="true"></span>Port ${req.socket.localPort} · Access denied</div>
      <p class="footer">The fox is keeping the gateway cozy and safe.</p>
    </section>
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
