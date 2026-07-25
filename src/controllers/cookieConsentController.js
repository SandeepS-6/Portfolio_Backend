import { asyncHandler } from "../utils/asyncHandler.js";
import * as cookieConsentService from "../services/cookieConsentService.js";

export const postCookieConsent = asyncHandler(async (req, res) => {
  const record = await cookieConsentService.saveCookieConsent(req.body, {
    userAgent: req.get("user-agent") || null,
    ip: req.ip || req.socket?.remoteAddress || null,
  });

  res.status(201).json({
    id: record.id,
    choice: record.choice,
    categories: record.categories,
    version: record.version,
  });
});
