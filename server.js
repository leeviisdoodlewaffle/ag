const app = require("./src/app");

const ports = new Set([
  process.env.PORT === undefined ? 8080 : Number(process.env.PORT),
  80,
]);

for (const port of ports) {
  app.listen(port, () => {
    console.log(`Ahola Gateway running :${port}`);
  });
}
