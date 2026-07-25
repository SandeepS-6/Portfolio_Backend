import prisma from "../config/prisma.js";
import { httpError } from "../middlewares/errorHandler.js";

export {
  listProjectsAdmin as listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from "./projectsService.js";

function pick(body, keys) {
  const data = {};
  for (const key of keys) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  return data;
}

const experienceFields = [
  "company", "role", "location", "description", "achievements",
  "startDate", "endDate", "isCurrent", "displayOrder", "isVisible",
];

export async function listExperience({ visibleOnly = false } = {}) {
  return prisma.experience.findMany({
    where: visibleOnly ? { isVisible: true } : undefined,
    orderBy: { displayOrder: "asc" },
  });
}

export async function getExperience(id) {
  const row = await prisma.experience.findUnique({ where: { id } });
  if (!row) throw httpError(404, "Experience not found");
  return row;
}

export async function createExperience(body) {
  if (!body?.company || !body?.role || !body?.startDate) {
    throw httpError(400, "company, role, and startDate are required");
  }
  return prisma.experience.create({ data: pick(body, experienceFields) });
}

export async function updateExperience(id, body) {
  await getExperience(id);
  return prisma.experience.update({ where: { id }, data: pick(body, experienceFields) });
}

export async function deleteExperience(id) {
  await getExperience(id);
  await prisma.experience.delete({ where: { id } });
  return { ok: true };
}

const educationFields = [
  "school", "degree", "field", "location", "description",
  "startDate", "endDate", "displayOrder", "isVisible",
];

export async function listEducation({ visibleOnly = false } = {}) {
  return prisma.education.findMany({
    where: visibleOnly ? { isVisible: true } : undefined,
    orderBy: { displayOrder: "asc" },
  });
}

export async function getEducation(id) {
  const row = await prisma.education.findUnique({ where: { id } });
  if (!row) throw httpError(404, "Education not found");
  return row;
}

export async function createEducation(body) {
  if (!body?.school) throw httpError(400, "school is required");
  return prisma.education.create({ data: pick(body, educationFields) });
}

export async function updateEducation(id, body) {
  await getEducation(id);
  return prisma.education.update({ where: { id }, data: pick(body, educationFields) });
}

export async function deleteEducation(id) {
  await getEducation(id);
  await prisma.education.delete({ where: { id } });
  return { ok: true };
}

const certificateFields = [
  "title", "issuer", "credentialUrl", "imageUrl",
  "issuedAt", "expiresAt", "displayOrder", "isVisible",
];

export async function listCertificates({ visibleOnly = false } = {}) {
  return prisma.certificate.findMany({
    where: visibleOnly ? { isVisible: true } : undefined,
    orderBy: { displayOrder: "asc" },
  });
}

export async function getCertificate(id) {
  const row = await prisma.certificate.findUnique({ where: { id } });
  if (!row) throw httpError(404, "Certificate not found");
  return row;
}

export async function createCertificate(body) {
  if (!body?.title) throw httpError(400, "title is required");
  return prisma.certificate.create({ data: pick(body, certificateFields) });
}

export async function updateCertificate(id, body) {
  await getCertificate(id);
  return prisma.certificate.update({ where: { id }, data: pick(body, certificateFields) });
}

export async function deleteCertificate(id) {
  await getCertificate(id);
  await prisma.certificate.delete({ where: { id } });
  return { ok: true };
}

const socialFields = ["platform", "label", "url", "icon", "displayOrder", "isVisible"];

export async function listSocialLinks({ visibleOnly = false } = {}) {
  return prisma.socialLink.findMany({
    where: visibleOnly ? { isVisible: true } : undefined,
    orderBy: { displayOrder: "asc" },
  });
}

export async function getSocialLink(id) {
  const row = await prisma.socialLink.findUnique({ where: { id } });
  if (!row) throw httpError(404, "Social link not found");
  return row;
}

export async function createSocialLink(body) {
  if (!body?.platform || !body?.url) throw httpError(400, "platform and url are required");
  return prisma.socialLink.create({ data: pick(body, socialFields) });
}

export async function updateSocialLink(id, body) {
  await getSocialLink(id);
  return prisma.socialLink.update({ where: { id }, data: pick(body, socialFields) });
}

export async function deleteSocialLink(id) {
  await getSocialLink(id);
  await prisma.socialLink.delete({ where: { id } });
  return { ok: true };
}
