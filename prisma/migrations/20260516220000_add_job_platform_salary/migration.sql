-- CreateTable
CREATE TABLE "JobPlatformSalary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT,
    "salaryMinAnnual" INTEGER,
    "salaryMaxAnnual" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPlatformSalary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobPlatformSalary_userId_idx" ON "JobPlatformSalary"("userId");

-- CreateIndex
CREATE INDEX "JobPlatformSalary_userId_country_idx" ON "JobPlatformSalary"("userId", "country");

-- AddForeignKey
ALTER TABLE "JobPlatformSalary" ADD CONSTRAINT "JobPlatformSalary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
