import { env } from "../config/env.js";

export function notFoundHandler(_req, res) {
  res.status(404).json({ error: "Route not found" });
}

export function errorHandler(err, _req, res, _next) {
  console.error("[api error]", err);

  if (err?.message?.startsWith("Origin not allowed by CORS")) {
    return res.status(403).json({ error: "CORS origin denied" });
  }

  const status = err.status || err.statusCode || 500;
  const isClientError = status >= 400 && status < 500;
  const message =
    isClientError || !env.isProd
      ? err.message || "Internal server error"
      : "Internal server error";

  res.status(status).json({
    error: message,
    details: isClientError ? err.details || undefined : undefined,
  });
}

export function httpError(status, message, details) {
  const err = new Error(message);
  err.status = status;
  err.details = details;
  return err;
}
