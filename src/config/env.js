import dotenv from "dotenv";

dotenv.config();

function required(name, { optionalInDev = false } = {}) {
  const value = process.env[name];
  if (value) return value;
  if (optionalInDev && process.env.NODE_ENV !== "production") {
    return undefined;
  }
  throw new Error(`Missing required environment variable: ${name}`);
}

const isProd = process.env.NODE_ENV === "production";
const url = (process.env.URL || process.env.API_URL || "http://localhost").replace(
  /\/$/,
  "",
);
const port = Number(process.env.PORT || 5000);

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProd,
  port,
  url,
  apiPublicUrl: process.env.API_PUBLIC_URL || `${url}:${port}`,
  databaseUrl: required("DATABASE_URL"),
  frontendUrl: process.env.FRONTEND_URL ,
  cmsUrl: process.env.CMS_URL ,
  jwtAccessSecret:
    process.env.JWT_ACCESS_SECRET ||
    (!isProd ? "dev-access-secret-change-me" : required("JWT_ACCESS_SECRET")),
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET ||
    (!isProd ? "dev-refresh-secret-change-me" : required("JWT_REFRESH_SECRET")),
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || "15m",
  refreshTokenTtl: process.env.REFRESH_TOKEN_TTL || "7d",
  refreshCookieName: process.env.REFRESH_COOKIE_NAME || "portfolio_refresh",
  cookieSecure:
    process.env.COOKIE_SECURE === "true" ||
    (process.env.COOKIE_SECURE !== "false" && isProd),
  cookieSameSite: process.env.COOKIE_SAME_SITE || (isProd ? "none" : "lax"),
  adminEmail: process.env.ADMIN_EMAIL ,
  adminPassword: process.env.ADMIN_PASSWORD ,
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  githubClientId: process.env.GITHUB_CLIENT_ID || "",
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET || "",
};

export default env;
