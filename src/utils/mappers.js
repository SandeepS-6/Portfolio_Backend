/** Map DB Skill → shape the public frontend already expects. */
export function mapSkillToFrontend(skill) {
  return {
    id: skill.id,
    title: skill.title,
    icon: skill.icon,
    color: skill.color,
    category: skill.category,
    description: skill.description,
    displayOrder: skill.displayOrder,
    isVisible: skill.isVisible,
    initialPosition: {
      x: skill.positionX,
      y: skill.positionY,
    },
    scale: skill.scale,
    blur: skill.blur,
    opacity: skill.opacity,
    zIndex: skill.zIndex,
    speed: skill.speed,
    direction: skill.direction,
    driftStrength: skill.driftStrength,
    rotationSpeed: skill.rotationSpeed,
    animationSpeed: skill.animationSpeed,
    repulsionStrength: skill.repulsionStrength,
    collisionRadius: skill.collisionRadius,
  };
}

/** Map CMS/API body → Prisma Skill create/update data. */
export function mapSkillFromBody(body = {}) {
  const data = {};

  const fields = [
    "title",
    "icon",
    "color",
    "category",
    "description",
    "displayOrder",
    "isVisible",
    "scale",
    "blur",
    "opacity",
    "zIndex",
    "speed",
    "direction",
    "driftStrength",
    "rotationSpeed",
    "animationSpeed",
    "repulsionStrength",
    "collisionRadius",
  ];

  for (const key of fields) {
    if (body[key] !== undefined) data[key] = body[key];
  }

  if (body.initialPosition) {
    if (body.initialPosition.x !== undefined) data.positionX = body.initialPosition.x;
    if (body.initialPosition.y !== undefined) data.positionY = body.initialPosition.y;
  }
  if (body.positionX !== undefined) data.positionX = body.positionX;
  if (body.positionY !== undefined) data.positionY = body.positionY;

  return data;
}

export function mapHeroToFrontend(hero) {
  if (!hero) return null;

  return {
    firstName: hero.firstName,
    lastName: hero.lastName,
    role: hero.role,
    quote: hero.quote,
    dateOfBirth: hero.dateOfBirth,
    dateLabel: hero.dateLabel,
    greeting: hero.greeting,
    headline: hero.headline,
    bio: hero.bio,
    primaryCta: {
      label: hero.ctaLabel || "View My Work",
      href: hero.ctaHref || "#projects",
    },
  };
}

/** Map nested gallery / showcase image refs to { src, alt }. */
function asImage(value, fallbackAlt = "") {
  if (!value) return null;
  if (typeof value === "string") return { src: value, alt: fallbackAlt };
  if (value.src) return { src: value.src, alt: value.alt || fallbackAlt };
  return null;
}

function mapComment(row) {
  return {
    id: row.id,
    name: row.name,
    avatar: row.avatar || initialsFromName(row.name),
    date: formatCommentDate(row.createdAt),
    body: row.body,
    likes: row.likes ?? 0,
    replies: (row.replies || []).map(mapComment),
  };
}

function initialsFromName(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "?";
}

