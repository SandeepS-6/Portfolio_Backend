import prisma from "../config/prisma.js";
import { httpError } from "../middlewares/errorHandler.js";

const ALLOWED = new Set(["accepted", "rejected"]);

export async function saveCookieConsent(body, meta = {}) {
  const choice = String(body?.choice || "").toLowerCase();
  if (!ALLOWED.has(choice)) {
    throw httpError(400, "choice must be accepted or rejected");
  }

  const expiresAt = body?.expiresAt ? new Date(body.expiresAt) : null;

  return prisma.cookieConsent.create({
    data: {
      visitorId: body?.visitorId || null,
      choice,
      categories: body?.categories || {
        essential: true,
        optional: choice === "accepted",
      },
      version: Number(body?.version || 1),
      expiresAt: Number.isNaN(expiresAt?.getTime?.()) ? null : expiresAt,
      userAgent: meta.userAgent || null,
      ip: meta.ip || null,
    },
  });
}
