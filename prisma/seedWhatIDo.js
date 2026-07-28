/* Default What I Do content (matches former frontend mock). */

export const whatIDoSeed = {
  title: "How I work",
  lead: "A clear path from first conversation to lasting product — collaboration, craft, and care at every stage.",
  cinemaTitle: "WHAT I DO",
  marqueeText: "WHAT I DO",
  isPublished: true,
  items: [
    {
      id: "discovery",
      phase: "ALIGN",
      title: "Discovery",
      detail:
        "Listening first — clarifying goals, constraints, and success metrics so the build starts on solid ground.",
      icon: "search",
      span: 2,
      accentPeriod: true,
      accentDot: true,
    },
    {
      id: "strategy",
      phase: "ALIGN",
      title: "Strategy",
      detail:
        "Shaping scope and priorities into a realistic roadmap that balances ambition with what ships well.",
      icon: "compass",
      span: 1,
    },
    {
      id: "design",
      phase: "ALIGN",
      title: "UI / UX",
      detail:
        "Partnering with designers to turn ideas into interfaces that feel calm and intentional.",
      icon: "brain",
      span: 1,
    },
    {
      id: "frontend",
      phase: "BUILD",
      title: "Frontend",
      detail:
        "Fast, responsive, accessible interfaces built with modern tooling and a real focus on performance.",
      icon: "layout",
      span: 1,
    },
    {
      id: "backend",
      phase: "BUILD",
      title: "Backend",
      detail:
        "Reliable services, auth, and business logic that stay maintainable as the product grows.",
      icon: "server",
      span: 1,
    },
    {
      id: "api",
      phase: "BUILD",
      title: "Integration",
      detail:
        "Connecting systems cleanly — resilient loading states, clear contracts, graceful failure paths.",
      icon: "cable",
      span: 2,
      accentPeriod: true,
      accentDot: true,
    },
    {
      id: "database",
      phase: "BUILD",
      title: "Database",
      detail:
        "Schemas, migrations, and queries modelled for clarity and scale — protecting long-term velocity.",
      icon: "database",
      span: 2,
    },
    {
      id: "testing",
      phase: "SHIP",
      title: "Quality",
      detail:
        "Thoughtful coverage catches issues early so releases feel confident, not hopeful.",
      icon: "shield",
      span: 1,
    },
    {
      id: "deploy",
      phase: "SHIP",
      title: "Deployment",
      detail:
        "CI/CD, environments, and production hygiene for reliable, repeatable releases.",
      icon: "rocket",
      span: 1,
      accentDot: true,
    },
    {
      id: "performance",
      phase: "SHIP",
      title: "Performance",
      detail:
        "Measuring and trimming — faster loads, smoother interaction, leaner bundles in the real world.",
      icon: "gauge",
      span: 1,
    },
    {
      id: "monitor",
      phase: "CARE",
      title: "Monitoring",
      detail:
        "Keeping products healthy after launch with observability, fixes, and calm operational ownership.",
      icon: "activity",
      span: 1,
    },
    {
      id: "feedback",
      phase: "CARE",
      title: "Iteration",
      detail:
        "Closing the loop with clients — refining features from real feedback so the product keeps getting better.",
      icon: "refresh",
      span: 2,
      accentPeriod: true,
      accentDot: true,
    },
  ],
};
