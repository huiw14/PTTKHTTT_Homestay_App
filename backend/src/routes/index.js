import contractsRouter from "./contracts.routes.js";
import authRouter from "./auth.routes.js";
import catalogsRouter from "./catalogs.routes.js";

export default function route(app) {
  app.use("/api/auth", authRouter);
  app.use("/api/catalog", catalogsRouter);
  app.use("/api/contracts", contractsRouter);
}
