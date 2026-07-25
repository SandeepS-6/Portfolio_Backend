-- AlterTable Project
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "coverAlt" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "caseStudyUrl" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "docsUrl" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "features" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "category" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "kinds" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "role" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "duration" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "fromLabel" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "toLabel" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "progress" INTEGER;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "sortDate" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "projectStatus" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "platform" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "clientType" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "gallery" JSONB;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "showcase" JSONB;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "timeline" JSONB;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "techDetails" JSONB;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "caseStudy" JSONB;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "metrics" JSONB;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "relatedSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "views" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "likesCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "bookmarksCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "readingTime" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "publishedLabel" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "updatedLabel" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "seoTitle" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "seoDescription" TEXT;

-- CreateTable ProjectsSection
CREATE TABLE IF NOT EXISTS "ProjectsSection" (
    "id" TEXT NOT NULL,
    "squircle" JSONB,
    "labels" JSONB,
    "intro" JSONB,
    "bottom" JSONB,
    "kinds" JSONB,
    "hiddenProjects" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProjectsSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable ProjectComment
CREATE TABLE IF NOT EXISTS "ProjectComment" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "body" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProjectComment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ProjectComment_projectId_createdAt_idx" ON "ProjectComment"("projectId", "createdAt");
CREATE INDEX IF NOT EXISTS "ProjectComment_parentId_idx" ON "ProjectComment"("parentId");

DO $$ BEGIN
  ALTER TABLE "ProjectComment" ADD CONSTRAINT "ProjectComment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ProjectComment" ADD CONSTRAINT "ProjectComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ProjectComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
