import prisma from "../config/prisma.js";
import { httpError } from "../middlewares/errorHandler.js";
import {
  mapCommentToFrontend,
  mapProjectFromBody,
  mapProjectToCard,
  mapProjectToFrontend,
} from "../utils/mappers.js";

const defaultSection = {
  squircle: { enabled: true, radius: "1.35rem" },
  labels: {
    tech: "Tech stack",
    features: "Key features",
    role: "Role",
    duration: "Duration",
    github: "GitHub",
    live: "Live demo",
    caseStudy: "Case study",
    docs: "Docs",
    details: "View project",
    share: "Share",
    featured: "Featured",
    search: "Search projects",
    searchPlaceholder: "Search by name, stack, or category…",
    searchRecent: "Recent searches",
    searchSuggestions: "Suggestions",
    searchEmpty: "No matches — try another keyword.",
    searchClear: "Clear search",
    sort: "Sort projects",
    sortLatest: "Latest",
    sortName: "Name",
    sortFeatured: "Featured",
    projectDetailJump: "Open project detail",
    statusFilter: "Filter by status",
    statusAll: "All",
    statusLive: "Live demos",
    statusBuilding: "In progress",
    kindAll: "All Projects",
    empty: "No projects match these filters.",
    emptyHint: "Clear search or pick another filter.",
    gallery: "Gallery",
    lightbox: "Open lightbox",
    related: "Related projects",
    prevProject: "Previous project",
    nextProject: "Next project",
    timeline: "Build timeline",
    info: "Project info",
    back: "Back to projects",
    hiddenTitle: "Experimental Lab",
    hiddenLead:
      "You found the R&D vault — prototypes still forming behind the product floor.",
    labClearance: "Clearance granted",
    labClose: "Close laboratory",
    labEta: "Est. completion",
  },
  intro: {
    highlightColor: "#f17a32",
    underlineColor: "#87CEFA",
    quote: null,
    attribution: "",
  },
  bottom: { grid: [] },
  kinds: [
    { id: "all", label: "All Projects" },
    { id: "featured", label: "Featured" },
    { id: "production", label: "Production" },
    { id: "opensource", label: "Open Source" },
    { id: "experiments", label: "Experiments" },
    { id: "concepts", label: "Concepts" },
    { id: "research", label: "Research" },
    { id: "archived", label: "Archived" },
  ],
  hiddenProjects: [],
};

async function ensureSection() {
  let section = await prisma.projectsSection.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (!section) {
    section = await prisma.projectsSection.create({
      data: {
        squircle: defaultSection.squircle,
        labels: defaultSection.labels,
        intro: defaultSection.intro,
        bottom: defaultSection.bottom,
        kinds: defaultSection.kinds,
        hiddenProjects: defaultSection.hiddenProjects,
      },
    });
  }
  return section;
}

function withVisibleComments() {
  return {
    where: { isVisible: true, parentId: null },
    orderBy: { createdAt: "desc" },
    include: {
      replies: {
        where: { isVisible: true },
        orderBy: { createdAt: "asc" },
      },
    },
  };
}

const CARD_SELECT = {
  id: true,
  title: true,
  slug: true,
  summary: true,
  description: true,
  coverImage: true,
  coverAlt: true,
  gallery: true,
  techStack: true,
  techDetails: true,
  features: true,
  category: true,
  kinds: true,
  role: true,
  duration: true,
  fromLabel: true,
  toLabel: true,
  progress: true,
  sortDate: true,
  repoUrl: true,
  liveUrl: true,
  caseStudyUrl: true,
  docsUrl: true,
  isFeatured: true,
  projectStatus: true,
  isVisible: true,
  displayOrder: true,
  relatedSlugs: true,
};

export async function getSectionPayload({ visibleOnly = true } = {}) {
  const [section, projects] = await Promise.all([
    ensureSection(),
    prisma.project.findMany({
      where: visibleOnly ? { isVisible: true } : undefined,
      orderBy: { displayOrder: "asc" },
      select: CARD_SELECT,
    }),
  ]);

  return {
    squircle: section.squircle || defaultSection.squircle,
    labels: section.labels || defaultSection.labels,
    intro: section.intro || defaultSection.intro,
    bottom: section.bottom || defaultSection.bottom,
    kinds: section.kinds || defaultSection.kinds,
    hiddenProjects: section.hiddenProjects || defaultSection.hiddenProjects,
    projects: projects.map((row) => mapProjectToCard(row)),
  };
}

export async function getSectionSettings() {
  const section = await ensureSection();
  return {
    id: section.id,
    squircle: section.squircle,
    labels: section.labels,
    intro: section.intro,
    bottom: section.bottom,
    kinds: section.kinds,
    hiddenProjects: section.hiddenProjects,
  };
}

