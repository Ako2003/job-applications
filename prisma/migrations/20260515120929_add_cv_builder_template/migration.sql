-- CreateTable
CREATE TABLE "CVBuilderTemplate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "language" "Language" NOT NULL DEFAULT 'EN',
    "fullName" TEXT NOT NULL,
    "tagline" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "location" TEXT,
    "photoUrl" TEXT,
    "summary" TEXT,
    "highlights" JSONB,
    "technicalSkills" JSONB,
    "experience" JSONB,
    "education" JSONB,
    "certifications" JSONB,
    "achievements" JSONB,
    "languageSkills" JSONB,
    "featuredProjects" JSONB,
    "references" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CVBuilderTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CVBuilderTemplate_userId_idx" ON "CVBuilderTemplate"("userId");

-- AddForeignKey
ALTER TABLE "CVBuilderTemplate" ADD CONSTRAINT "CVBuilderTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
