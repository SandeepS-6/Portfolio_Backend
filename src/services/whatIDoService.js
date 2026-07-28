import prisma from "../config/prisma.js";
import { httpError } from "../middlewares/errorHandler.js";
import { whatIDoSeed } from "../../prisma/seedWhatIDo.js";

function mapItem(item, index = 0) {
  if (!item || typeof item !== "object") return null;
  const id = String(item.id || item.slug || `item-${index + 1}`);
  return {
    id,
    phase: item.phase || "WORK",
    title: item.title || "",
    detail: item.detail || "",
    icon: item.icon || "layout",
    span: item.span === 2 ? 2 : 1,
    accentPeriod: Boolean(item.accentPeriod),
    accentDot: Boolean(item.accentDot),
  };
}

function mapSection(row) {
  const rawItems = Array.isArray(row.items) ? row.items : [];
  return {
    title: row.title || "",
    lead: row.lead || "",
    cinemaTitle: row.cinemaTitle || "WHAT I DO",
    marqueeText: row.marqueeText || row.cinemaTitle || "WHAT I DO",
    items: rawItems.map(mapItem).filter(Boolean),
  };
}

async function ensureSection() {
  let row = await prisma.whatIDoSection.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (!row) {
    row = await prisma.whatIDoSection.create({ data: whatIDoSeed });
  }
  return row;
}

export async function getWhatIDo() {
  const row = await ensureSection();
  return mapSection(row);
}

export async function updateWhatIDo(body = {}) {
  const row = await ensureSection();

  const data = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.lead !== undefined) data.lead = body.lead;
  if (body.cinemaTitle !== undefined) data.cinemaTitle = body.cinemaTitle;
  if (body.marqueeText !== undefined) data.marqueeText = body.marqueeText;
  if (body.isPublished !== undefined) data.isPublished = Boolean(body.isPublished);

  if (body.items !== undefined) {
    if (!Array.isArray(body.items)) {
      throw httpError(400, "items must be an array");
    }
    data.items = body.items.map(mapItem).filter(Boolean);
  }

  const updated = await prisma.whatIDoSection.update({
    where: { id: row.id },
    data,
  });

  return mapSection(updated);
}
