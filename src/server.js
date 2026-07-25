import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import apiRouter from "./routes/index.js";
import { setupSwagger } from "./config/swagger.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { env } from "./config/env.js";

const app = express();

if (env.isProd) {
  app.set("trust proxy", 1);
}

const allowedOrigins = [
  env.frontendUrl,
  env.cmsUrl,
  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true,
  }),
);

app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

setupSwagger(app);
app.use("/api", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(env.port, () => {
  console.log(`API  ${env.apiPublicUrl}`);
  console.log(`Docs ${env.apiPublicUrl}/api/docs`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${env.port} is already in use. Stop the other process, then run npm start again.`,
    );
  } else {
    console.error("Server failed to start:", err.message);
  }
  process.exit(1);
});
