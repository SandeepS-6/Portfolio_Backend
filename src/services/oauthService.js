import crypto from "node:crypto";
import prisma from "../config/prisma.js";
import { env } from "../config/env.js";
import { httpError } from "../middlewares/errorHandler.js";
import { issueSession } from "./authService.js";

const STATE_TTL_MS = 10 * 60 * 1000;

function apiBase() {
  return String(env.apiPublicUrl || "http://localhost:5000").replace(/\/$/, "");
}

function cmsBase() {
  return String(env.cmsUrl || "http://localhost:5174").replace(/\/$/, "");
}

function signState(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", env.jwtAccessSecret)
    .update(body)
    .digest("base64url");
  return `${body}.${sig}`;
}

function verifyState(state) {
  if (!state || typeof state !== "string" || !state.includes(".")) {
    throw httpError(400, "Invalid OAuth state");
  }
  const [body, sig] = state.split(".");
  const expected = crypto
    .createHmac("sha256", env.jwtAccessSecret)
    .update(body)
    .digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw httpError(400, "Invalid OAuth state");
  }
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  if (!payload?.exp || payload.exp < Date.now()) {
    throw httpError(400, "OAuth state expired — try again");
  }
  return payload;
}

export function isGoogleOAuthConfigured() {
  return Boolean(env.googleClientId && env.googleClientSecret);
}

export function isGithubOAuthConfigured() {
  return Boolean(env.githubClientId && env.githubClientSecret);
}

export function getOAuthStatus() {
  return {
    google: isGoogleOAuthConfigured(),
    github: isGithubOAuthConfigured(),
  };
}

export function buildGoogleAuthUrl() {
  if (!isGoogleOAuthConfigured()) {
    throw httpError(503, "Google sign-in is not configured");
  }
  const state = signState({
    provider: "google",
    nonce: crypto.randomBytes(16).toString("hex"),
    exp: Date.now() + STATE_TTL_MS,
  });
  const params = new URLSearchParams({
    client_id: env.googleClientId,
    redirect_uri: `${apiBase()}/api/auth/oauth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export function buildGithubAuthUrl() {
  if (!isGithubOAuthConfigured()) {
    throw httpError(503, "GitHub sign-in is not configured");
  }
  const state = signState({
    provider: "github",
    nonce: crypto.randomBytes(16).toString("hex"),
    exp: Date.now() + STATE_TTL_MS,
  });
  const params = new URLSearchParams({
    client_id: env.githubClientId,
    redirect_uri: `${apiBase()}/api/auth/oauth/github/callback`,
    scope: "read:user user:email",
    state,
  });
  return `https://github.com/login/oauth/authorize?${params}`;
}

async function exchangeGoogleCode(code) {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.googleClientId,
      client_secret: env.googleClientSecret,
      redirect_uri: `${apiBase()}/api/auth/oauth/google/callback`,
      grant_type: "authorization_code",
    }),
  });
  const tokenJson = await tokenRes.json().catch(() => ({}));
  if (!tokenRes.ok || !tokenJson.access_token) {
    throw httpError(401, "Google token exchange failed");
  }

  const profileRes = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    },
  );
  const profile = await profileRes.json().catch(() => ({}));
  if (!profileRes.ok || !profile.email) {
    throw httpError(401, "Could not read Google profile");
  }

  return {
    provider: "google",
    providerId: String(profile.sub),
    email: String(profile.email).trim().toLowerCase(),
    emailVerified: profile.email_verified !== false,
  };
}

async function exchangeGithubCode(code) {
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: env.githubClientId,
      client_secret: env.githubClientSecret,
      code,
      redirect_uri: `${apiBase()}/api/auth/oauth/github/callback`,
    }),
  });
  const tokenJson = await tokenRes.json().catch(() => ({}));
  if (!tokenRes.ok || !tokenJson.access_token) {
    throw httpError(401, "GitHub token exchange failed");
  }

  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${tokenJson.access_token}`,
      "User-Agent": "portfolio-cms",
    },
  });
  const profile = await userRes.json().catch(() => ({}));
  if (!userRes.ok || !profile.id) {
    throw httpError(401, "Could not read GitHub profile");
  }

  let email = profile.email ? String(profile.email).trim().toLowerCase() : "";
  if (!email) {
    const emailsRes = await fetch("https://api.github.com/user/emails", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${tokenJson.access_token}`,
        "User-Agent": "portfolio-cms",
      },
    });
    const emails = await emailsRes.json().catch(() => []);
    if (Array.isArray(emails)) {
      const primary =
        emails.find((row) => row.primary && row.verified) ||
        emails.find((row) => row.verified) ||
        emails[0];
      email = primary?.email ? String(primary.email).trim().toLowerCase() : "";
    }
  }

  if (!email) {
    throw httpError(401, "GitHub account has no usable email");
  }

  return {
    provider: "github",
    providerId: String(profile.id),
    email,
    emailVerified: true,
  };
}

async function resolveCmsUser(identity) {
  if (!identity.emailVerified) {
    throw httpError(403, "Verify your email with the provider, then try again");
  }

  const providerKey = identity.provider === "google" ? "googleId" : "githubId";

  let user = await prisma.user.findFirst({
    where: { [providerKey]: identity.providerId },
  });

  if (!user) {
    user = await prisma.user.findUnique({ where: { email: identity.email } });
  }

  if (!user) {
    const adminEmail = String(env.adminEmail || "")
      .trim()
      .toLowerCase();
    if (adminEmail && identity.email === adminEmail) {
      user = await prisma.user.create({
        data: {
          email: identity.email,
          role: "ADMIN",
          [providerKey]: identity.providerId,
        },
      });
    }
  }

  if (!user || !user.isActive) {
    throw httpError(
      403,
      `No CMS account for ${identity.email || "this email"}. Use the same email as ADMIN_EMAIL, or sign in with password first.`,
    );
  }

  if (user[providerKey] !== identity.providerId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { [providerKey]: identity.providerId },
    });
  }

  return user;
}

export async function completeOAuth({ provider, code, state }, meta = {}) {
  if (!code) throw httpError(400, "Missing OAuth code");
  const payload = verifyState(state);
  if (payload.provider !== provider) {
    throw httpError(400, "OAuth provider mismatch");
  }

  const identity =
    provider === "google"
      ? await exchangeGoogleCode(code)
      : await exchangeGithubCode(code);

  const user = await resolveCmsUser(identity);
  return issueSession(user, meta);
}

// Pass access token in the hash so CMS can finish login without cross-site cookies
// (*.onrender.com are separate sites — refresh cookies often get blocked).
export function oauthSuccessRedirect(accessToken) {
  const hash = new URLSearchParams({ access_token: accessToken }).toString();
  return `${cmsBase()}/oauth/callback#${hash}`;
}

export function oauthErrorRedirect(message) {
  const params = new URLSearchParams({
    error: message || "Sign-in failed",
  });
  return `${cmsBase()}/login?${params}`;
}
