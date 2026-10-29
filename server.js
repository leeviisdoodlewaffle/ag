const app = require("./src/app");
const { setPortStatus } = require("./src/middleware/listenerStatus");

const ports = new Set([
  process.env.PORT === undefined ? 8080 : Number(process.env.PORT),
  80,
]);

for (const port of ports) {
  setPortStatus(port, "starting");

  try {
    const server = app.listen(port, () => {
      setPortStatus(port, "listening");
      console.log(`Ahola Gateway running :${port}`);
    });

    server.on("error", (error) => {
      setPortStatus(port, "blocked", error.code || "LISTEN_ERROR");
      console.error(`Ahola Gateway could not listen on port ${port}:`, error.message);
    });
  } catch (error) {
    setPortStatus(port, "blocked", error.code || "LISTEN_ERROR");
    console.error(`Ahola Gateway could not listen on port ${port}:`, error.message);
  }
}
