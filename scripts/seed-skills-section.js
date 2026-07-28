import { PrismaClient } from "@prisma/client";
import { skillsSectionSeed } from "../prisma/seedSkillsSection.js";

const prisma = new PrismaClient();

await prisma.skillsSection.deleteMany();
await prisma.skillsSection.create({ data: skillsSectionSeed });
const row = await prisma.skillsSection.findFirst();
console.log(
  "Skills section seeded:",
  row?.headline,
  Array.isArray(row?.categories) ? `${row.categories.length} categories` : "no categories",
);
await prisma.$disconnect();
