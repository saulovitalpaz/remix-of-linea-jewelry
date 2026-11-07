BEGIN;

CREATE TABLE IF NOT EXISTS "Quote" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "tokenHash" TEXT NOT NULL,
  "items" JSONB NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "saleId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Quote_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "DailySales"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Quote_tokenHash_key" ON "Quote"("tokenHash");
CREATE UNIQUE INDEX IF NOT EXISTS "Quote_saleId_key" ON "Quote"("saleId");
CREATE INDEX IF NOT EXISTS "Quote_expiresAt_idx" ON "Quote"("expiresAt");

COMMIT;
