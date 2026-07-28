import prisma from "../config/prisma.js";
import { httpError } from "../middlewares/errorHandler.js";
import { skillsSectionSeed } from "../../prisma/seedSkillsSection.js";

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asObject(value, fallback = {}) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : fallback;
}

function mapSection(row) {
  return {
    eyebrow: row.eyebrow || "",
    headline: row.headline || "",
    lead: row.lead || "",
    stats: asArray(row.stats),
    categories: asArray(row.categories),
    expertise: asObject(row.expertise, skillsSectionSeed.expertise),
    favourites: asObject(row.favourites, skillsSectionSeed.favourites),
    learning: asObject(row.learning, skillsSectionSeed.learning),
    marquee: asObject(row.marquee, skillsSectionSeed.marquee),
    summary: asObject(row.summary, skillsSectionSeed.summary),
  };
}

async function ensureSection() {
  let row = await prisma.skillsSection.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (!row) {
    row = await prisma.skillsSection.create({ data: skillsSectionSeed });
  }
  return row;
}

export async function getSkillsSection() {
  const row = await ensureSection();
  return mapSection(row);
}

export async function updateSkillsSection(body = {}) {
  const row = await ensureSection();
  const data = {};

  if (body.eyebrow !== undefined) data.eyebrow = body.eyebrow;
  if (body.headline !== undefined) data.headline = body.headline;
  if (body.lead !== undefined) data.lead = body.lead;
  if (body.isPublished !== undefined) data.isPublished = Boolean(body.isPublished);

  for (const key of [
    "stats",
    "categories",
    "expertise",
    "favourites",
    "learning",
    "marquee",
    "summary",
  ]) {
    if (body[key] === undefined) continue;
    if (key === "stats" || key === "categories") {
      if (!Array.isArray(body[key])) {
        throw httpError(400, `${key} must be an array`);
      }
      data[key] = body[key];
      continue;
    }
    if (!body[key] || typeof body[key] !== "object" || Array.isArray(body[key])) {
      throw httpError(400, `${key} must be an object`);
    }
    data[key] = body[key];
  }

  const updated = await prisma.skillsSection.update({
    where: { id: row.id },
    data,
  });

  return mapSection(updated);
}
