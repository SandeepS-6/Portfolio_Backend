import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as auth from "../controllers/authController.js";
import { authenticate, requireAdmin } from "../middlewares/authenticate.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many auth attempts. Try again later." },
});

router.post("/login", authLimiter, auth.login);
router.post("/forgot-password", authLimiter, auth.forgotPassword);
router.post("/reset-password", authLimiter, auth.resetPassword);
router.post("/refresh", authLimiter, auth.refresh);
router.post("/logout", auth.logout);
router.get("/me", authenticate, requireAdmin, auth.me);

router.get("/oauth/providers", auth.oauthProviders);
router.get("/oauth/google", authLimiter, auth.oauthGoogleStart);
router.get("/oauth/google/callback", authLimiter, auth.oauthGoogleCallback);
router.get("/oauth/github", authLimiter, auth.oauthGithubStart);
router.get("/oauth/github/callback", authLimiter, auth.oauthGithubCallback);

export default router;
