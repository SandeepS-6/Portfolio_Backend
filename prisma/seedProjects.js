/* Resume-aligned project seed — images left empty for CMS upload later. */

const defaultTimeline = [
  {
    id: "research",
    phase: "Research",
    detail: "Mapped requirements, constraints, and success metrics with stakeholders.",
  },
  {
    id: "design",
    phase: "Design",
    detail: "Defined layouts, flows, and interaction patterns without fixed mockups.",
  },
  {
    id: "development",
    phase: "Development",
    detail: "Built UI modules, API integration, and role-aware workflows.",
  },
  {
    id: "testing",
    phase: "Testing",
    detail: "Validated large datasets, RBAC paths, and cross-browser behavior.",
  },
  {
    id: "deployment",
    phase: "Deployment",
    detail: "Shipped production builds and iterated on operator feedback.",
  },
];

function buildProject(base, extras = {}) {
  const coverImage = base.coverImage || "";
  const gallery = Array.isArray(extras.gallery)
    ? extras.gallery
    : coverImage
      ? [{ src: coverImage, alt: base.coverAlt || base.title }]
      : [];

  const showcase =
    extras.showcase ||
    (gallery.length
      ? {
          desktop: gallery[0],
          tablet: gallery[1] || gallery[0],
          mobile: gallery[2] || gallery[0],
        }
      : {
          desktop: { src: "", alt: "" },
          tablet: { src: "", alt: "" },
          mobile: { src: "", alt: "" },
        });

  const doneCount = extras.timelineDone ?? 5;

  return {
    ...base,
    coverImage,
    gallery,
    showcase,
    timeline: defaultTimeline.map((step, index) => ({
      ...step,
      done: index < doneCount,
    })),
    techDetails: (base.techStack || []).map((name, index) => ({
      name,
      category: ["UI", "Language", "Tooling", "Data", "Infra"][index % 5],
    })),
    caseStudy: extras.caseStudy || {
      summary: base.summary,
      overview: base.description,
      problem: "",
      research: "",
      planning: "",
      uiDesign: "",
      development: "",
      challenges: [],
      solution: "",
      results: "",
      learnings: [],
      future: [],
    },
    metrics: extras.metrics || [],
    views: 0,
    likesCount: 0,
    bookmarksCount: 0,
    readingTime: extras.readingTime || "6 min",
    publishedLabel: extras.published || base.fromLabel || "",
    updatedLabel: extras.updated || base.toLabel || "",
    relatedSlugs: extras.relatedSlugs || [],
    seoTitle: extras.seoTitle || `${base.title} — Case study`,
    seoDescription: base.summary || base.description,
    projectStatus: base.projectStatus || "Shipped",
    platform: base.platform || "Web",
    clientType: base.clientType || "Client",
    isVisible: base.isVisible !== false,
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
  hiddenProjects: [],
};

export const projectsSeed = [
  buildProject(
    {
      title: "Super Admin — Micro-Frontend & Dynamic App Generator",
      slug: "super-admin-mfe",
      summary:
        "Central Super Admin that spins up and manages micro-frontend apps with a low-code generator for full frontend + backend apps.",
      description:
        "Engineered a micro-frontend ecosystem with Vite Module Federation so teams can create and control multiple sub-applications from one Super Admin. Includes a low-code/no-code generator, JSON-driven layouts, and shared updates that propagate across generated apps.",
      coverImage: "",
      coverAlt: "Super Admin micro-frontend platform",
      techStack: [
        "React",
        "Vite",
        "Module Federation",
        "JavaScript",
        "Node.js",
        "REST APIs",
      ],
      features: [
        "Vite Module Federation for dynamic sub-apps",
        "Low-code / no-code full-app generator",
        "Central start/stop and shared update control",
        "JSON-driven layout engine + component registry",
        "Three-layer AdminPages / AdminFrontend / AdminBackend architecture",
        "Backend-driven header, sidebar, and navigation",
      ],
      category: "Full Stack",
      kinds: ["featured", "production"],
      role: "Full Stack Developer",
      duration: "Client project",
      fromLabel: "2025",
      toLabel: "2026",
      progress: null,
      sortDate: "2026-06-01",
      liveUrl: "",
      repoUrl: "",
      caseStudyUrl: "",
      docsUrl: "",
      isFeatured: true,
      displayOrder: 1,
    },
    {
      readingTime: "8 min",
      published: "2025",
      updated: "2026",
      relatedSlugs: ["bestinfra-website", "inventory-management", "gmr-airport-billing"],
      timelineDone: 5,
      metrics: [
        { label: "Architecture", value: "3 layers" },
        { label: "Federation", value: "Runtime remotes" },
        { label: "UI model", value: "JSON-driven" },
        { label: "Sharing", value: "Cross-app" },
      ],
      caseStudy: {
        summary:
          "A Super Admin hub that generates and governs micro-frontend applications without hand-building each one.",
        overview:
          "Built a centralized platform where operators configure forms to generate full applications (frontend + backend), then manage those apps as federated remotes.",
        problem:
          "Teams needed many related apps with shared UI and updates, without forking codebases or redeploying everything by hand.",
        research:
          "Worked with backend teams on schema-driven generation and API contracts that the admin forms could drive.",
        planning:
          "Split the system into AdminPages, AdminFrontend, and AdminBackend so generation, shell UI, and APIs stayed modular.",
        uiDesign:
          "Layouts, headers, and sidebars are fully backend-configured so navigation stays consistent across generated apps.",
        development:
          "Module Federation with shared dependencies, runtime remote loading, and environment-agnostic configs. A component registry feeds the JSON layout engine.",
        challenges: [
          "Keeping federated remotes stable across environments",
          "Propagating Super Admin updates to every generated app",
          "Schema-driven generation that still feels usable for non-developers",
        ],
        solution:
          "Central Super Admin for global control (start/stop, shared updates) plus a low-code generator and JSON layout engine for extensibility.",
        results:
          "Operators can create and manage multiple sub-applications from one place, with cross-app component sharing.",
        learnings: [
          "Shared dependency graphs matter as much as remote URLs",
          "Backend-driven nav reduces drift between generated shells",
          "A registry + JSON layout scales better than one-off pages",
        ],
        future: [
          "Richer form builders for generation",
          "Stronger observability per remote app",
          "Deeper environment presets for clients",
        ],
      },
    },
  ),
  buildProject(
    {
      title: "Sammakka Sarakka Jathara — MDMS",
      slug: "ssj-mdms",
      summary:
        "Web MDMS for smart meter monitoring during a large public event — HES integration, maps, RBAC, and ops modules.",
      description:
        "Developed a meter data management system for the Sammakka Sarakka Jathara event. Integrated with Kimbal HES for real-time and interval data, Google Maps for meter locations, and modules for dashboard hierarchy, consumers, ticketing, MIS, load survey, assets, and roles.",
      coverImage: "",
      coverAlt: "MDMS dashboard for smart meter monitoring",
      techStack: [
        "React",
        "JavaScript",
        "REST APIs",
        "Google Maps",
        "Node.js",
      ],
      features: [
        "Real-time and interval HES data integration",
        "Queue-based interval meter processing",
        "Google Maps markers for meter locations",
        "Multi-level hierarchy dashboard",
        "Ticketing, MIS reports, and load survey",
        "Role-based access control (RBAC)",
      ],
      category: "Frontend",
      kinds: ["featured", "production"],
      role: "Frontend Developer",
      duration: "Event / client project",
      fromLabel: "2025",
      toLabel: "2025",
      progress: null,
      sortDate: "2025-11-01",
      liveUrl: "",
      repoUrl: "",
      isFeatured: true,
      displayOrder: 2,
    },
    {
      readingTime: "7 min",
      published: "2025",
      updated: "2025",
      relatedSlugs: ["gmr-airport-billing", "dtr-warangal", "singareni-billing"],
      timelineDone: 5,
      metrics: [
        { label: "Data source", value: "Kimbal HES" },
        { label: "Maps", value: "Google Maps" },
        { label: "Access", value: "RBAC" },
        { label: "Reports", value: "MIS + tabs" },
      ],
      caseStudy: {
        summary:
          "Event-scale smart meter monitoring with HES feeds, maps, and operator workflows.",
        overview:
          "Built the web UI to monitor and manage meter data during a large public event, collaborating with Kimbal HES and backend teams.",
        problem:
          "Organizers needed reliable visibility into meter health and consumer operations under heavy, time-sensitive load.",
        research:
          "Aligned on real-time vs interval payloads and how queue processing should surface in the UI.",
        planning:
          "Scoped modules around dashboard hierarchy, consumers, tickets, MIS, load survey, assets, and user roles.",
        uiDesign:
          "Responsive layouts that stay usable with large meter datasets; selected reports open in new tabs.",
        development:
          "Integrated HES data paths, Google Maps markers, and RBAC so permissions match data visibility.",
        challenges: [
          "Large meter lists without freezing the UI",
          "Keeping interval queues understandable for operators",
          "Accurate real-time display across hierarchy levels",
        ],
        solution:
          "Modular React screens with map visualization, role-aware views, and efficient report handling.",
        results:
          "Operators could monitor meters, raise tickets, and pull MIS views during the event.",
        learnings: [
          "Queue status belongs next to the data it affects",
          "Map markers need clear hierarchy context",
          "RBAC early prevents late permission rewrites",
        ],
        future: [
          "Richer alerting on meter anomalies",
          "Faster map clustering for denser deployments",
        ],
      },
    },
  ),
  buildProject(
    {
      title: "BestInfra Corporate Website — CMS-Driven Platform",
      slug: "bestinfra-website",
      summary:
        "Sole frontend for a CMS-driven corporate site — case studies, blogs, projects, and products rendered from APIs.",
      description:
        "Built the complete BestInfra frontend from scratch with stakeholders (no fixed designs). All content is API-driven: reusable layouts, header/footer, and dynamic pages for case studies, blogs, projects, and products, with GSAP motion for polish.",
      coverImage: "",
      coverAlt: "BestInfra CMS-driven corporate website",
      techStack: ["React", "GSAP", "CSS", "REST APIs", "JavaScript"],
      features: [
        "Fully CMS / API-driven content",
        "Reusable layout, header, and footer system",
        "Dynamic pages for case studies, blogs, projects, products",
        "GSAP-based motion and responsive UI",
        "Scalable structure for ongoing content updates",
      ],
      category: "Frontend",
      kinds: ["featured", "production"],
      role: "Frontend Developer (sole)",
      duration: "Client project",
      fromLabel: "2025",
      toLabel: "2025",
      progress: null,
      sortDate: "2025-09-01",
      liveUrl: "",
      repoUrl: "",
      isFeatured: true,
      displayOrder: 3,
    },
    {
      readingTime: "5 min",
      published: "2025",
      updated: "2025",
      relatedSlugs: ["super-admin-mfe", "inventory-management", "gmr-airport-billing"],
      timelineDone: 5,
      metrics: [
        { label: "Content", value: "CMS APIs" },
        { label: "Motion", value: "GSAP" },
        { label: "Ownership", value: "Sole FE" },
        { label: "Pages", value: "Multi-type" },
      ],
      caseStudy: {
        summary:
          "A corporate marketing site where every page type is fed by CMS APIs.",
        overview:
          "Owned the full frontend build with stakeholders defining structure and UX without predefined mockups.",
        problem:
          "Marketing needed frequent content updates without redeploying hard-coded pages.",
        research:
          "Mapped content types (case studies, blogs, projects, products) to reusable page shells.",
        planning:
          "Laid out a scalable layout system so new CMS entries render through the same components.",
        uiDesign:
          "Clear hierarchy, responsive breakpoints, and restrained GSAP motion for section presence.",
        development:
          "Integrated CMS APIs end-to-end; modular components keep content swaps maintainable.",
        challenges: [
          "Designing without a fixed design system",
          "Keeping many content types consistent",
          "Motion that helps hierarchy without noise",
        ],
        solution:
          "API-first React architecture with shared chrome and content-type-specific templates.",
        results:
          "Stakeholders can update site content through the CMS while the frontend stays stable.",
        learnings: [
          "Agree content shapes early with the CMS team",
          "Reusable layouts beat one-off marketing pages",
          "GSAP works best when tied to section purpose",
        ],
        future: [
          "Richer preview modes for editors",
          "More shared motion presets across templates",
        ],
      },
    },
  ),
  buildProject(
    {
      title: "GMR Hyderabad Airport — Prepaid Billing",
      slug: "gmr-airport-billing",
      summary:
        "Prepaid electricity billing web app for GMR Hyderabad Airport shops — meters, payments, RBAC, and dark/light UI.",
      description:
        "Sole frontend for a prepaid billing application managing electricity usage and payments across multiple shop meters. Delivered 6+ modules (dashboard, consumers, billing, assets, users, ticketing) with REST integration, RBAC, and dark/light mode — built from scratch without design references.",
      coverImage: "",
      coverAlt: "GMR airport prepaid billing application",
      techStack: ["React", "JavaScript", "REST APIs", "CSS", "RBAC"],
      features: [
        "Dashboard for multi-meter prepaid usage",
        "Consumer, billing, and asset management",
        "Centralized ticketing system",
        "Role-based page and data access",
        "Dark / light mode",
        "REST integration for live meter profiles",
      ],
      category: "Frontend",
      kinds: ["featured", "production"],
      role: "Frontend Developer (sole)",
      duration: "Client project",
      fromLabel: "2025",
      toLabel: "2025",
      progress: null,
      sortDate: "2025-08-01",
      liveUrl: "",
      repoUrl: "",
      isFeatured: true,
      displayOrder: 4,
    },
    {
      readingTime: "7 min",
      published: "2025",
      updated: "2025",
      relatedSlugs: ["ssj-mdms", "singareni-billing", "dtr-warangal"],
      timelineDone: 5,
      metrics: [
        { label: "Modules", value: "6+" },
        { label: "Access", value: "RBAC" },
        { label: "Theme", value: "Dark / light" },
        { label: "Domain", value: "Prepaid billing" },
      ],
      caseStudy: {
        summary:
          "Airport prepaid billing UI for shop meters, payments, and operations.",
        overview:
          "Designed and built every page and flow in React with the backend team defining data contracts for live meter profiles.",
        problem:
          "Airport retail needed a clear way to track prepaid electricity usage and payments across many shop meters.",
        research:
          "Walked through operator workflows for billing, tickets, and asset ownership.",
        planning:
          "Architected modules around dashboard, consumers, billing, assets, users, and ticketing.",
        uiDesign:
          "Built without mockups — focused on readable tables, clear payment states, and theme support.",
        development:
          "REST-driven screens with RBAC for page-level access and data visibility.",
        challenges: [
          "No design references for a dense billing product",
          "Multiple meter profiles on one consumer",
          "Keeping RBAC aligned with backend roles",
        ],
        solution:
          "A modular React app with shared patterns across billing and ops screens, plus dark/light themes.",
        results:
          "Operators can manage prepaid usage, payments, tickets, and assets in one frontend.",
        learnings: [
          "Agree API shapes before deep UI polish",
          "Theme tokens early save dual-mode rework",
          "Ticketing belongs next to the records it references",
        ],
        future: [
          "Richer payment history filters",
          "Faster multi-meter comparison views",
        ],
      },
    },
  ),
  buildProject(
    {
      title: "DTR Monitoring — Warangal (TGNPDCL)",
      slug: "dtr-warangal",
      summary:
        "Distribution transformer monitoring for Warangal — maps, multi-profile dashboards, and Konva power visualizations.",
      description:
        "Web system to monitor and visualize DTR data across the Warangal region. Interactive React dashboard with Google Maps geolocation, react-konva visuals, and a power triangle for active (kWh) vs reactive (kVArh) energy to clarify power factor.",
      coverImage: "",
      coverAlt: "DTR monitoring dashboard with map and power visuals",
      techStack: [
        "React",
        "react-konva",
        "Google Maps",
        "JavaScript",
        "REST APIs",
      ],
      features: [
        "Multi-profile transformer dashboard",
        "Google Maps geolocation for DTRs",
        "react-konva performance visuals",
        "Power triangle (kWh / kVArh)",
        "Feeder-level and meter-linked views",
      ],
      category: "Frontend",
      kinds: ["production", "research"],
      role: "Frontend Developer",
      duration: "Client project",
      fromLabel: "2025",
      toLabel: "2025",
      progress: null,
      sortDate: "2025-07-01",
      liveUrl: "",
      repoUrl: "",
      isFeatured: false,
      displayOrder: 5,
    },
    {
      readingTime: "6 min",
      published: "2025",
      updated: "2025",
      relatedSlugs: ["ssj-mdms", "singareni-billing", "gmr-airport-billing"],
      timelineDone: 5,
      metrics: [
        { label: "Region", value: "Warangal" },
        { label: "Maps", value: "Google Maps" },
        { label: "Canvas", value: "react-konva" },
        { label: "Focus", value: "Power factor" },
      ],
      caseStudy: {
        summary:
          "Spatial + visual monitoring for distribution transformers in Warangal.",
        overview:
          "Built dashboards that combine feeder/meter data with map locations and canvas-based energy visuals.",
        problem:
          "Operators needed clearer spatial and power-factor insight than raw meter tables alone.",
        research:
          "Reviewed how active vs reactive energy should be shown for day-to-day decisions.",
        planning:
          "Prioritized map placement, multi-profile metrics, and a dedicated power triangle view.",
        uiDesign:
          "Clean, intuitive screens so field and office users can scan status quickly.",
        development:
          "React dashboard + Google Maps + react-konva for load and performance representation.",
        challenges: [
          "Making power-factor concepts readable",
          "Linking feeder hierarchy to meters on the map",
          "Keeping canvas visuals performant",
        ],
        solution:
          "Combined map monitoring with Konva visuals and structured feeder/meter panels.",
        results:
          "Improved interpretation of transformer performance and load distribution.",
        learnings: [
          "Visual metaphors beat raw kVArh columns",
          "Map + table pairing reduces context switching",
        ],
        future: [
          "Historical trend overlays on the triangle",
          "Alert badges tied to map markers",
        ],
      },
    },
  ),
  buildProject(
    {
      title: "Singareni Billing — Asset Visualization (NodeChart)",
      slug: "singareni-billing",
      summary:
        "Asset management for a postpaid billing system — custom node–edge engine rendering 20,000+ meters with WebGL.",
      description:
        "Built the Asset Management module and NodeChart V1 visualization for hierarchical location–meter relationships. Multi-renderer stack (WebGL, SVG, Canvas, HTML) with viewport culling, Map-based lookups, batched draw calls, and progressive expand/collapse for large trees.",
      coverImage: "",
      coverAlt: "NodeChart hierarchy visualization for meter assets",
      techStack: [
        "React",
        "WebGL",
        "Canvas",
        "SVG",
        "JavaScript",
      ],
      features: [
        "Custom node–edge hierarchy engine (NodeChart V1)",
        "20,000+ meter rendering pipeline",
        "Multi-renderer: WebGL / SVG / Canvas / HTML",
        "Viewport culling for off-screen nodes",
        "Map-based node lookup + optimized edges",
        "Progressive expand / collapse disclosure",
      ],
      category: "Frontend",
      kinds: ["featured", "production", "research"],
      role: "Frontend Developer",
      duration: "Client project",
      fromLabel: "2025",
      toLabel: "2026",
      progress: null,
      sortDate: "2026-01-15",
      liveUrl: "",
      repoUrl: "",
      isFeatured: true,
      displayOrder: 6,
    },
    {
      readingTime: "9 min",
      published: "2025",
      updated: "2026",
      relatedSlugs: ["dtr-warangal", "gmr-airport-billing", "ssj-mdms"],
      timelineDone: 5,
      metrics: [
        { label: "Meters", value: "20,000+" },
        { label: "Engine", value: "NodeChart V1" },
        { label: "Render", value: "WebGL+" },
        { label: "Cull", value: "Viewport" },
      ],
      caseStudy: {
        summary:
          "High-performance asset graph for postpaid meter infrastructure at Singareni scale.",
        overview:
          "Owned the visualization layer that lets operators explore hierarchical location and meter relationships without freezing the browser.",
        problem:
          "Standard DOM charts could not handle tens of thousands of meters interactively.",
        research:
          "Compared SVG, Canvas, and WebGL trade-offs for nodes, edges, and labels.",
        planning:
          "Designed a multi-renderer architecture so each layer does what it is good at.",
        uiDesign:
          "Progressive disclosure keeps the tree usable — expand only what you need.",
        development:
          "Viewport culling, Map lookups, rAF loops, batched WebGL draws, and React render discipline (memo / batched state).",
        challenges: [
          "Edge resolution cost at scale",
          "Avoiding redundant React re-renders",
          "Keeping interaction smooth while zooming and expanding",
        ],
        solution:
          "NodeChart V1 with multi-renderer pipeline and aggressive culling / lookup optimizations.",
        results:
          "Operators can explore large meter hierarchies with acceptable frame rates.",
        learnings: [
          "Cull before you draw",
          "Lookup maps beat nested array scans",
          "Batch draw calls; minimize state churn",
        ],
        future: [
          "Deeper search-to-node camera focus",
          "Export snapshots of selected subgraphs",
        ],
      },
    },
  ),
  buildProject(
    {
      title: "Inventory Management — Stock & Warehouse",
      slug: "inventory-management",
      summary:
        "Full inventory system for stock, warehouses, and analytics — JWT/RBAC, WebSockets, and dark/light design tokens.",
      description:
        "Led frontend for a full-scale inventory platform: vendor orders, warehouse intake with serial tracking, client allocation, and multi-warehouse visibility. JWT auth, RBAC, WebSocket notifications, stock comparison dashboards, and a reusable CSS-variable theme system.",
      coverImage: "",
      coverAlt: "Inventory management stock and warehouse dashboard",
      techStack: [
        "React",
        "JavaScript",
        "WebSockets",
        "JWT",
        "CSS",
        "REST APIs",
      ],
      features: [
        "JWT auth + role-based access",
        "Vendor orders and warehouse intake (serials)",
        "Client allocation workflows",
        "Multi-warehouse stock visibility",
        "WebSocket live notifications",
        "Dark / light design system via CSS variables",
      ],
      category: "Full Stack",
      kinds: ["production"],
      role: "Frontend Lead",
      duration: "Client project",
      fromLabel: "2025",
      toLabel: "2026",
      progress: null,
      sortDate: "2026-03-01",
      liveUrl: "",
      repoUrl: "",
      isFeatured: false,
      displayOrder: 7,
    },
    {
      readingTime: "7 min",
      published: "2025",
      updated: "2026",
      relatedSlugs: ["super-admin-mfe", "bestinfra-website", "gmr-airport-billing"],
      timelineDone: 5,
      metrics: [
        { label: "Auth", value: "JWT + RBAC" },
        { label: "Realtime", value: "WebSockets" },
        { label: "Scope", value: "Multi-warehouse" },
        { label: "Theme", value: "CSS variables" },
      ],
      caseStudy: {
        summary:
          "Stock and warehouse operations UI with live updates and secure multi-user flows.",
        overview:
          "Led React architecture, API integration, and realtime features for inventory tracking and analytics.",
        problem:
          "Distributed warehouses needed shared visibility into orders, serials, and client allocation.",
        research:
          "Mapped vendor → intake → allocation paths and who needs which notifications.",
        planning:
          "Modular screens for orders, intake, allocation, and comparison dashboards.",
        uiDesign:
          "Reusable design system with CSS variables for dark and light themes.",
        development:
          "JWT/RBAC for secure workflows; WebSockets for live order and stock movement alerts.",
        challenges: [
          "Serial tracking without clumsy forms",
          "Keeping multi-warehouse stock comparable",
          "Realtime updates without noisy UI thrash",
        ],
        solution:
          "Role-aware React modules, WebSocket notifications, and tokenized theming.",
        results:
          "Teams can track stock movement and allocations with live feedback across warehouses.",
        learnings: [
          "Serial UX is a product problem, not only a field",
          "Theme tokens pay off once dual mode is required",
          "RBAC should mirror warehouse ownership",
        ],
        future: [
          "Deeper analytics on stock aging",
          "Richer notification preferences per role",
        ],
      },
    },
  ),
];

export const projectCommentsSeed = {};
