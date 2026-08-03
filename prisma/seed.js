import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  projectCommentsSeed,
  projectsSectionSeed,
  projectsSeed,
} from "./seedProjects.js";
import { whatIDoSeed } from "./seedWhatIDo.js";
import { skillsSectionSeed } from "./seedSkillsSection.js";

const prisma = new PrismaClient();

const skills = [
  { title: "JavaScript", icon: "javascript", color: "#F7DF1E", category: "frontend", displayOrder: 1, positionX: 58, positionY: 14, scale: 1, blur: 1.2, opacity: 0.72, zIndex: 2 },
  { title: "React", icon: "react", color: "#61DAFB", category: "frontend", displayOrder: 2, positionX: 78, positionY: 22, scale: 1.06, blur: 0.8, opacity: 0.8, zIndex: 3 },
  { title: "TypeScript", icon: "typescript", color: "#3178C6", category: "frontend", displayOrder: 3, positionX: 64, positionY: 36, scale: 0.98, blur: 1, opacity: 0.75, zIndex: 2 },
  { title: "Node.js", icon: "nodedotjs", color: "#339933", category: "backend", displayOrder: 4, positionX: 72, positionY: 68, scale: 0.96, blur: 1.3, opacity: 0.68, zIndex: 2 },
  { title: "PostgreSQL", icon: "postgresql", color: "#4169E1", category: "database", displayOrder: 5, positionX: 94, positionY: 78, scale: 0.94, blur: 1.4, opacity: 0.65, zIndex: 2 },
  { title: "Prisma", icon: "prisma", color: "#2D3748", category: "database", displayOrder: 6, positionX: 48, positionY: 10, scale: 0.88, blur: 2, opacity: 0.55, zIndex: 1 },
  { title: "Express.js", icon: "express", color: "#000000", category: "backend", displayOrder: 7, positionX: 54, positionY: 78, scale: 0.9, blur: 1.8, opacity: 0.58, zIndex: 1 },
  { title: "Git", icon: "git", color: "#F05032", category: "tools", displayOrder: 8, positionX: 68, positionY: 50, scale: 0.9, blur: 1.4, opacity: 0.66, zIndex: 2 },
  { title: "GitHub", icon: "github", color: "#181717", category: "tools", displayOrder: 9, positionX: 44, positionY: 62, scale: 0.88, blur: 1.7, opacity: 0.58, zIndex: 1 },
  { title: "Vite", icon: "vite", color: "#646CFF", category: "tools", displayOrder: 10, positionX: 30, positionY: 6, scale: 0.85, blur: 2.3, opacity: 0.5, zIndex: 1 },
];

async function ensureAdmin() {
  const email = (process.env.ADMIN_EMAIL || "admin@example.com").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "ChangeMeNow!123";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
    create: {
      email,
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log(`Admin ready: ${email}`);
}

async function seedProjects() {
  await prisma.projectComment.deleteMany();
  await prisma.project.deleteMany();
  await prisma.projectsSection.deleteMany();

  await prisma.projectsSection.create({ data: projectsSectionSeed });

  for (const project of projectsSeed) {
    const created = await prisma.project.create({ data: project });
    const threads = projectCommentsSeed[project.slug] || [];

    for (const thread of threads) {
      const parent = await prisma.projectComment.create({
        data: {
          projectId: created.id,
          name: thread.name,
          avatar: thread.avatar,
          body: thread.body,
          likes: thread.likes || 0,
        },
      });

      for (const reply of thread.replies || []) {
        await prisma.projectComment.create({
          data: {
            projectId: created.id,
            parentId: parent.id,
            name: reply.name,
            avatar: reply.avatar,
            body: reply.body,
            likes: reply.likes || 0,
          },
        });
      }
    }
  }

  console.log(`Projects seeded: ${projectsSeed.length}`);
}

async function main() {
  console.log("Seeding portfolio database...");

  await ensureAdmin();

  await prisma.skill.deleteMany();
  await prisma.hero.deleteMany();
  await prisma.whatIDoSection.deleteMany();
  await prisma.skillsSection.deleteMany();
  await prisma.siteSettings.deleteMany();
  await prisma.contactInfo.deleteMany();
  await prisma.socialLink.deleteMany();
  await prisma.meetingBooking.deleteMany();
  await prisma.meetingSettings.deleteMany();

  await prisma.hero.create({
    data: {
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
    },
  });

  await prisma.skill.createMany({ data: skills });

  await prisma.whatIDoSection.create({ data: whatIDoSeed });
  await prisma.skillsSection.create({ data: skillsSectionSeed });

  await prisma.siteSettings.create({
    data: {
      siteTitle: "Sandeep Saliganti",
      siteDescription: "Frontend Engineer portfolio",
      logoText: "S.",
      primaryColor: "#f17a32",
      isActive: true,
      maintenanceMode: false,
      showHero: true,
      showAbout: true,
      showWhatIDo: true,
      showSkills: true,
      showProjects: true,
      showContact: true,
    },
  });

  await prisma.contactInfo.create({
    data: {
      email: "saligantisandeepzzz6@gmail.com",
      location: "Bengaluru",
      availability: "Open to senior frontend roles",
      eyebrow: "Have a project in mind?",
      ctaLabel: "Let's talk",
      ctaHref: "/lets-talk",
      backgroundWords: ["LIMITLESS", "POTENTIAL"],
      backToTopLabel: "Back to top",
      credits: "by Sandeep Saliganti",
      developerName: "Sandeep Saliganti",
      description:
        "Frontend engineer building clear, fast interfaces with lasting foundations.",
      copyright: "All rights reserved",
    },
  });

  await prisma.socialLink.createMany({
    data: [
      {
        platform: "linkedin",
        label: "LinkedIn",
        url: "https://linkedin.com",
        displayOrder: 1,
      },
      {
        platform: "instagram",
        label: "Instagram",
        url: "https://instagram.com",
        displayOrder: 2,
      },
    ],
  });

  await prisma.meetingSettings.create({
    data: {
      hostName: "Sandeep Saliganti",
      hostInitials: "SS",
      title: "30 min meeting",
      durations: [30, 60],
      locationLabel: "Google Meet",
      meetUrl: process.env.GOOGLE_MEET_URL || null,
      timezone: "Asia/Kolkata",
      workDays: [1, 2, 3, 4, 5],
      dayStartMinutes: 1020,
      dayEndMinutes: 1290,
      slotIntervalMin: 30,
      bufferMinutes: 0,
      bookingWindowDays: 60,
      isActive: true,
    },
  });

  await seedProjects();

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
