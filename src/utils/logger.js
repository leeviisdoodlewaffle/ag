function writeLog(level, event, details = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: "ahola-gateway",
    event,
    ...details,
  };

  console[level](JSON.stringify(entry));
}

function logInfo(event, details) {
  writeLog("info", event, details);
}

function logError(event, details) {
  writeLog("error", event, details);
}

module.exports = {
  logError,
  logInfo,
};
