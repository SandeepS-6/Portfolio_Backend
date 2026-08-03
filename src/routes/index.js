import { Router } from "express";
import * as c from "../controllers/portfolioController.js";
import * as cookieConsent from "../controllers/cookieConsentController.js";
import * as upload from "../controllers/uploadController.js";
import authRoutes from "./authRoutes.js";
import { authenticate, requireAdmin } from "../middlewares/authenticate.js";
import { optionalAuthenticate } from "../middlewares/optionalAuthenticate.js";

const router = Router();
const admin = [authenticate, requireAdmin];

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.post("/cookie-consent", cookieConsent.postCookieConsent);

// Public portfolio reads (visibility enforced in controllers for anonymous)
router.get("/hero", c.getHero);
router.get("/about", c.getAbout);
router.get("/what-i-do", c.getWhatIDo);
router.get("/skills-section", c.getSkillsSection);
router.get("/skills", optionalAuthenticate, c.getSkills);
router.get("/skills/:id", c.getSkill);
router.get("/projects", optionalAuthenticate, c.getProjects);
router.get("/projects-section", c.getProjectsSection);
router.get("/projects/:id", optionalAuthenticate, c.getProject);
router.post("/projects/:id/likes", c.postProjectLike);
router.post("/projects/:id/views", c.postProjectView);
router.post("/projects/:id/comments", c.postProjectComment);
router.get("/experience", optionalAuthenticate, c.getExperienceList);
router.get("/experience/:id", c.getExperienceOne);
router.get("/education", optionalAuthenticate, c.getEducationList);
router.get("/education/:id", c.getEducationOne);
router.get("/certificates", optionalAuthenticate, c.getCertificates);
router.get("/certificates/:id", c.getCertificate);
router.get("/social-links", optionalAuthenticate, c.getSocialLinks);
router.get("/social-links/:id", c.getSocialLink);
router.get("/contact-info", c.getContactInfo);
router.get("/footer", c.getFooter);
router.get("/settings", c.getSettings);
router.get("/meeting", c.getMeetingSettings);
router.get("/meeting/slots", c.getMeetingSlots);

// Public contact form + meeting booking
router.post("/messages", c.postMessage);
router.post("/meeting/bookings", c.postMeetingBooking);

// Protected CMS mutations + private message inbox
router.post("/uploads", ...admin, upload.uploadMiddleware, upload.postUpload);
router.put("/hero", ...admin, c.putHero);
router.put("/about", ...admin, c.putAbout);
router.put("/what-i-do", ...admin, c.putWhatIDo);
router.put("/skills-section", ...admin, c.putSkillsSection);

router.post("/skills", ...admin, c.postSkill);
router.put("/skills/:id", ...admin, c.putSkill);
router.delete("/skills/:id", ...admin, c.deleteSkill);

router.post("/projects", ...admin, c.postProject);
router.put("/projects/:id", ...admin, c.putProject);
router.delete("/projects/:id", ...admin, c.deleteProject);
router.put("/projects-section", ...admin, c.putProjectsSection);

router.post("/experience", ...admin, c.postExperience);
router.put("/experience/:id", ...admin, c.putExperience);
router.delete("/experience/:id", ...admin, c.deleteExperience);

router.post("/education", ...admin, c.postEducation);
router.put("/education/:id", ...admin, c.putEducation);
router.delete("/education/:id", ...admin, c.deleteEducation);

router.post("/certificates", ...admin, c.postCertificate);
router.put("/certificates/:id", ...admin, c.putCertificate);
router.delete("/certificates/:id", ...admin, c.deleteCertificate);

router.post("/social-links", ...admin, c.postSocialLink);
router.put("/social-links/:id", ...admin, c.putSocialLink);
router.delete("/social-links/:id", ...admin, c.deleteSocialLink);

router.put("/contact-info", ...admin, c.putContactInfo);
router.put("/footer", ...admin, c.putFooter);
router.put("/settings", ...admin, c.putSettings);
router.put("/meeting", ...admin, c.putMeetingSettings);

router.get("/messages", ...admin, c.getMessages);
router.get("/messages/:id", ...admin, c.getMessage);
router.patch("/messages/:id", ...admin, c.patchMessage);
router.delete("/messages/:id", ...admin, c.deleteMessage);

router.get("/meeting/bookings", ...admin, c.getMeetingBookings);
router.get("/meeting/analytics", ...admin, c.getMeetingAnalytics);
router.patch("/meeting/bookings/:id", ...admin, c.patchMeetingBooking);
router.delete("/meeting/bookings/:id", ...admin, c.deleteMeetingBooking);

export default router;
