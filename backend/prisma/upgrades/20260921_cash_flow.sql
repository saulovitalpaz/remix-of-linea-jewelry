-- Additive upgrade for Cash Flow & User attribution
BEGIN;

-- Add userId and userName to DailySales if not exists
ALTER TABLE "DailySales" ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE "DailySales" ADD COLUMN IF NOT EXISTS "userName" TEXT;

-- Create CashTransaction table if not exists
CREATE TABLE IF NOT EXISTS "CashTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethod" TEXT,
    "notes" TEXT,
    "userId" TEXT,
    "userName" TEXT NOT NULL,
    "userRole" TEXT NOT NULL,
    "dailySalesId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CashTransaction_dailySalesId_fkey" FOREIGN KEY ("dailySalesId") REFERENCES "DailySales"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create indexes on CashTransaction
CREATE INDEX IF NOT EXISTS "CashTransaction_date_idx" ON "CashTransaction"("date");
CREATE INDEX IF NOT EXISTS "CashTransaction_type_idx" ON "CashTransaction"("type");
CREATE INDEX IF NOT EXISTS "CashTransaction_userId_idx" ON "CashTransaction"("userId");

COMMIT;
