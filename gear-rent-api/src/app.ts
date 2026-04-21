import path from "node:path";
import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import router from "./routes";

const app = express();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", router);

app.use(notFound);
app.use(errorHandler);

export default app;
