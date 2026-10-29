function renderRateLimitPage(req, res) {
  res.status(429).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>429 - Too Many Requests</title>
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
    .subtitle {
      margin-top: 0.5rem;
      font-size: 1rem;
      color: #555;
    }
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
    .status-icon.warn { background: #fff3cd; color: #856404; }
    .status-icon.error { background: #f8d7da; color: #dc3545; }
    .status-label { font-size: 0.85rem; color: #888; margin-top: 0.25rem; }
    .status-value { font-size: 0.95rem; color: #333; font-weight: 600; margin-top: 0.15rem; }
    .section-title { font-size: 1.1rem; font-weight: 600; color: #222; margin-bottom: 0.5rem; }
    .section-text { font-size: 0.95rem; color: #555; line-height: 1.5; }
    .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 1.5rem; }
    .footer { margin-top: 2.5rem; text-align: center; font-size: 0.8rem; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <span class="title">429</span>
        <span class="error-badge">Error code 429</span>
      </div>
      <div class="subtitle">Too many requests have been sent from this address.</div>
    </div>

    <div class="status-row">
      <div class="status-item">
        <div class="status-icon warn">!</div>
        <div class="status-label">Requests</div>
        <div class="status-value">Rate Limited</div>
      </div>
      <div class="status-item">
        <div class="status-icon error">&#10007;</div>
        <div class="status-label">Ahola Gateway</div>
        <div class="status-value">Blocked</div>
      </div>
    </div>

    <div class="columns">
      <div>
        <div class="section-title">What happened?</div>
        <div class="section-text">This IP address has exceeded the allowed request limit. This protection helps prevent abuse and keeps the node stable for everyone.</div>
      </div>
      <div>
        <div class="section-title">What can I do?</div>
        <div class="section-text">Wait a few minutes and try again. If you are the node operator and this was triggered unexpectedly, you can adjust the rate limit settings in the gateway.</div>
      </div>
    </div>

    <div class="footer">Ahola Node</div>
  </div>
</body>
</html>`);
}

function renderUnknownRoute(req, res) {
  res.status(404).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 - Not Found</title>
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
    .status-row { display: flex; justify-content: space-between; gap: 1.5rem; margin: 2rem 0; }
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
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <span class="title">404</span>
        <span class="error-badge">Error code 404</span>
      </div>
      <div class="subtitle">This address is not connected to a deployed app on this node.</div>
    </div>

    <div class="status-row">
      <div class="status-item">
        <div class="status-icon ok">&#10003;</div>
        <div class="status-label">Browser</div>
        <div class="status-value">Working</div>
      </div>
      <div class="status-item">
        <div class="status-icon error">&#10007;</div>
        <div class="status-label">Ahola Gateway</div>
        <div class="status-value">Error</div>
      </div>
    </div>

    <div class="columns">
      <div>
        <div class="section-title">What happened?</div>
        <div class="section-text">The requested hostname does not have a route configured on this Ahola node.</div>
      </div>
      <div>
        <div class="section-title">What can I do?</div>
        <div class="section-text">Check that the app is deployed and DNS is pointed to this node. If the problem continues, contact the node operator.</div>
      </div>
    </div>

    <div class="footer">Ahola Node</div>
  </div>
</body>
</html>`);
}

module.exports = {
  renderRateLimitPage,
  renderUnknownRoute,
};
