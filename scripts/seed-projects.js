import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import {
  projectCommentsSeed,
  projectsSectionSeed,
  projectsSeed,
} from "../prisma/seedProjects.js";

const prisma = new PrismaClient();

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
for (const p of projectsSeed) {
  console.log(` - ${p.slug}: ${p.title}`);
}

await prisma.$disconnect();
