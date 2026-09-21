import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { createApp } from './app.js';
import { uploadToObjectStorage } from './utils/object-storage.js';
const prisma = new PrismaClient();
const app = createApp({ prisma, jwtSecret: process.env.JWT_SECRET || '', uploadImage: uploadToObjectStorage });
const port = Number(process.env.PORT || 3001);
const server = app.listen(port, '0.0.0.0', () => console.log(`API listening on port ${port}`));
async function shutdown() {
    server.close(async () => { await prisma.$disconnect(); process.exit(0); });
    setTimeout(() => process.exit(1), 10_000).unref();
}
process.once('SIGTERM', shutdown);
process.once('SIGINT', shutdown);
//# sourceMappingURL=index.js.map