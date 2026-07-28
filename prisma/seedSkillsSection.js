/* Default Skills section content (Technologies I Work With). */

export const skillsSectionSeed = {
  eyebrow: null,
  headline: "Technologies I Work With",
  lead: "A curated set of technologies and tools that I use to build performant, scalable and delightful digital experiences.",
  isPublished: true,
  stats: [
    { id: "years", value: "3+", label: "Years of Experience", icon: "code" },
    { id: "projects", value: "20+", label: "Projects Completed", icon: "rocket" },
    { id: "tech", value: "15+", label: "Technologies", icon: "star" },
  ],
  categories: [
    {
      id: "frontend",
      title: "Frontend",
      detail: "Building responsive and interactive user interfaces.",
      icon: "frontend",
      tone: "sky",
      techs: [
        { name: "React", icon: "react", color: "61DAFB" },
        { name: "Next.js", icon: "nextdotjs", color: "2a2a32" },
        { name: "TypeScript", icon: "typescript", color: "3178C6" },
        { name: "Tailwind CSS", icon: "tailwindcss", color: "06B6D4" },
      ],
    },
    {
      id: "backend",
      title: "Backend",
      detail: "Creating robust APIs and server side applications.",
      icon: "backend",
      tone: "green",
      techs: [
        { name: "Node.js", icon: "nodedotjs", color: "339933" },
        { name: "Express.js", icon: "express", color: "2a2a32" },
        { name: "MongoDB", icon: "mongodb", color: "47A248" },
        { name: "PostgreSQL", icon: "postgresql", color: "4169E1" },
      ],
    },
    {
      id: "database",
      title: "Database",
      detail: "Storing and managing data efficiently and securely.",
      icon: "database",
      tone: "amber",
      techs: [
        { name: "MongoDB", icon: "mongodb", color: "47A248" },
        { name: "PostgreSQL", icon: "postgresql", color: "4169E1" },
        { name: "MySQL", icon: "mysql", color: "4479A1" },
        { name: "Firebase", icon: "firebase", color: "FFCA28" },
      ],
    },
    {
      id: "devops",
      title: "DevOps & Cloud",
      detail: "Deploying, monitoring and scaling applications.",
      icon: "cloud",
      tone: "blue",
      techs: [
        {
          name: "AWS",
          icon: "amazonaws",
          color: "FF9900",
          src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg",
        },
        { name: "Vercel", icon: "vercel", color: "2a2a32" },
        { name: "Docker", icon: "docker", color: "2496ED" },
        { name: "Kubernetes", icon: "kubernetes", color: "326CE5" },
      ],
    },
    {
      id: "tools",
      title: "Tools & Utilities",
      detail: "Productivity boosters and development essentials.",
      icon: "tools",
      tone: "violet",
      techs: [
        { name: "Git", icon: "git", color: "F05032" },
        {
          name: "VS Code",
          icon: "vscode",
          color: "007ACC",
          src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vscode/vscode-original.svg",
        },
        { name: "Figma", icon: "figma", color: "F24E1E" },
        { name: "Postman", icon: "postman", color: "FF6C37" },
      ],
    },
    {
      id: "others",
      title: "Others",
      detail:
        "Extra languages, styling tools, and state libraries that round out every build.",
      icon: "sparkles",
      tone: "rose",
      techs: [
        { name: "HTML5", icon: "html5", color: "E34F26" },
        { name: "CSS3", icon: "css", color: "1572B6" },
        { name: "Sass", icon: "sass", color: "CC6699" },
        { name: "Redux", icon: "redux", color: "764ABC" },
      ],
    },
  ],
  expertise: {
    title: "My Expertise",
    overall: 90,
    overallLabel: "Overall Proficiency",
    bars: [
      { id: "fe", label: "Frontend Development", value: 95, stars: 5 },
      { id: "be", label: "Backend Development", value: 90, stars: 4.5 },
      { id: "db", label: "Database Management", value: 85, stars: 4 },
      { id: "ops", label: "DevOps & Cloud", value: 80, stars: 4 },
      { id: "tools", label: "Tools & Others", value: 85, stars: 4 },
    ],
  },
  favourites: {
    title: "Favourite Tech",
    note: "The technologies I enjoy working with the most.",
    techs: [
      { name: "React", icon: "react", color: "61DAFB" },
      { name: "Next.js", icon: "nextdotjs", color: "2a2a32" },
      { name: "TypeScript", icon: "typescript", color: "3178C6" },
      { name: "Node.js", icon: "nodedotjs", color: "339933" },
    ],
  },
  learning: {
    title: "Currently Learning",
    name: "Next.js 15",
    detail: "Exploring new features and building modern apps.",
    percent: 70,
    tech: { name: "Next.js", icon: "nextdotjs", color: "2a2a32" },
  },
  marquee: {
    title: "Technologies I've Worked With",
    moreLabel: "and more",
    techs: [
      { name: "React", icon: "react", color: "61DAFB" },
      { name: "Next.js", icon: "nextdotjs", color: "2a2a32" },
      { name: "TypeScript", icon: "typescript", color: "3178C6" },
      { name: "Node.js", icon: "nodedotjs", color: "339933" },
      { name: "Tailwind CSS", icon: "tailwindcss", color: "06B6D4" },
      { name: "MongoDB", icon: "mongodb", color: "47A248" },
      { name: "Express.js", icon: "express", color: "2a2a32" },
      { name: "PostgreSQL", icon: "postgresql", color: "4169E1" },
    ],
  },
  summary: {
    grid: [
      {
        id: "hobbies",
        type: "hobbies",
        title: "Hobbies",
        detail: "What I do when I’m not shipping code — keeps the craft sharp and the mind clear.",
        items: [
          {
            id: "hob-cricket",
            icon: "cricket",
            title: "Playing cricket",
            detail:
              "Weekend matches, net practice, and the joy of a clean cover drive.",
          },
          {
            id: "hob-bgmi",
            icon: "gaming",
            title: "Playing BGMI",
            detail:
              "Squad drops, clutch moments, and late-night ranked grinds with friends.",
          },
          {
            id: "hob-books",
            icon: "books",
            title: "Reading books",
            detail:
              "Fiction, product thinking, and anything that sharpens how I see the world.",
          },
          {
            id: "hob-music",
            icon: "music",
            title: "Music & focus playlists",
            detail: "Beats for deep work, and quieter tracks when I need to reset.",
          },
          {
            id: "hob-walks",
            icon: "walks",
            title: "Long walks",
            detail: "Stepping away from the screen to come back with clearer ideas.",
          },
        ],
      },
      {
        id: "responsive",
        type: "service",
        title: "Responsive design",
        detail:
          "Mobile-first layouts that stay intentional on every screen — without breaking the brand system.",
        items: [
          {
            id: "resp-fluid",
            title: "Fluid type & spacing",
            detail: "Clamp-based scale so copy and rhythm feel natural from phone to desktop.",
          },
          {
            id: "resp-breakpoints",
            title: "Thoughtful breakpoints",
            detail: "Layouts that reflow with purpose — not just squeezed desktop views.",
          },
          {
            id: "resp-touch",
            title: "Touch-ready UI",
            detail: "Targets, gestures, and density tuned for thumbs as much as cursors.",
          },
          {
            id: "resp-perf",
            title: "Performance on small screens",
            detail: "Lean assets and prioritised content so mobile stays fast.",
          },
          {
            id: "resp-consistency",
            title: "Consistent components",
            detail: "Shared patterns so phone and desktop feel like one product, not two sites.",
          },
        ],
      },
      {
        id: "svc-frontend",
        type: "service",
        title: "Frontend development",
        detail:
          "Production React interfaces with clear hierarchy and polish that holds up in real products.",
        items: [
          {
            id: "fe-react",
            title: "React & modern JS",
            detail: "Component systems that stay readable as features grow.",
          },
          {
            id: "fe-motion",
            title: "Motion with purpose",
            detail: "GSAP / CSS motion that guides attention — never noise.",
          },
          {
            id: "fe-a11y",
            title: "Accessible by default",
            detail: "Keyboard paths, contrast, and semantics baked into the UI.",
          },
          {
            id: "fe-design",
            title: "Design-system fidelity",
            detail: "Tokens, type, and spacing that match the brand — pixel and product.",
          },
          {
            id: "fe-state",
            title: "State & data UX",
            detail: "Loading, empty, and error states that feel intentional — not leftover.",
          },
        ],
      },
      {
        id: "svc-fullstack",
        type: "service",
        title: "Full-stack web apps",
        detail:
          "End-to-end features across UI, APIs, and data — deploy-ready from day one.",
        items: [
          {
            id: "fs-api",
            title: "Node.js & Express APIs",
            detail: "Clear routes, validation, and contracts the frontend can trust.",
          },
          {
            id: "fs-data",
            title: "Data & Prisma",
            detail: "Schemas and queries that stay maintainable as the product grows.",
          },
          {
            id: "fs-auth",
            title: "Auth & sessions",
            detail: "Secure sign-in flows, roles, and protected routes when needed.",
          },
          {
            id: "fs-ship",
            title: "Ship & monitor",
            detail: "Env, deploys, and basics that keep production calm.",
          },
          {
            id: "fs-cms",
            title: "CMS-ready content",
            detail: "Editable copy and media wired so the site stays fresh without redeploys.",
          },
        ],
      },
    ],
  },
};
