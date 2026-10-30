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
  <meta name="theme-color" content="#f7f7fb">
  <title>Connection speed test · Ahola</title>
  <style>
    * { box-sizing: border-box; }
    body {
      min-height: 100vh;
      margin: 0;
      padding: 48px 20px;
      background: #f7f7fb;
      color: #242337;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    main { width: min(100%, 760px); margin: 0 auto; }
    .brand { color: #6b63c8; font-size: .82rem; font-weight: 750; letter-spacing: .12em; }
    h1 { margin: 18px 0 8px; font-size: clamp(2rem, 6vw, 3rem); letter-spacing: -.055em; }
    .intro { margin: 0; color: #6e6c7d; line-height: 1.6; }
    .panel {
      margin-top: 32px;
      padding: 32px;
      border: 1px solid #e8e7f0;
      border-radius: 20px;
      background: #fff;
      box-shadow: 0 14px 40px rgba(37, 33, 75, .06);
    }
    .results { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .result { min-width: 0; padding: 20px 14px; border-radius: 14px; background: #f7f6fc; text-align: center; }
    .value { display: block; min-height: 2.4rem; color: #39365d; font-size: clamp(1.45rem, 5vw, 2rem); font-weight: 700; letter-spacing: -.04em; }
    .unit { color: #8c899e; font-size: .78rem; font-weight: 500; letter-spacing: 0; }
    .label { display: block; margin-top: 8px; color: #777487; font-size: .82rem; }
    .actions { display: flex; align-items: center; gap: 16px; margin-top: 24px; }
    button {
      min-height: 46px;
      padding: 0 22px;
      border: 0;
      border-radius: 10px;
      background: #7168d8;
      color: #fff;
      font: inherit;
      font-weight: 650;
      cursor: pointer;
    }
    button:hover:not(:disabled) { background: #5f56c5; }
    button:focus-visible { outline: 3px solid #bcb7ff; outline-offset: 3px; }
    button:disabled { cursor: wait; opacity: .65; }
    #status { color: #777487; font-size: .88rem; }
    #status.error { color: #b42335; }
    .note { margin: 22px 0 0; color: #9996a8; font-size: .8rem; line-height: 1.55; }
    @media (max-width: 520px) {
      body { padding: 30px 16px; }
      .panel { padding: 20px 14px; }
      .results { gap: 8px; }
      .result { padding: 16px 8px; }
      .actions { align-items: flex-start; flex-direction: column; gap: 12px; }
    }
  </style>
</head>
<body>
  <main>
    <div class="brand">AHOLA · CONNECTION TEST</div>
    <h1>How fast is your connection?</h1>
    <p class="intro">Measure your connection to this server with a quick download, upload, and response-time test.</p>
    <section class="panel" aria-label="Speed test">
      <div class="results" aria-live="polite">
        <div class="result"><span class="value" id="latency">—</span><span class="label">Latency <span class="unit">ms</span></span></div>
        <div class="result"><span class="value" id="download">—</span><span class="label">Download <span class="unit">Mbps</span></span></div>
        <div class="result"><span class="value" id="upload">—</span><span class="label">Upload <span class="unit">Mbps</span></span></div>
      </div>
      <div class="actions">
        <button id="start" type="button">Start test</button>
        <span id="status" role="status">Ready when you are.</span>
      </div>
      <p class="note">The test transfers up to 10 MB down and 5 MB up. Results measure this browser’s connection to the Ahola server and may use your data allowance.</p>
    </section>
  </main>
  <script>
    const button = document.getElementById("start");
    const status = document.getElementById("status");
    const latencyValue = document.getElementById("latency");
    const downloadValue = document.getElementById("download");
    const uploadValue = document.getElementById("upload");

    function setMbps(element, bytes, milliseconds) {
      const megabitsPerSecond = (bytes * 8) / (milliseconds * 1000);
      element.textContent = megabitsPerSecond.toFixed(1);
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
      latencyValue.textContent = "…";
      downloadValue.textContent = "…";
      uploadValue.textContent = "…";

      try {
        status.textContent = "Measuring response time…";
        const samples = [];
        for (let index = 0; index < 3; index += 1) {
          const started = performance.now();
          const response = await fetch("/ping?sample=" + index + "&t=" + Date.now(), { cache: "no-store" });
          if (!response.ok) throw new Error("The server did not respond to the ping.");
          samples.push(performance.now() - started);
        }
        latencyValue.textContent = Math.round(samples.reduce((sum, sample) => sum + sample, 0) / samples.length);

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

    button.addEventListener("click", runTest);
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
