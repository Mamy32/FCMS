-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "durationMonths" INTEGER NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);
