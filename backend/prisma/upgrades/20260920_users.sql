-- Additive upgrade. Never changes passwordHash.
BEGIN;
ALTER TABLE "AdminUser" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "username" TEXT;
ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'SELLER';
UPDATE "AdminUser" SET "name" = COALESCE("name", "email"),
  "username" = lower(trim("email")), "role" = 'ADMIN' WHERE "username" IS NULL;
UPDATE "AdminUser" SET "name" = 'Bárbara Paz', "username" = 'bárbara paz', "role" = 'ADMIN'
  WHERE "email" = 'barbara@chiquedetalhes.com.br';
ALTER TABLE "AdminUser" ALTER COLUMN "name" SET NOT NULL;
ALTER TABLE "AdminUser" ALTER COLUMN "username" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "AdminUser_username_key" ON "AdminUser"("username");
COMMIT;
