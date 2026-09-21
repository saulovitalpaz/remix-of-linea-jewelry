import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { createApp } from './app.js';
import { uploadToObjectStorage } from './utils/object-storage.js';
const prisma = new PrismaClient();
const app = createApp({ prisma, jwtSecret: process.env.JWT_SECRET || '', uploadImage: uploadToObjectStorage });
const port = Number(process.env.PORT || 3001);
async function start() {
    try {
        await prisma.$executeRawUnsafe(`
      ALTER TABLE "AdminUser" ALTER COLUMN "email" DROP NOT NULL;
      ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "name" TEXT;
      ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "username" TEXT;
      ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'SELLER';
      UPDATE "AdminUser" SET "name" = COALESCE("name", "email"), "username" = lower(trim("email")), "role" = 'ADMIN' WHERE "username" IS NULL;
      CREATE UNIQUE INDEX IF NOT EXISTS "AdminUser_username_key" ON "AdminUser"("username");
    `);
    }
    catch (e) {
        console.warn('DB schema sync notice:', e instanceof Error ? e.message : e);
    }
    const server = app.listen(port, '0.0.0.0', () => console.log(`API listening on port ${port}`));
    async function shutdown() {
        server.close(async () => { await prisma.$disconnect(); process.exit(0); });
        setTimeout(() => process.exit(1), 10_000).unref();
    }
    process.once('SIGTERM', shutdown);
    process.once('SIGINT', shutdown);
}
start();
//# sourceMappingURL=index.js.map