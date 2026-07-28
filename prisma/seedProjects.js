/* Seed payload aligned with frontend mockProjects shape. */

const defaultTimeline = [
  {
    id: "research",
    phase: "Research",
    detail: "Mapped user flows, constraints, and success metrics.",
  },
  {
    id: "design",
    phase: "Design",
    detail: "Wireframes, visual system, and interaction notes.",
  },
  {
    id: "development",
    phase: "Development",
    detail: "Built UI, APIs, and integrations against the brief.",
  },
  {
    id: "testing",
    phase: "Testing",
    detail: "Cross-browser checks, edge cases, and polish passes.",
  },
  {
    id: "deployment",
    phase: "Deployment",
    detail: "Shipped, monitored, and iterated on feedback.",
  },
];

function caseStudyFor(name) {
  return {
    summary: `${name} was designed as a focused product story — clear hierarchy, calm density, and interactions that stay out of the way.`,
    overview: `This case study walks through how ${name} moved from a fuzzy brief to a shippable interface.`,
    problem:
      "Stakeholders needed clarity without another dashboard that looked busy.",
    research:
      "I interviewed operators, shadowed weekly rituals, and audited competing tools for noise and empty-state quality.",
    planning:
      "We mapped jobs-to-be-done, defined a thin MVP, and sequenced delivery around the highest-friction workflow first.",
    uiDesign:
      "Typography, spacing, and one accent color carried hierarchy. Motion was reserved for orientation.",
    development:
      "Built in modular React pieces with mock-first services so CMS content can swap later.",
    challenges: [
      "Keeping dense information readable without looking like a control panel",
      "Balancing motion polish with reduced-motion and low-end devices",
      "Shipping a cohesive story across breakpoints",
    ],
    solution:
      "A centered reading column, sticky orientation aids, and progressive disclosure.",
    results:
      "Teams report faster orientation on first open and cleaner handoffs in reviews.",
    learnings: [
      "Whitespace is a feature when density is the default risk",
      "One strong cover image beats three decorative panels",
      "Case-study structure helps recruiters evaluate judgment",
    ],
    future: [
      "Deeper role-based views without fragmenting the story",
      "Richer analytics once real usage data is connected",
      "Optional dark surface for late-night ops sessions",
    ],
  };
}

function buildProject(base, extras = {}) {
  const gallery = [
    { src: base.coverImage, alt: base.coverAlt || base.title },
    {
      src: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&q=70",
      alt: `${base.title} detail view`,
    },
    {
      src: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=70",
      alt: `${base.title} workspace`,
    },
  ];
  const doneCount = extras.timelineDone ?? 4;

  return {
    ...base,
    gallery,
    showcase: {
      desktop: gallery[0],
      tablet: gallery[1],
      mobile: gallery[2],
    },
    timeline: defaultTimeline.map((step, index) => ({
      ...step,
      done: index < doneCount,
    })),
    techDetails: (base.techStack || []).map((name, index) => ({
      name,
      category: ["UI", "Language", "Tooling", "Data", "Infra"][index % 5],
    })),
    caseStudy: extras.caseStudy || caseStudyFor(base.title),
    metrics: extras.metrics || [
      { label: "Load time", value: "1.2s" },
      { label: "Lighthouse", value: "96" },
      { label: "Task success", value: "+34%" },
      { label: "Support tickets", value: "−22%" },
    ],
    views: 1200 + (extras.viewsOffset || 0),
    likesCount: 40 + (extras.likesOffset || 0),
    bookmarksCount: 12 + (extras.bookmarksOffset || 0),
    readingTime: extras.readingTime || "8 min",
    publishedLabel: extras.published || base.fromLabel || "2025",
    updatedLabel: extras.updated || base.toLabel || "Recently",
    relatedSlugs: extras.relatedSlugs || [],
    seoTitle: `${base.title} — Case study`,
    seoDescription: base.summary || base.description,
  };
}

export const projectsSectionSeed = {
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
  bottom: {
    grid: [],
  },
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
  hiddenProjects: [
    {
      id: "hidden-orbit",
      name: "Orbit Notes",
      description:
        "A calm note graph for engineers — links between ideas without the wiki tax.",
      progress: 48,
      phase: "Development",
      eta: "Q4 2026",
      features: ["Graph view", "Markdown sync", "Offline draft vault"],
      techStack: ["React", "TypeScript", "IndexedDB"],
      image: {
        src: "https://images.unsplash.com/photo-1618005182384-a83fe7d61c81?auto=format&fit=crop&w=800&q=70",
        alt: "Abstract soft shapes preview",
      },
    },
    {
      id: "hidden-signal",
      name: "Signal Desk",
      description:
        "A lightweight ops desk that surfaces only the alerts that actually matter.",
      progress: 22,
      phase: "Design",
      eta: "Q1 2027",
      features: ["Priority lanes", "Quiet hours", "Slack digest"],
      techStack: ["Next.js", "Node", "Redis"],
      image: {
        src: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=70",
        alt: "Soft gradient abstract preview",
      },
    },
    {
      id: "hidden-folio",
      name: "Folio Lab",
      description:
        "An experiment lab for portfolio motion recipes and reusable section kits.",
      progress: 71,
      phase: "Testing",
      eta: "Sep 2026",
      features: ["Motion presets", "CMS slots", "Theme tokens"],
      techStack: ["React", "GSAP", "CSS"],
      image: {
        src: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=800&q=70",
        alt: "Paper texture abstract preview",
      },
    },
  ],
};

