import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    env.jwtAccessSecret,
    { expiresIn: env.accessTokenTtl },
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret);
}

export function createRefreshToken() {
  return crypto.randomBytes(48).toString("hex");
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function refreshExpiresAt() {
  const match = /^(\d+)([smhd])$/.exec(env.refreshTokenTtl);
  const amount = match ? Number(match[1]) : 7;
  const unit = match ? match[2] : "d";
  const multipliers = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return new Date(Date.now() + amount * (multipliers[unit] || multipliers.d));
}