export async function updateSectionSettings(body = {}) {
  const section = await ensureSection();
  const data = {};
  for (const key of [
    "squircle",
    "labels",
    "intro",
    "bottom",
    "kinds",
    "hiddenProjects",
  ]) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  const updated = await prisma.projectsSection.update({
    where: { id: section.id },
    data,
  });
  return {
    id: updated.id,
    squircle: updated.squircle,
    labels: updated.labels,
    intro: updated.intro,
    bottom: updated.bottom,
    kinds: updated.kinds,
    hiddenProjects: updated.hiddenProjects,
  };
}

export async function listProjectsAdmin({ visibleOnly = false } = {}) {
  return prisma.project.findMany({
    where: visibleOnly ? { isVisible: true } : undefined,
    orderBy: { displayOrder: "asc" },
  });
}

async function findProjectRow(idOrSlug) {
  const row = await prisma.project.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    include: { comments: withVisibleComments() },
  });
  if (!row) throw httpError(404, "Project not found");
  return row;
}

export async function getProject(idOrSlug, { map = true } = {}) {
  const row = await findProjectRow(idOrSlug);
  return map ? mapProjectToFrontend(row) : row;
}

/** Public detail page: full project + lean neighbors / related / switcher. */
export async function getProjectDetailPayload(idOrSlug) {
  const [section, cards, full] = await Promise.all([
    ensureSection(),
    prisma.project.findMany({
      where: { isVisible: true },
      orderBy: { displayOrder: "asc" },
      select: CARD_SELECT,
    }),
    findProjectRow(idOrSlug),
  ]);

  if (!full.isVisible) throw httpError(404, "Project not found");

  const mappedCards = cards.map((row) => mapProjectToCard(row));
  const index = mappedCards.findIndex(
    (card) => card.id === full.slug || card.dbId === full.id,
  );
  if (index < 0) throw httpError(404, "Project not found");

  const project = mapProjectToFrontend(full);
  const len = mappedCards.length;
  const prev = mappedCards[(index - 1 + len) % len];
  const next = mappedCards[(index + 1) % len];
  const byId = Object.fromEntries(mappedCards.map((card) => [card.id, card]));
  const related = (project.relatedIds || [])
    .map((relatedId) => byId[relatedId])
    .filter(Boolean);

  return {
    project,
    prev,
    next,
    related,
    projects: mappedCards.map((card) => ({
      id: card.id,
      name: card.name,
      category: card.category,
      image: card.image,
    })),
    labels: section.labels || defaultSection.labels,
    kinds: section.kinds || defaultSection.kinds,
    squircle: section.squircle || defaultSection.squircle,
  };
}

export async function createProject(body) {
  const data = mapProjectFromBody(body);
  if (!data.title || !data.slug) {
    throw httpError(400, "title and slug are required");
  }
  const row = await prisma.project.create({ data });
  return row;
}

export async function updateProject(idOrSlug, body) {
  const existing = await findProjectRow(idOrSlug);
  const data = mapProjectFromBody(body);
  return prisma.project.update({
    where: { id: existing.id },
    data,
  });
}

export async function deleteProject(idOrSlug) {
  const existing = await findProjectRow(idOrSlug);
  await prisma.project.delete({ where: { id: existing.id } });
  return { ok: true };
}

export async function likeProject(idOrSlug, { undo = false } = {}) {
  const existing = await findProjectRow(idOrSlug);
  const next = Math.max(0, (existing.likesCount || 0) + (undo ? -1 : 1));
  const row = await prisma.project.update({
    where: { id: existing.id },
    data: { likesCount: next },
  });
  return { id: row.slug, likes: row.likesCount };
}

export async function bumpProjectView(idOrSlug) {
  const existing = await findProjectRow(idOrSlug);
  const row = await prisma.project.update({
    where: { id: existing.id },
    data: { views: { increment: 1 } },
  });
  return { id: row.slug, views: row.views };
}

export async function addComment(idOrSlug, body = {}) {
  const text = String(body.body || "").trim();
  const name = String(body.name || "Guest").trim() || "Guest";
  if (!text) throw httpError(400, "Comment body is required");

  const project = await findProjectRow(idOrSlug);
  let parentId = body.parentId || null;
  if (parentId) {
    const parent = await prisma.projectComment.findFirst({
      where: { id: parentId, projectId: project.id },
    });
    if (!parent) throw httpError(400, "Parent comment not found");
  }

  const row = await prisma.projectComment.create({
    data: {
      projectId: project.id,
      parentId,
      name,
      avatar: body.avatar || undefined,
      body: text,
    },
    include: {
      replies: {
        where: { isVisible: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return mapCommentToFrontend(row);
}