export const projectsSeed = [
  buildProject(
    {
      title: "Atlas Dashboard",
      slug: "project-atlas",
      summary:
        "A calm operations dashboard for tracking delivery health, alerts, and team focus — built for dense data without noise.",
      description:
        "A calm operations dashboard for tracking delivery health, alerts, and team focus — built for dense data without noise.",
      coverImage:
        "https://images.unsplash.com/photo-1551281044-8b89c0d1e0b3?auto=format&fit=crop&w=1100&q=72",
      coverAlt: "Dashboard UI on a laptop screen",
      techStack: ["React", "TypeScript", "Vite", "Tailwind", "Recharts"],
      features: [
        "Live status boards with quiet empty states",
        "Keyboard-first filters and saved views",
        "Role-aware navigation for ops leads",
      ],
      category: "Frontend",
      kinds: ["featured", "production"],
      role: "Frontend Engineer",
      duration: "3 months",
      fromLabel: "Aug 2025",
      toLabel: "Nov 2025",
      progress: null,
      sortDate: "2025-11-12",
      repoUrl: "https://github.com/",
      liveUrl: "https://example.com",
      caseStudyUrl: "#",
      isFeatured: true,
      displayOrder: 1,
      projectStatus: "Shipped",
      platform: "Web",
      clientType: "Personal",
    },
    {
      viewsOffset: 840,
      likesOffset: 88,
      bookmarksOffset: 34,
      readingTime: "6 min",
      published: "12 Nov 2025",
      updated: "04 Jan 2026",
      relatedSlugs: ["project-pulse", "project-harbor", "project-northstar"],
      timelineDone: 5,
    },
  ),
  buildProject(
    {
      title: "Northstar Portfolio",
      slug: "project-northstar",
      summary:
        "A motion-led personal site with scroll storytelling, CMS-ready sections, and a booking flow that stays out of the way.",
      description:
        "A motion-led personal site with scroll storytelling, CMS-ready sections, and a booking flow that stays out of the way.",
      coverImage:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1100&q=72",
      coverAlt: "Laptop showing a clean analytics layout",
      techStack: ["React", "GSAP", "Node", "Express", "MongoDB"],
      features: [
        "Scroll-scrubbed section reveals",
        "Mock-first content services for CMS swap",
        "Meeting scheduler with timezone clarity",
      ],
      category: "Full Stack",
      kinds: ["featured", "production"],
      role: "Full-stack Frontend",
      duration: "Ongoing",
      fromLabel: "Jan 2026",
      toLabel: "Present",
      progress: 65,
      sortDate: "2026-06-01",
      repoUrl: "https://github.com/",
      liveUrl: "https://example.com",
      isFeatured: true,
      displayOrder: 2,
    },
    {
      viewsOffset: 620,
      likesOffset: 71,
      bookmarksOffset: 28,
      readingTime: "5 min",
      published: "18 Jan 2026",
      updated: "21 Jul 2026",
      relatedSlugs: ["project-atlas", "project-canvas", "project-pulse"],
      timelineDone: 3,
    },
  ),
  buildProject(
    {
      title: "Harbor Docs",
      slug: "project-harbor",
      summary:
        "Documentation experience for a design system — fast search, clear hierarchy, and examples that feel like the real product.",
      description:
        "Documentation experience for a design system — fast search, clear hierarchy, and examples that feel like the real product.",
      coverImage:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1100&q=72",
      coverAlt: "Developer workspace with code on screen",
      techStack: ["Next.js", "MDX", "CSS Modules", "Algolia"],
      features: [
        "Component playgrounds beside docs",
        "Token tables synced from source",
        "Light/dark preview without theme thrash",
      ],
      category: "Frontend",
      kinds: ["production", "opensource"],
      role: "UI Engineer",
      duration: "2 months",
      fromLabel: "Jun 2025",
      toLabel: "Aug 2025",
      progress: null,
      sortDate: "2025-08-20",
      repoUrl: "https://github.com/",
      liveUrl: "https://example.com",
      caseStudyUrl: "#",
      docsUrl: "https://example.com/docs",
      isFeatured: false,
      displayOrder: 3,
    },
    {
      viewsOffset: 410,
      likesOffset: 52,
      bookmarksOffset: 19,
      readingTime: "4 min",
      published: "20 Aug 2025",
      updated: "02 Mar 2026",
      relatedSlugs: ["project-canvas", "project-atlas", "project-ledger"],
      timelineDone: 5,
    },
  ),
  buildProject(
    {
      title: "Ledger API",
      slug: "project-ledger",
      summary:
        "A tidy billing API with clear error shapes, webhook retries, and dashboards ops can trust under load.",
      description:
        "A tidy billing API with clear error shapes, webhook retries, and dashboards ops can trust under load.",
      coverImage:
        "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1100&q=72",
      coverAlt: "Server room with soft lighting",
      techStack: ["Node", "Express", "PostgreSQL", "Redis"],
      features: [
        "Idempotent payment intents",
        "Retry-safe webhook delivery",
        "Ops-friendly structured logs",
      ],
      category: "Backend",
      kinds: ["production", "research"],
      role: "Backend Engineer",
      duration: "4 months",
      fromLabel: "Jan 2025",
      toLabel: "May 2025",
      progress: null,
      sortDate: "2025-05-02",
      repoUrl: "https://github.com/",
      liveUrl: "https://example.com",
      caseStudyUrl: "#",
      isFeatured: false,
      displayOrder: 4,
    },
    {
      viewsOffset: 290,
      likesOffset: 33,
      bookmarksOffset: 11,
      readingTime: "7 min",
      published: "02 May 2025",
      updated: "14 Sep 2025",
      relatedSlugs: ["project-atlas", "project-pulse", "project-harbor"],
      timelineDone: 5,
    },
  ),
  buildProject(
    {
      title: "Pulse Board",
      slug: "project-pulse",
      summary:
        "Realtime collaboration board for product squads — presence, comments, and a timeline that stays readable.",
      description:
        "Realtime collaboration board for product squads — presence, comments, and a timeline that stays readable.",
      coverImage:
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1100&q=72",
      coverAlt: "Team collaborating around a laptop",
      techStack: ["React", "Socket.io", "Node", "MongoDB"],
      features: [
        "Presence without noisy cursors",
        "Threaded comments on cards",
        "Offline-tolerant draft sync",
      ],
      category: "Full Stack",
      kinds: ["featured", "experiments"],
      role: "Full-stack Engineer",
      duration: "Ongoing",
      fromLabel: "Feb 2026",
      toLabel: "Present",
      progress: 40,
      sortDate: "2026-04-18",
      repoUrl: "https://github.com/",
      liveUrl: "",
      isFeatured: true,
      displayOrder: 5,
    },
    {
      viewsOffset: 510,
      likesOffset: 64,
      bookmarksOffset: 22,
      readingTime: "5 min",
      published: "18 Apr 2026",
      updated: "12 Jul 2026",
      relatedSlugs: ["project-northstar", "project-atlas", "project-ledger"],
      timelineDone: 2,
    },
  ),
  buildProject(
    {
      title: "Canvas Kit",
      slug: "project-canvas",
      summary:
        "A planned component kit for marketing pages — expressive type, restrained motion, and CMS-friendly slots.",
      description:
        "A planned component kit for marketing pages — expressive type, restrained motion, and CMS-friendly slots.",
      coverImage:
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1100&q=72",
      coverAlt: "Design tools on a desk",
      techStack: ["React", "CSS", "Storybook"],
      features: [
        "Token-first primitives",
        "Motion presets that stay calm",
        "Slot-based CMS blocks",
      ],
      category: "Frontend",
      kinds: ["concepts", "archived"],
      role: "Frontend Engineer",
      duration: "Queued",
      fromLabel: "Q3 2026",
      toLabel: "TBD",
      progress: 15,
      sortDate: "2026-07-01",
      repoUrl: "https://github.com/",
      liveUrl: "",
      isFeatured: false,
      displayOrder: 6,
    },
    {
      viewsOffset: 120,
      likesOffset: 18,
      bookmarksOffset: 7,
      readingTime: "3 min",
      published: "01 Jul 2026",
      updated: "21 Jul 2026",
      relatedSlugs: ["project-harbor", "project-northstar", "project-atlas"],
      timelineDone: 1,
    },
  ),
];

export const projectCommentsSeed = {
  "project-atlas": [
    {
      name: "Aisha Rahman",
      avatar: "AR",
      body: "The hierarchy is excellent — I could understand the product story in under a minute.",
      likes: 12,
      replies: [
        {
          name: "Sandeep",
          avatar: "SK",
          body: "Appreciate that — readability was the north star.",
          likes: 4,
        },
      ],
    },
    {
      name: "Marcus Chen",
      avatar: "MC",
      body: "Love the TOC + sticky info pattern. Feels like a real case study, not a gallery.",
      likes: 8,
      replies: [],
    },
  ],
};
