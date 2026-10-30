const { Readable } = require("stream");
const { logError } = require("../utils/logger");

const SPEED_TEST_PORT = 3390;
const MAX_TRANSFER_BYTES = 50 * 1024 * 1024;
const DOWNLOAD_CHUNK_BYTES = 64 * 1024;
const downloadChunk = Buffer.alloc(DOWNLOAD_CHUNK_BYTES);

function parseTransferSize(value) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return null;
  }

  const size = Number(value);
  return Number.isSafeInteger(size) && size > 0 && size <= MAX_TRANSFER_BYTES
    ? size
    : null;
}

function sendSpeedTestPage(res) {
  return res.type("html").send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#ffffff">
  <title>Connection speed test · Ahola</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: #fff;
      color: #333;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    main { width: 100%; max-width: 820px; }
    .header { margin-bottom: 2.5rem; }
    .eyebrow { margin-bottom: .65rem; color: #777; font-size: .82rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
    h1 { color: #333; font-size: clamp(2.2rem, 7vw, 3rem); font-weight: 700; letter-spacing: -.045em; }
    .intro { margin-top: .6rem; color: #555; font-size: 1rem; line-height: 1.55; }
    .status-row { display: flex; gap: 1.5rem; margin: 2rem 0; }
    .status-item { flex: 1; text-align: center; }
    .status-icon {
      display: flex;
      width: 64px;
      height: 64px;
      align-items: center;
      justify-content: center;
      margin: 0 auto .75rem;
      border-radius: 50%;
      background: #d4edda;
      color: #28a745;
      font-size: 1.75rem;
    }
    .status-label { margin-top: .25rem; color: #888; font-size: .85rem; }
    .status-value { margin-top: .15rem; color: #333; font-size: .95rem; font-weight: 600; }
    .section-title { margin-bottom: .5rem; color: #222; font-size: 1.1rem; font-weight: 600; }
    .section-text { color: #555; font-size: .95rem; line-height: 1.5; }
    .results {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      margin: 1.5rem 0;
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      overflow: hidden;
    }
    .result { min-width: 0; padding: 1.35rem 1rem; text-align: center; }
    .result + .result { border-left: 1px solid #e5e5e5; }
    .value { display: block; min-height: 2.5rem; color: #333; font-size: clamp(1.6rem, 5vw, 2rem); font-weight: 700; letter-spacing: -.035em; }
    .unit { color: #888; font-size: .78rem; font-weight: 500; letter-spacing: 0; }
    .label { display: block; margin-top: .35rem; color: #777; font-size: .85rem; }
    .actions { display: flex; align-items: center; gap: 1rem; margin-top: 1.25rem; }
    button {
      min-height: 42px;
      padding: 0 1.25rem;
      border: 0;
      border-radius: 999px;
      background: #b89af7;
      color: #211a35;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
    }
    button:hover:not(:disabled) { background: #a986f0; }
    button:focus-visible { outline: 3px solid #d5c6ff; outline-offset: 3px; }
    button:disabled { cursor: wait; opacity: .65; }
    #status { color: #777; font-size: .9rem; }
    #status.error { color: #b42335; }
    .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 1.75rem; }
    .server-info { margin-top: 1.75rem; padding-top: 1.25rem; border-top: 1px solid #e5e5e5; }
    .info-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; margin-top: .9rem; }
    .info-item { min-width: 0; }
    .info-label { display: block; margin-bottom: .3rem; color: #888; font-size: .78rem; }
    .info-value { display: block; overflow-wrap: anywhere; color: #333; font-size: .9rem; font-weight: 600; }
    .footer { margin-top: 2.5rem; color: #999; font-size: .8rem; text-align: center; }
    @media (max-width: 560px) {
      body { padding: 1.5rem; }
      .header { margin-bottom: 2rem; }
      .results { grid-template-columns: 1fr; }
      .result { padding: 1rem; }
      .result + .result { border-top: 1px solid #e5e5e5; border-left: 0; }
      .columns { grid-template-columns: 1fr; gap: 1.25rem; }
      .actions { align-items: flex-start; flex-direction: column; }
      .info-list { grid-template-columns: 1fr; gap: .75rem; }
    }
  </style>
</head>
<body>
  <main>
    <header class="header">
      <p class="eyebrow">Ahola Node · Connection test</p>
      <h1>Connection speed test</h1>
    <p class="intro">Measure your connection to this server with a quick download, upload, and response-time test.</p>
    </header>
    <section aria-label="Speed test">
      <div class="status-row" aria-label="Connection status">
        <div class="status-item">
          <div class="status-icon" aria-hidden="true">&#10003;</div>
          <div class="status-label">Browser</div>
          <div class="status-value">Connected</div>
        </div>
        <div class="status-item">
          <div class="status-icon" aria-hidden="true">&#10003;</div>
          <div class="status-label">Ahola Node</div>
          <div class="status-value">Ready to test</div>
        </div>
      </div>
      <h2 class="section-title">Your results</h2>
      <p class="section-text">Run the test to measure HTTP round-trip time and transfer speed between this browser and the server.</p>
      <div class="results" aria-live="polite">
        <div class="result"><span class="value" id="latency">— <span class="unit">ms</span></span><span class="label">Latency</span></div>
        <div class="result"><span class="value" id="download">— <span class="unit">Mbps</span></span><span class="label">Download</span></div>
        <div class="result"><span class="value" id="upload">— <span class="unit">Mbps</span></span><span class="label">Upload</span></div>
      </div>
      <div class="actions">
        <button id="start" type="button">Start test</button>
        <span id="status" role="status">Ready when you are.</span>
      </div>
      <div class="columns">
        <div>
          <h2 class="section-title">What is measured?</h2>
          <p class="section-text">Latency is the median HTTP response time across seven requests after a warm-up. It is not ICMP ping. Download and upload show data transfer speed to this Ahola node.</p>
        </div>
        <div>
          <h2 class="section-title">About this test</h2>
          <p class="section-text">The test transfers up to 10 MB down and 5 MB up. Results are approximate and may use your data allowance.</p>
        </div>
      </div>
      <div class="server-info">
        <h2 class="section-title">Server information</h2>
        <p class="section-text">Details about the endpoint this browser is currently testing.</p>
        <div class="info-list" aria-live="polite">
          <div class="info-item"><span class="info-label">Endpoint</span><span class="info-value" id="server-endpoint">Loading…</span></div>
          <div class="info-item"><span class="info-label">Service</span><span class="info-value" id="server-service">Loading…</span></div>
          <div class="info-item"><span class="info-label">Server time</span><span class="info-value" id="server-time">Loading…</span></div>
        </div>
      </div>
    </section>
    <footer class="footer">Ahola Node</footer>
  </main>
  <script>
    const button = document.getElementById("start");
    const status = document.getElementById("status");
    const latencyValue = document.getElementById("latency");
    const downloadValue = document.getElementById("download");
    const uploadValue = document.getElementById("upload");

    function median(values) {
      const sorted = [...values].sort((left, right) => left - right);
      return sorted[Math.floor(sorted.length / 2)];
    }

    function setMbps(element, bytes, milliseconds) {
      const megabitsPerSecond = (bytes * 8) / (milliseconds * 1000);
      element.innerHTML = megabitsPerSecond.toFixed(1) + ' <span class="unit">Mbps</span>';
    }

    function makeUploadData(size) {
      const bytes = new Uint8Array(size);
      for (let offset = 0; offset < size; offset += 65536) {
        crypto.getRandomValues(bytes.subarray(offset, Math.min(offset + 65536, size)));
      }
      return new Blob([bytes], { type: "application/octet-stream" });
    }

    async function runTest() {
      button.disabled = true;
      status.classList.remove("error");
      latencyValue.innerHTML = '… <span class="unit">ms</span>';
      downloadValue.innerHTML = '… <span class="unit">Mbps</span>';
      uploadValue.innerHTML = '… <span class="unit">Mbps</span>';

      try {
        status.textContent = "Measuring response time…";
        const warmup = await fetch("/ping?warmup=" + Date.now(), { cache: "no-store" });
        if (!warmup.ok) throw new Error("The server did not respond to the warm-up request.");

        const samples = [];
        for (let index = 0; index < 7; index += 1) {
          const started = performance.now();
          const response = await fetch("/ping?sample=" + index + "&t=" + Date.now(), { cache: "no-store" });
          if (!response.ok) throw new Error("The server did not respond to the ping.");
          samples.push(performance.now() - started);
        }
        latencyValue.innerHTML = Math.round(median(samples)) + ' <span class="unit">ms</span>';

        status.textContent = "Testing download…";
        const downloadBytes = 10 * 1024 * 1024;
        const downloadStart = performance.now();
        const downloadResponse = await fetch("/download?bytes=" + downloadBytes + "&t=" + Date.now(), { cache: "no-store" });
        if (!downloadResponse.ok) throw new Error("The download test failed.");
        const downloaded = await downloadResponse.arrayBuffer();
        setMbps(downloadValue, downloaded.byteLength, performance.now() - downloadStart);

        status.textContent = "Testing upload…";
        const uploadData = makeUploadData(5 * 1024 * 1024);
        const uploadStart = performance.now();
        const uploadResponse = await fetch("/upload", {
          method: "POST",
          headers: { "Content-Type": "application/octet-stream" },
          body: uploadData,
          cache: "no-store"
        });
        if (!uploadResponse.ok) throw new Error("The upload test failed.");
        const uploadResult = await uploadResponse.json();
        setMbps(uploadValue, uploadResult.bytes, performance.now() - uploadStart);
        status.textContent = "Test complete.";
      } catch (error) {
        status.textContent = error.message || "The speed test could not complete.";
        status.classList.add("error");
      } finally {
        button.disabled = false;
      }
    }

    async function loadServerInfo() {
      const endpoint = document.getElementById("server-endpoint");
      const service = document.getElementById("server-service");
      const serverTime = document.getElementById("server-time");

      endpoint.textContent = location.host + " (" + location.protocol.replace(":", "").toUpperCase() + ")";

      try {
        const response = await fetch("/info", { cache: "no-store" });
        if (!response.ok) throw new Error("Could not load server information.");
        const info = await response.json();
        service.textContent = info.service + " · port " + info.port;
        serverTime.textContent = new Date(info.serverTime).toLocaleString();
      } catch (error) {
        service.textContent = "Unavailable";
        serverTime.textContent = "Could not load";
        status.textContent = error.message || "Server details are unavailable.";
      }
    }

    button.addEventListener("click", runTest);
    loadServerInfo();
  </script>
</body>
</html>`);
}

function speedTest(req, res, next) {
  if (req.socket.localPort !== SPEED_TEST_PORT) {
    return next();
  }

  if (req.method === "GET" && req.path === "/") {
    return sendSpeedTestPage(res);
  }

  if (req.method === "GET" && req.path === "/ping") {
    return res.status(204).set("Cache-Control", "no-store").end();
  }

  if (req.method === "GET" && req.path === "/info") {
    return res.set("Cache-Control", "no-store").json({
      service: "Ahola Speed Test",
      port: req.socket.localPort,
      serverTime: new Date().toISOString(),
    });
  }

  if (req.method === "GET" && req.path === "/download") {
    const size = parseTransferSize(req.query.bytes);
    if (!size) {
      return res.status(400).json({ error: "bytes must be an integer between 1 and 52428800" });
    }

    res.status(200);
    res.set({
      "Cache-Control": "no-store, no-transform",
      "Content-Length": String(size),
      "Content-Type": "application/octet-stream",
    });

    const source = Readable.from((async function* generateDownload() {
      let remaining = size;
      while (remaining > 0) {
        const chunkSize = Math.min(remaining, DOWNLOAD_CHUNK_BYTES);
        yield downloadChunk.subarray(0, chunkSize);
        remaining -= chunkSize;
      }
    }()));

    res.on("close", () => source.destroy());
    source.on("error", (error) => {
      if (!res.destroyed) {
        next(error);
      }
    });
    return source.pipe(res);
  }

  if (req.method === "POST" && req.path === "/upload") {
    const contentLength = Number(req.headers["content-length"]);
    if (Number.isFinite(contentLength) && contentLength > MAX_TRANSFER_BYTES) {
      res.status(413).json({ error: "upload exceeds the 50 MB limit" });
      req.destroy();
      return undefined;
    }

    let bytes = 0;
    const started = process.hrtime.bigint();

    req.on("data", (chunk) => {
      bytes += chunk.length;
      if (bytes > MAX_TRANSFER_BYTES) {
        logError("speed_test_upload_too_large", { bytes });
        res.status(413).json({ error: "upload exceeds the 50 MB limit" });
        req.destroy();
      }
    });

    req.on("end", () => {
      if (res.headersSent) {
        return;
      }

      const elapsedSeconds = Number(process.hrtime.bigint() - started) / 1e9;
      res.set("Cache-Control", "no-store").json({
        bytes,
        seconds: elapsedSeconds,
      });
    });

    req.on("error", (error) => {
      if (!req.destroyed) {
        next(error);
      }
    });

    return undefined;
  }

  return res.status(404).type("text").send("Not found");
}

module.exports = {
  MAX_TRANSFER_BYTES,
  SPEED_TEST_PORT,
  parseTransferSize,
  speedTest,
};
