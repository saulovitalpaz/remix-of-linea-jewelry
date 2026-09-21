import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { createApp } from './app.js';
import { uploadToObjectStorage } from './utils/object-storage.js';
import { upgradeCashFlow } from './schema.js';
const prisma = new PrismaClient();
const app = createApp({ prisma, jwtSecret: process.env.JWT_SECRET || '', uploadImage: uploadToObjectStorage });
const port = Number(process.env.PORT || 3001);
async function start() {
    try {
        await prisma.$executeRawUnsafe('ALTER TABLE "AdminUser" ALTER COLUMN "email" DROP NOT NULL;');
        await prisma.$executeRawUnsafe('ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "name" TEXT;');
        await prisma.$executeRawUnsafe('ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "username" TEXT;');
        await prisma.$executeRawUnsafe('ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT \'SELLER\';');
        await prisma.$executeRawUnsafe('UPDATE "AdminUser" SET "name" = COALESCE("name", "email"), "username" = lower(trim("email")), "role" = \'ADMIN\' WHERE "username" IS NULL;');
        await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS "AdminUser_username_key" ON "AdminUser"("username");');
        await prisma.$executeRawUnsafe('ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false;');
        await prisma.$executeRawUnsafe('ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "emoji" TEXT;');
    }
    catch (e) {
        console.warn('DB schema sync notice:', e instanceof Error ? e.message : e);
    }
    await upgradeCashFlow(prisma);
    const server = app.listen(port, '0.0.0.0', () => console.log(`API listening on port ${port}`));
    async function shutdown() {
        server.close(async () => { await prisma.$disconnect(); process.exit(0); });
        setTimeout(() => process.exit(1), 10_000).unref();
    }
    process.once('SIGTERM', shutdown);
    process.once('SIGINT', shutdown);
}
start().catch(async (error) => {
    console.error('API startup failed:', error);
    await prisma.$disconnect();
    process.exitCode = 1;
});
//# sourceMappingURL=index.js.map