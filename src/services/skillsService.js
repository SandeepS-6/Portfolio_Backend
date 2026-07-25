import prisma from "../config/prisma.js";
import { mapSkillFromBody, mapSkillToFrontend } from "../utils/mappers.js";
import { httpError } from "../middlewares/errorHandler.js";

export async function listSkills({ visibleOnly = false } = {}) {
  const skills = await prisma.skill.findMany({
    where: visibleOnly ? { isVisible: true } : undefined,
    orderBy: { displayOrder: "asc" },
  });
  return skills.map(mapSkillToFrontend);
}

export async function getSkillById(id) {
  const skill = await prisma.skill.findUnique({ where: { id } });
  if (!skill) throw httpError(404, "Skill not found");
  return mapSkillToFrontend(skill);
}

export async function createSkill(body) {
  if (!body?.title) throw httpError(400, "title is required");
  const skill = await prisma.skill.create({ data: mapSkillFromBody(body) });
  return mapSkillToFrontend(skill);
}

export async function updateSkill(id, body) {
  await getSkillById(id);
  const skill = await prisma.skill.update({
    where: { id },
    data: mapSkillFromBody(body),
  });
  return mapSkillToFrontend(skill);
}

export async function deleteSkill(id) {
  await getSkillById(id);
  await prisma.skill.delete({ where: { id } });
  return { ok: true };
}
