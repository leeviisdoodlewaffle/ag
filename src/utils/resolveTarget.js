const fs = require("fs");
const path = require("path");
const { logError } = require("./logger");

function resolveTarget(host, routes, appsDir = path.join(process.env.HOME || "", "ahola", "apps")) {
  if (routes[host]) {
    return routes[host].target;
  }

  const match = host.match(/^(.+)\.ahola\.im$/);
  if (!match) {
    return null;
  }

  const appName = match[1];
  const appConfigPath = path.join(appsDir, `${appName}.json`);

  if (!fs.existsSync(appConfigPath)) {
    return null;
  }

  try {
    const config = JSON.parse(fs.readFileSync(appConfigPath, "utf8"));
    return config.target || null;
  } catch (error) {
    logError("app_config_invalid", {
      configPath: appConfigPath,
      message: error.message,
    });
    return null;
  }
}

module.exports = {
  resolveTarget,
};
