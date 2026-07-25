import { verifyAccessToken } from "../utils/tokens.js";
import prisma from "../config/prisma.js";

/*
  Soft auth: attaches req.user when a valid Bearer token is present.
  Never fails the request — used for public GETs that reveal more to admins.
*/

export async function optionalAuthenticate(req, _res, next) {
  try {
    const header = req.get("authorization") || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) return next();

    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (user?.isActive) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    }
  } catch {
    // ignore invalid tokens for public reads
  }
  return next();
}
