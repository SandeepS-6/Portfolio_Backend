import { asyncHandler } from "../utils/asyncHandler.js";
import * as authService from "../services/authService.js";
import * as oauthService from "../services/oauthService.js";
import { env } from "../config/env.js";
import {
  clearRefreshCookieOptions,
  refreshCookieOptions,
} from "../config/cookies.js";

function requestMeta(req) {
  return {
    userAgent: req.get("user-agent") || null,
    ip: req.ip || req.socket?.remoteAddress || null,
  };
}

function setRefreshCookie(res, token) {
  res.cookie(env.refreshCookieName, token, refreshCookieOptions());
}

function clearRefreshCookie(res) {
  res.clearCookie(env.refreshCookieName, clearRefreshCookieOptions());
}

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body, requestMeta(req));
  setRefreshCookie(res, result.refreshToken);
  res.json({
    accessToken: result.accessToken,
    user: result.user,
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[env.refreshCookieName];
  const result = await authService.refresh(token, requestMeta(req));
  setRefreshCookie(res, result.refreshToken);
  res.json({
    accessToken: result.accessToken,
    user: result.user,
  });
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[env.refreshCookieName];
  await authService.logout(token);
  clearRefreshCookie(res);
  res.json({ ok: true });
});

export const me = asyncHandler(async (req, res) => {
  res.json(await authService.getMe(req.user.id));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  res.json(await authService.requestPasswordReset(req.body));
});

export const resetPassword = asyncHandler(async (req, res) => {
  res.json(await authService.resetPassword(req.body));
});

export const oauthProviders = asyncHandler(async (_req, res) => {
  res.json(oauthService.getOAuthStatus());
});

export const oauthGoogleStart = asyncHandler(async (_req, res) => {
  try {
    res.redirect(oauthService.buildGoogleAuthUrl());
  } catch (error) {
    res.redirect(
      oauthService.oauthErrorRedirect(
        error?.message || "Google sign-in is not configured",
      ),
    );
  }
});

export const oauthGithubStart = asyncHandler(async (_req, res) => {
  try {
    res.redirect(oauthService.buildGithubAuthUrl());
  } catch (error) {
    res.redirect(
      oauthService.oauthErrorRedirect(
        error?.message || "GitHub sign-in is not configured",
      ),
    );
  }
});

async function finishOAuth(provider, req, res) {
  try {
    if (req.query.error) {
      return res.redirect(
        oauthService.oauthErrorRedirect(
          String(req.query.error_description || req.query.error),
        ),
      );
    }
    const result = await oauthService.completeOAuth(
      {
        provider,
        code: req.query.code,
        state: req.query.state,
      },
      requestMeta(req),
    );
    setRefreshCookie(res, result.refreshToken);
    return res.redirect(oauthService.oauthSuccessRedirect(result.accessToken));
  } catch (error) {
    const message =
      error?.status && error?.message
        ? error.message
        : "Social sign-in failed";
    return res.redirect(oauthService.oauthErrorRedirect(message));
  }
}

export const oauthGoogleCallback = asyncHandler(async (req, res) => {
  await finishOAuth("google", req, res);
});

export const oauthGithubCallback = asyncHandler(async (req, res) => {
  await finishOAuth("github", req, res);
});
