import { env } from "./env.js";

export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    path: "/api/auth",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  };
}

export function clearRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    path: "/api/auth",
  };
}
