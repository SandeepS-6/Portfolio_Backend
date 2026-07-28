-- CreateTable WhatIDoSection
CREATE TABLE IF NOT EXISTS "WhatIDoSection" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "lead" TEXT,
    "cinemaTitle" TEXT,
    "marqueeText" TEXT,
    "items" JSONB,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatIDoSection_pkey" PRIMARY KEY ("id")
);
