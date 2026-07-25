import prisma from "../config/prisma.js";
import { sendContactNotification } from "../config/mailer.js";
import { mapFooterToFrontend } from "../utils/mappers.js";
import { httpError } from "../middlewares/errorHandler.js";

const defaultContact = {
  email: "hello@example.com",
  location: "Bengaluru",
  availability: "Open to work",
  eyebrow: "Have a project in mind?",
  ctaLabel: "Let's talk",
  ctaHref: "/lets-talk",
  backgroundWords: ["LIMITLESS", "POTENTIAL"],
  backToTopLabel: "Back to top",
  credits: "by Sandeep Saliganti",
  developerName: "Sandeep Saliganti",
  description:
    "Frontend engineer building clear, fast interfaces with lasting foundations.",
  copyright: "All rights reserved",
};

const contactFields = [
  "email",
  "phone",
  "location",
  "availability",
  "eyebrow",
  "ctaLabel",
  "ctaHref",
  "backgroundWords",
  "backToTopLabel",
  "credits",
  "developerName",
  "description",
  "copyright",
  "resumeUrl",
  "logoUrl",
];

async function ensureContactInfo() {
  let row = await prisma.contactInfo.findFirst({ orderBy: { createdAt: "asc" } });
  if (!row) {
    row = await prisma.contactInfo.create({ data: defaultContact });
  }
  return row;
}

export async function getContactInfo() {
  return ensureContactInfo();
}

export async function updateContactInfo(body = {}) {
  const data = {};
  for (const key of contactFields) {
    if (body[key] !== undefined) data[key] = body[key];
  }

  // CMS may send comma-separated words in a string
  if (typeof data.backgroundWords === "string") {
    data.backgroundWords = data.backgroundWords
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // Accept nested cta from frontend-shaped payloads
  if (body.cta?.label !== undefined) data.ctaLabel = body.cta.label;
  if (body.cta?.href !== undefined) data.ctaHref = body.cta.href;

  let row = await prisma.contactInfo.findFirst({ orderBy: { createdAt: "asc" } });
  if (!row) {
    row = await prisma.contactInfo.create({ data: { ...defaultContact, ...data } });
  } else {
    row = await prisma.contactInfo.update({ where: { id: row.id }, data });
  }
  return row;
}

/** Public portfolio footer — contact ending + visible social links */
export async function getFooter() {
  const contact = await ensureContactInfo();
  const socialLinks = await prisma.socialLink.findMany({
    where: { isVisible: true },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  });
  return mapFooterToFrontend(contact, socialLinks);
}

/** Admin update for footer copy (socials stay on /api/social-links) */
export async function updateFooter(body = {}) {
  await updateContactInfo(body);
  return getFooter();
}

const settingsFields = [
  "siteTitle",
  "siteDescription",
  "logoText",
  "primaryColor",
  "seoKeywords",
  "maintenanceMode",
];

export async function getSiteSettings() {
  let row = await prisma.siteSettings.findFirst({ orderBy: { createdAt: "asc" } });
  if (!row) {
    row = await prisma.siteSettings.create({
      data: {
        siteTitle: "Sandeep Saliganti",
        siteDescription: "Frontend Engineer portfolio",
        logoText: "S.",
        primaryColor: "#f17a32",
      },
    });
  }
  return row;
}

export async function updateSiteSettings(body = {}) {
  const data = {};
  for (const key of settingsFields) {
    if (body[key] !== undefined) data[key] = body[key];
  }

  let row = await prisma.siteSettings.findFirst({ orderBy: { createdAt: "asc" } });
  if (!row) {
    row = await prisma.siteSettings.create({ data });
  } else {
    row = await prisma.siteSettings.update({ where: { id: row.id }, data });
  }
  return row;
}

export async function listMessages() {
  return prisma.message.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getMessage(id) {
  const row = await prisma.message.findUnique({ where: { id } });
  if (!row) throw httpError(404, "Message not found");
  return row;
}

export async function createMessage(body = {}) {
  if (!body.name || !body.email || !body.body) {
    throw httpError(400, "name, email, and body are required");
  }

  const message = await prisma.message.create({
    data: {
      name: body.name,
      email: body.email,
      subject: body.subject || null,
      body: body.body,
    },
  });

  const mailResult = await sendContactNotification(message);

  return { message, email: mailResult };
}

export async function markMessageRead(id, isRead = true) {
  await getMessage(id);
  return prisma.message.update({ where: { id }, data: { isRead } });
}

export async function deleteMessage(id) {
  await getMessage(id);
  await prisma.message.delete({ where: { id } });
  return { ok: true };
}
