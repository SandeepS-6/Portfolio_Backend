import { httpError } from "./errorHandler.js";
import { verifyAccessToken } from "../utils/tokens.js";
import prisma from "../config/prisma.js";

export async function authenticate(req, _res, next) {
  try {
    const header = req.get("authorization") || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw httpError(401, "Authentication required");
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw httpError(401, "Invalid or expired access token");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      throw httpError(401, "Unauthorized");
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    next(err);
  }
}

export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(httpError(401, "Authentication required"));
    }
    if (roles.length && !roles.includes(req.user.role)) {
      return next(httpError(403, "Forbidden"));
    }
    return next();
  };
}

export function requireAdmin(req, res, next) {
  return authorize("ADMIN")(req, res, next);
}
