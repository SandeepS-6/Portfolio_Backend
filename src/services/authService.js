import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import prisma from "../config/prisma.js";
import { env } from "../config/env.js";
import { sendPasswordResetEmail } from "../config/mailer.js";
import { httpError } from "../middlewares/errorHandler.js";
import {
  createRefreshToken,
  hashToken,
  refreshExpiresAt,
  signAccessToken,
} from "../utils/tokens.js";

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}

async function issueSession(user, meta = {}) {
  const refreshToken = createRefreshToken();
  const familyId = cryptoRandomId();

  await prisma.refreshSession.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      familyId,
      expiresAt: refreshExpiresAt(),
      userAgent: meta.userAgent || null,
      ip: meta.ip || null,
    },
  });

  return {
    accessToken: signAccessToken(user),
    refreshToken,
    user: publicUser(user),
  };
}

export { issueSession };

function cryptoRandomId() {
  return hashToken(`${Date.now()}-${Math.random()}`).slice(0, 24);
}

export async function login({ email, password }, meta = {}) {
  if (!email || !password) {
    throw httpError(400, "Email and password are required");
  }

  const user = await prisma.user.findUnique({
    where: { email: String(email).trim().toLowerCase() },
  });

  if (!user || !user.isActive) {
    throw httpError(401, "Invalid email or password");
  }

  if (!user.passwordHash) {
    throw httpError(401, "This account uses Google or GitHub sign-in");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw httpError(401, "Invalid email or password");
  }

  return issueSession(user, meta);
}

export async function requestPasswordReset({ email }) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) {
    throw httpError(400, "Email is required");
  }

  // Always return the same shape so callers cannot probe which emails exist.
  const generic = {
    ok: true,
    message: "If that email is registered, a reset link has been sent.",
  };

  const user = await prisma.user.findUnique({ where: { email: normalized } });
  if (!user || !user.isActive) {
    return generic;
  }

  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt,
    },
  });

  const cmsBase = (env.cmsUrl || "http://localhost:5174").replace(/\/$/, "");
  const resetUrl = `${cmsBase}/reset-password?token=${token}`;

  const mail = await sendPasswordResetEmail({
    email: user.email,
    resetUrl,
  });

  if (!mail.sent && process.env.NODE_ENV !== "production") {
    console.info("[auth] Password reset link (dev fallback):", resetUrl);
  }

  return {
    ...generic,
    ...(process.env.NODE_ENV !== "production" && !mail.sent
      ? { devResetUrl: resetUrl }
      : {}),
  };
}

export async function resetPassword({ token, password }) {
  if (!token || !password) {
    throw httpError(400, "Token and password are required");
  }

  if (String(password).length < 8) {
    throw httpError(400, "Password must be at least 8 characters");
  }

  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!row || row.usedAt || row.expiresAt.getTime() <= Date.now()) {
    throw httpError(400, "Reset link is invalid or has expired");
  }

  if (!row.user?.isActive) {
    throw httpError(400, "Account is inactive");
  }

  const passwordHash = await bcrypt.hash(String(password), 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    }),
    prisma.refreshSession.updateMany({
      where: { userId: row.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  return { ok: true, message: "Password updated. You can sign in now." };
}

export async function refresh(refreshToken, meta = {}) {
  if (!refreshToken) {
    throw httpError(401, "Refresh token missing");
  }

  const tokenHash = hashToken(refreshToken);
  const session = await prisma.refreshSession.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!session) {
    throw httpError(401, "Invalid refresh token");
  }

  if (session.revokedAt) {
    await prisma.refreshSession.updateMany({
      where: { familyId: session.familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw httpError(401, "Refresh token reuse detected");
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    throw httpError(401, "Refresh token expired");
  }

  if (!session.user?.isActive) {
    throw httpError(401, "Account inactive");
  }

  const nextRefreshToken = createRefreshToken();
  const nextHash = hashToken(nextRefreshToken);

  await prisma.$transaction([
    prisma.refreshSession.update({
      where: { id: session.id },
      data: {
        revokedAt: new Date(),
        replacedBy: nextHash,
      },
    }),
    prisma.refreshSession.create({
      data: {
        userId: session.userId,
        tokenHash: nextHash,
        familyId: session.familyId,
        expiresAt: refreshExpiresAt(),
        userAgent: meta.userAgent || session.userAgent,
        ip: meta.ip || session.ip,
      },
    }),
  ]);

  return {
    accessToken: signAccessToken(session.user),
    refreshToken: nextRefreshToken,
    user: publicUser(session.user),
  };
}

export async function logout(refreshToken) {
  if (!refreshToken) return { ok: true };

  const tokenHash = hashToken(refreshToken);
  const session = await prisma.refreshSession.findUnique({
    where: { tokenHash },
  });

  if (session && !session.revokedAt) {
    await prisma.refreshSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });
  }

  return { ok: true };
}

export async function getMe(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isActive) {
    throw httpError(401, "Unauthorized");
  }
  return publicUser(user);
}

export async function ensureAdminUser({ email, password }) {
  const normalized = String(email).trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  if (existing) return existing;

  const passwordHash = await bcrypt.hash(password, 12);
  return prisma.user.create({
    data: {
      email: normalized,
      passwordHash,
      role: "ADMIN",
    },
  });
}
