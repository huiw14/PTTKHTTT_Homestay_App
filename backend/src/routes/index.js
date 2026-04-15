import contractsRouter from "./contracts.routes.js";

export default function route(app) {
  app.use("/api/contracts", contractsRouter);
}
