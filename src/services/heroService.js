import prisma from "../config/prisma.js";
import { mapHeroToFrontend } from "../utils/mappers.js";
import { httpError } from "../middlewares/errorHandler.js";

const defaultHero = {
  firstName: "Sandeep",
  lastName: "Saliganti",
  role: "Frontend Engineer",
  quote:
    "Every great product begins with curiosity. Every interaction begins with intention.",
  dateOfBirth: "01.10.1998",
  dateLabel: "Present",
  greeting: "Hey I am Sandeep",
  headline:
    "Building **experiences** people remember. Engineering **products** teams trust.",
  bio: "Every section you discover represents a challenge I solved, a technology I mastered, or a lesson that shaped how I build for the web.",
  ctaLabel: "Know me better",
  ctaHref: "#about",
  isPublished: true,
};

export async function getHero() {
  let hero = await prisma.hero.findFirst({ orderBy: { createdAt: "asc" } });
  if (!hero) {
    hero = await prisma.hero.create({ data: defaultHero });
  }
  return mapHeroToFrontend(hero);
}

export async function updateHero(body = {}) {
  let hero = await prisma.hero.findFirst({ orderBy: { createdAt: "asc" } });

  const data = {
    firstName: body.firstName,
    lastName: body.lastName,
    role: body.role,
    quote: body.quote,
    dateOfBirth: body.dateOfBirth,
    dateLabel: body.dateLabel,
    greeting: body.greeting,
    headline: body.headline,
    bio: body.bio,
    isPublished: body.isPublished,
    ctaLabel: body.primaryCta?.label ?? body.ctaLabel,
    ctaHref: body.primaryCta?.href ?? body.ctaHref,
  };

  // Drop undefined so we don't wipe fields accidentally
  Object.keys(data).forEach((key) => {
    if (data[key] === undefined) delete data[key];
  });

  if (!hero) {
    if (!data.firstName || !data.lastName || !data.role) {
      throw httpError(400, "firstName, lastName, and role are required");
    }
    hero = await prisma.hero.create({ data: { ...defaultHero, ...data } });
  } else {
    hero = await prisma.hero.update({ where: { id: hero.id }, data });
  }

  return mapHeroToFrontend(hero);
}
