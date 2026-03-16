import express from "express";

import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";
import routes from "./routes";

const app = express();

app.use("/", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
