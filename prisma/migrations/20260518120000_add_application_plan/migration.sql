-- CreateTable
CREATE TABLE "ApplicationPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "appsPerWeek" INTEGER NOT NULL,
    "platform" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApplicationPlan_userId_idx" ON "ApplicationPlan"("userId");

-- CreateIndex
CREATE INDEX "ApplicationPlan_userId_isActive_idx" ON "ApplicationPlan"("userId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationPlan_userId_country_platform_key" ON "ApplicationPlan"("userId", "country", "platform");

-- AddForeignKey
ALTER TABLE "ApplicationPlan" ADD CONSTRAINT "ApplicationPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
