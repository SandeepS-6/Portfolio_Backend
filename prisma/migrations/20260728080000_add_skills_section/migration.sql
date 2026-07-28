-- CreateTable SkillsSection
CREATE TABLE IF NOT EXISTS "SkillsSection" (
    "id" TEXT NOT NULL,
    "eyebrow" TEXT,
    "headline" TEXT,
    "lead" TEXT,
    "stats" JSONB,
    "categories" JSONB,
    "expertise" JSONB,
    "favourites" JSONB,
    "learning" JSONB,
    "marquee" JSONB,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillsSection_pkey" PRIMARY KEY ("id")
);
