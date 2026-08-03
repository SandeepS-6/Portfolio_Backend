import prisma from "../config/prisma.js";
import { httpError } from "../middlewares/errorHandler.js";

// Empty shell only — fill content through the CMS.
const emptyAbout = {
  eyebrow: "",
  hello: "",
  greeting: "",
  name: "",
  title: "",
  location: "",
  phone: "",
  phoneHref: "",
  status: "",
  availability: "",
  experienceYears: "",
  design: "",
  resumeLabel: "",
  resumeHref: "",
  resumeFileName: "",
  photoSrc: "",
  photoAlt: "",
  story: [],
  socials: [],
  interests: [],
  education: [],
  experience: [],
  isPublished: true,
};

const SCALAR_KEYS = [
  "eyebrow",
  "hello",
  "greeting",
  "name",
  "title",
  "location",
  "phone",
  "phoneHref",
  "status",
  "availability",
  "experienceYears",
  "design",
  "resumeLabel",
  "resumeHref",
  "resumeFileName",
];

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function mapSocial(item, index = 0) {
  if (!item || typeof item !== "object") return null;
  const id = String(item.id || item.type || `social-${index + 1}`);
  return {
    id,
    label: item.label || "",
    href: item.href || item.url || "#",
    type: item.type || item.platform || id,
  };
}

function mapEducation(item, index = 0) {
  if (!item || typeof item !== "object") return null;
  return {
    id: String(item.id || `edu-${index + 1}`),
    institution: item.institution || item.school || "",
    degree: item.degree || "",
    period: item.period || "",
    grade: item.grade || "",
  };
}

function mapExperience(item, index = 0) {
  if (!item || typeof item !== "object") return null;
  const tech = Array.isArray(item.tech)
    ? item.tech.map(String).filter(Boolean)
    : [];
  return {
    id: String(item.id || `exp-${index + 1}`),
    company: item.company || "",
    role: item.role || "",
    period: item.period || "",
    summary: item.summary || item.description || "",
    tech,
    logoText: item.logoText || "",
  };
}

function mapAbout(row) {
  const story = asArray(row.story).map(String).filter(Boolean);
  const interests = asArray(row.interests).map(String).filter(Boolean);

  return {
    eyebrow: row.eyebrow || "",
    hello: row.hello || "",
    greeting: row.greeting || "",
    name: row.name || "",
    title: row.title || "",
    location: row.location || "",
    phone: row.phone || "",
    phoneHref: row.phoneHref || "",
    status: row.status || "",
    availability: row.availability || "",
    experienceYears: row.experienceYears || "",
    design: row.design || "",
    resumeLabel: row.resumeLabel || "",
    resumeHref: row.resumeHref || "",
    resumeFileName: row.resumeFileName || "",
    photo: {
      src: row.photoSrc || "",
      alt: row.photoAlt || row.name || "",
    },
    story,
    socials: asArray(row.socials).map(mapSocial).filter(Boolean),
    interests,
    education: asArray(row.education).map(mapEducation).filter(Boolean),
    experience: asArray(row.experience).map(mapExperience).filter(Boolean),
  };
}

async function ensureAbout() {
  let row = await prisma.about.findFirst({ orderBy: { createdAt: "asc" } });
  if (!row) {
    row = await prisma.about.create({ data: emptyAbout });
  }
  return row;
}

export async function getAbout() {
  const row = await ensureAbout();
  return mapAbout(row);
}

export async function updateAbout(body = {}) {
  const row = await ensureAbout();
  const data = {};

  for (const key of SCALAR_KEYS) {
    if (body[key] !== undefined) data[key] = body[key];
  }

  if (body.isPublished !== undefined) {
    data.isPublished = Boolean(body.isPublished);
  }

  if (body.photo !== undefined) {
    if (!body.photo || typeof body.photo !== "object" || Array.isArray(body.photo)) {
      throw httpError(400, "photo must be an object with src and alt");
    }
    if (body.photo.src !== undefined) data.photoSrc = body.photo.src;
    if (body.photo.alt !== undefined) data.photoAlt = body.photo.alt;
  }
  if (body.photoSrc !== undefined) data.photoSrc = body.photoSrc;
  if (body.photoAlt !== undefined) data.photoAlt = body.photoAlt;

  if (body.story !== undefined) {
    if (!Array.isArray(body.story)) throw httpError(400, "story must be an array");
    data.story = body.story.map(String);
  }

  if (body.interests !== undefined) {
    if (!Array.isArray(body.interests)) {
      throw httpError(400, "interests must be an array");
    }
    data.interests = body.interests.map(String);
  }

  if (body.socials !== undefined) {
    if (!Array.isArray(body.socials)) {
      throw httpError(400, "socials must be an array");
    }
    data.socials = body.socials.map(mapSocial).filter(Boolean);
  }

  if (body.education !== undefined) {
    if (!Array.isArray(body.education)) {
      throw httpError(400, "education must be an array");
    }
    data.education = body.education.map(mapEducation).filter(Boolean);
  }

  if (body.experience !== undefined) {
    if (!Array.isArray(body.experience)) {
      throw httpError(400, "experience must be an array");
    }
    data.experience = body.experience.map(mapExperience).filter(Boolean);
  }

  const updated = await prisma.about.update({
    where: { id: row.id },
    data,
  });

  return mapAbout(updated);
}
