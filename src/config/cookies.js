import { env } from "./env.js";

function baseCookieOptions() {
  const options = {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    path: "/api/auth",
  };
  // Helps browsers that treat *.onrender.com as cross-site
  if (env.cookieSecure && String(env.cookieSameSite).toLowerCase() === "none") {
    options.partitioned = true;
  }
  return options;
}

export function refreshCookieOptions() {
  return {
    ...baseCookieOptions(),
    maxAge: 1000 * 60 * 60 * 24 * 7,
  };
}

export function clearRefreshCookieOptions() {
  return baseCookieOptions();
}
