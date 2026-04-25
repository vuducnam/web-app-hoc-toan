-- AlterTable
ALTER TABLE "User" ADD COLUMN     "gradeId" TEXT;

-- CreateIndex
CREATE INDEX "User_gradeId_idx" ON "User"("gradeId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: existing students default to Grade 4 (Lớp 4).
-- Parents can change this via the child-detail UI later.
UPDATE "User"
SET "gradeId" = (SELECT "id" FROM "Grade" WHERE "key" = 'g4' LIMIT 1)
WHERE "role" = 'STUDENT' AND "gradeId" IS NULL;
