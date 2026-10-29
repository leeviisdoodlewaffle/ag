const app = require("./src/app");
const {
  BLOCKED_PORTS,
  setPortStatus,
} = require("./src/middleware/listenerStatus");
const { logError, logInfo } = require("./src/utils/logger");

const ports = new Set([
  process.env.PORT === undefined ? 8080 : Number(process.env.PORT),
  80,
  ...BLOCKED_PORTS,
]);

for (const port of ports) {
  setPortStatus(port, "starting");

  try {
    const server = app.listen(port, () => {
      setPortStatus(port, "listening");
      logInfo("listener_ready", { port });
    });

    server.on("error", (error) => {
      setPortStatus(port, "blocked", error.code || "LISTEN_ERROR");
      logError("listener_failed", {
        port,
        code: error.code || "LISTEN_ERROR",
        message: error.message,
      });
    });
  } catch (error) {
    setPortStatus(port, "blocked", error.code || "LISTEN_ERROR");
    logError("listener_failed", {
      port,
      code: error.code || "LISTEN_ERROR",
      message: error.message,
    });
  }
}