function formatCommentDate(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** DB Project (+ optional comments) → shape the Projects UI already expects. */
export function mapProjectToFrontend(project, { comments } = {}) {
  if (!project) return null;

  const name = project.title;
  const image =
    asImage(project.coverImage, project.coverAlt || name) ||
    asImage({ src: project.coverImage, alt: project.coverAlt }, name);

  const galleryRaw = Array.isArray(project.gallery) ? project.gallery : [];
  const gallery = galleryRaw
    .map((item, index) => asImage(item, `${name} gallery ${index + 1}`))
    .filter(Boolean);

  if (image && gallery.length === 0) gallery.push(image);

  const showcaseRaw = project.showcase && typeof project.showcase === "object"
    ? project.showcase
    : null;
  const showcase = showcaseRaw
    ? {
        desktop: asImage(showcaseRaw.desktop, `${name} desktop`) || image,
        tablet: asImage(showcaseRaw.tablet, `${name} tablet`) || image,
        mobile: asImage(showcaseRaw.mobile, `${name} mobile`) || image,
      }
    : image
      ? { desktop: image, tablet: image, mobile: image }
      : null;

  const commentRows = comments ?? project.comments ?? [];

  return {
    id: project.slug,
    dbId: project.id,
    name,
    description: project.description || project.summary || "",
    shortDescription: project.summary || project.description || "",
    image,
    techStack: project.techStack || [],
    features: project.features || [],
    category: project.category || "",
    kinds: project.kinds || [],
    role: project.role || "",
    duration: project.duration || "",
    from: project.fromLabel || "",
    to: project.toLabel || "",
    progress: project.progress ?? null,
    sortDate: project.sortDate || "",
    githubUrl: project.repoUrl || "",
    liveUrl: project.liveUrl || "",
    caseStudyUrl: project.caseStudyUrl || "",
    docsUrl: project.docsUrl || "",
    featured: Boolean(project.isFeatured),
    projectStatus: project.projectStatus || "Shipped",
    platform: project.platform || "Web",
    clientType: project.clientType || "Personal",
    gallery,
    showcase,
    timeline: project.timeline || [],
    techDetails: project.techDetails || [],
    caseStudy: project.caseStudy || {},
    metrics: project.metrics || [],
    relatedIds: project.relatedSlugs || [],
    meta: {
      views: project.views ?? 0,
      likes: project.likesCount ?? 0,
      bookmarks: project.bookmarksCount ?? 0,
      readingTime: project.readingTime || "",
      published: project.publishedLabel || "",
      updated: project.updatedLabel || "",
    },
    seo: {
      title: project.seoTitle || name,
      description: project.seoDescription || project.summary || "",
    },
    comments: commentRows
      .filter((row) => !row.parentId && row.isVisible !== false)
      .map(mapComment),
    isVisible: project.isVisible,
    displayOrder: project.displayOrder,
  };
}

/** Accept frontend or CMS body shapes → Prisma Project write data. */
export function mapProjectFromBody(body = {}) {
  const data = {};

  const fields = [
    "title",
    "slug",
    "summary",
    "description",
    "coverImage",
    "coverAlt",
    "liveUrl",
    "repoUrl",
    "caseStudyUrl",
    "docsUrl",
    "techStack",
    "features",
    "category",
    "kinds",
    "role",
    "duration",
    "fromLabel",
    "toLabel",
    "progress",
    "sortDate",
    "displayOrder",
    "isFeatured",
    "isVisible",
    "projectStatus",
    "platform",
    "clientType",
    "gallery",
    "showcase",
    "timeline",
    "techDetails",
    "caseStudy",
    "metrics",
    "relatedSlugs",
    "views",
    "likesCount",
    "bookmarksCount",
    "readingTime",
    "publishedLabel",
    "updatedLabel",
    "seoTitle",
    "seoDescription",
    "startedAt",
    "endedAt",
  ];

  for (const key of fields) {
    if (body[key] !== undefined) data[key] = body[key];
  }

  // Frontend-shaped aliases
  if (body.name !== undefined) data.title = body.name;
  if (body.id !== undefined && body.slug === undefined) data.slug = body.id;
  if (body.githubUrl !== undefined) data.repoUrl = body.githubUrl;
  if (body.from !== undefined) data.fromLabel = body.from;
  if (body.to !== undefined) data.toLabel = body.to;
  if (body.featured !== undefined) data.isFeatured = body.featured;
  if (body.relatedIds !== undefined) data.relatedSlugs = body.relatedIds;

  if (body.image) {
    if (typeof body.image === "string") data.coverImage = body.image;
    else {
      if (body.image.src !== undefined) data.coverImage = body.image.src;
      if (body.image.alt !== undefined) data.coverAlt = body.image.alt;
    }
  }

  if (body.meta) {
    if (body.meta.views !== undefined) data.views = body.meta.views;
    if (body.meta.likes !== undefined) data.likesCount = body.meta.likes;
    if (body.meta.bookmarks !== undefined) data.bookmarksCount = body.meta.bookmarks;
    if (body.meta.readingTime !== undefined) data.readingTime = body.meta.readingTime;
    if (body.meta.published !== undefined) data.publishedLabel = body.meta.published;
    if (body.meta.updated !== undefined) data.updatedLabel = body.meta.updated;
  }

  if (body.seo) {
    if (body.seo.title !== undefined) data.seoTitle = body.seo.title;
    if (body.seo.description !== undefined) data.seoDescription = body.seo.description;
  }

  return data;
}

export function mapCommentToFrontend(row) {
  return mapComment(row);
}

/** ContactInfo + social links → portfolio ContactSection / footer shape */
export function mapFooterToFrontend(contact, socialLinks = []) {
  if (!contact) return null;

  const email = contact.email || "hello@example.com";
  const words =
    contact.backgroundWords?.length > 0
      ? contact.backgroundWords
      : ["LIMITLESS", "POTENTIAL"];

  return {
    backgroundWords: words,
    eyebrow: contact.eyebrow || "Have a project in mind?",
    cta: {
      label: contact.ctaLabel || "Let's talk",
      href: contact.ctaHref || "/lets-talk",
    },
    socials: socialLinks.map((link) => ({
      label: link.label || link.platform,
      href: link.url,
    })),
    backToTopLabel: contact.backToTopLabel || "Back to top",
    credits: contact.credits || "by Sandeep Saliganti",
    logo: contact.logoUrl || null,
    developerName: contact.developerName || null,
    description: contact.description || null,
    copyright: contact.copyright || "All rights reserved",
    email,
    phone: contact.phone || null,
    address: contact.location || null,
    resumeUrl: contact.resumeUrl || null,
    availability: {
      isAvailable: true,
      label: contact.availability || "Available for projects",
    },
  };
}
