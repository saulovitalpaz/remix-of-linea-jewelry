import express from 'express';
import type { ErrorRequestHandler, RequestHandler } from 'express';
import cors from 'cors';
import type { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { HttpError, text, number, normalizeUsername, roles, salesItems, validateSaleDate, validateTransaction, validateCustomItems } from './validation.js';
import type { Role } from './validation.js';
import { isProductImageKey } from './utils/object-storage.js';

interface Dependencies { prisma: PrismaClient; jwtSecret: string; uploadImage: (buffer: Buffer, contentType?: string) => Promise<string>; readImage?: (key: string) => Promise<{ body: Buffer; contentType: string }> }
const safeUser = (user: { id: string; name: string; role: string }) => ({ id: user.id, name: user.name, role: user.role });

export function createApp({ prisma, jwtSecret, uploadImage, readImage }: Dependencies) {
  if (jwtSecret.length < 32) throw new Error('JWT_SECRET precisa ter ao menos 32 caracteres.');
  const app = express();
  app.disable('x-powered-by');
  if (process.env.TRUST_PROXY_HOPS) app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS));
  const origins = (process.env.CORS_ORIGINS || 'https://chiquedetalhes.com.br,https://www.chiquedetalhes.com.br,http://localhost:5173,http://127.0.0.1:5173').split(',').map(s => s.trim());
  app.use(cors({ origin: (origin, cb) => cb(null, !origin || origins.includes(origin)), methods: ['GET', 'POST', 'PUT', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }));
  app.use((_req, res, next) => {
    res.set({ 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'no-referrer', 'Cache-Control': 'no-store' });
    next();
  });
  app.use(express.json({ limit: '64kb' }));
  app.get('/api/images/*key', async (req, res) => {
    const key = Array.isArray(req.params.key) ? req.params.key.join('/') : String(req.params.key);
    if (!readImage || !isProductImageKey(key)) throw new HttpError(404, 'Imagem não encontrada.');
    const image = await readImage(key);
    res.set({ 'Content-Type': image.contentType, 'Cache-Control': 'public, max-age=31536000, immutable' }).send(image.body);
  });
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 12, fieldSize: 16 * 1024 }, fileFilter: (_req, file, cb) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) return cb(new HttpError(400, 'Use JPEG, PNG ou WebP de até 5 MB.'));
    cb(null, true);
  } });
  async function imageUrl(file: Express.Multer.File) {
    const b = file.buffer;
    const valid = (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) || b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) || (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP');
    if (!valid) throw new HttpError(400, 'O arquivo não é uma imagem suportada.');
    return uploadImage(b, file.mimetype);
  }
  const authenticate: RequestHandler = async (req, res, next) => {
    const token = /^Bearer (\S+)$/.exec(req.headers.authorization || '')?.[1];
    if (!token) throw new HttpError(401, 'Faça login para continuar.');
    let id: string;
    try {
      const payload = jwt.verify(token, jwtSecret, { algorithms: ['HS256'], audience: 'chique-admin', issuer: 'chique-api' });
      if (typeof payload === 'string' || typeof payload.id !== 'string') throw new Error();
      id = payload.id;
    } catch { throw new HttpError(401, 'Sessão expirada. Entre novamente.'); }
    const user = await prisma.adminUser.findUnique({ where: { id } });
    if (!user || !roles.includes(user.role as Role)) throw new HttpError(401, 'Sessão inválida.');
    res.locals.user = safeUser(user);
    next();
  };
  const permit = (...allowed: Role[]): RequestHandler => (_req, res, next) => {
    if (!allowed.includes(res.locals.user.role)) throw new HttpError(403, 'Seu perfil não tem permissão para esta ação.');
    next();
  };
  const manage = [authenticate, permit('ADMIN', 'MANAGER')];
  const admin = [authenticate, permit('ADMIN')];
  // Per-process limiter: use a shared store for multi-replica deployments.
  const attempts = new Map<string, { count: number; until: number }>();
  const loginLimit: RequestHandler = (req, res, next) => {
    const now = Date.now();
    for (const [key, value] of attempts) if (value.until <= now) attempts.delete(key);
    const key = req.ip || 'unknown';
    const entry = attempts.get(key) || { count: 0, until: now + 15 * 60_000 };
    if (attempts.size >= 10_000 && !attempts.has(key)) throw new HttpError(429, 'Tente novamente mais tarde.');
    entry.count += 1;
    attempts.set(key, entry);
    if (entry.count > 20) { res.set('Retry-After', String(Math.ceil((entry.until - now) / 1000))); throw new HttpError(429, 'Muitas tentativas. Aguarde 15 minutos.'); }
    next();
  };
  const dummyHash = bcrypt.hashSync('not-an-account-password', 12);
  app.post('/api/auth/login', loginLimit, async (req, res) => {
    const username = normalizeUsername(req.body?.username);
    const password = req.body?.password;
    if (typeof password !== 'string' || !password || Buffer.byteLength(password) > 72) throw new HttpError(400, 'Senha inválida.');
    const user = await prisma.adminUser.findFirst({ where: { OR: [{ username }, { email: username }] } });
    const valid = await bcrypt.compare(password, user?.passwordHash || dummyHash);
    if (!user || !valid || !roles.includes(user.role as Role)) throw new HttpError(401, 'Nome ou senha incorretos.');
    const token = jwt.sign({ id: user.id }, jwtSecret, { algorithm: 'HS256', expiresIn: '1d', audience: 'chique-admin', issuer: 'chique-api' });
    res.json({ token, user: safeUser(user) });
  });
  app.get('/api/auth/me', authenticate, (_req, res) => res.json(res.locals.user));
  app.get('/api/users', ...admin, async (_req, res) => res.json((await prisma.adminUser.findMany({ orderBy: { name: 'asc' } })).map(safeUser)));
  app.post('/api/users', ...admin, async (req, res) => {
    const name = text(req.body?.name, 'Nome', 100);
    const username = normalizeUsername(name);
    const role = req.body?.role;
    const password = req.body?.password;
    if (!roles.includes(role)) throw new HttpError(400, 'Selecione um perfil válido.');
    if (typeof password !== 'string' || password.length < 6 || Buffer.byteLength(password) > 72) throw new HttpError(400, 'Use uma senha de pelo menos 6 caracteres e até 72 bytes.');
    const passwordHash = await bcrypt.hash(password, 12);
    res.status(201).json(safeUser(await prisma.adminUser.create({ data: { name, username, role, passwordHash } })));
  });
  app.get('/api/categories', async (_req, res) => res.json(await prisma.category.findMany({ include: { _count: { select: { products: true } } }, orderBy: { name: 'asc' } })));
  app.post('/api/categories', ...manage, upload.single('image'), async (req, res) => {
    const name = text(req.body?.name, 'Nome');
    const slug = text(req.body?.slug, 'Identificador', 80);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new HttpError(400, 'Identificador de categoria inválido.');
    const description = req.body?.description ? text(req.body.description, 'Descrição', 2000) : '';
    const emoji = req.body?.emoji ? String(req.body.emoji).trim().slice(0, 30) : null;
    const image = req.file ? await imageUrl(req.file) : null;
    res.status(201).json(await prisma.category.create({ data: { name, slug, description, emoji, imageUrl: image } }));
  });
  app.put('/api/categories/:id', ...manage, upload.single('image'), async (req, res) => {
    const id = String(req.params.id);
    const name = text(req.body?.name, 'Nome');
    const slug = text(req.body?.slug, 'Identificador', 80);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new HttpError(400, 'Identificador de categoria inválido.');
    const description = req.body?.description ? text(req.body.description, 'Descrição', 2000) : '';
    const emoji = req.body?.emoji ? String(req.body.emoji).trim().slice(0, 30) : null;
    const image = req.file ? { imageUrl: await imageUrl(req.file) } : req.body?.removeImage === 'true' ? { imageUrl: null } : {};
    res.json(await prisma.category.update({ where: { id }, data: { name, slug, description, emoji, ...image } }));
  });
  app.delete('/api/categories/:id', ...manage, async (req, res) => {
    const id = String(req.params.id);
    const count = await prisma.product.count({ where: { categoryId: id } });
    if (count > 0) throw new HttpError(400, `Esta categoria possui ${count} produto(s) vinculado(s). Reclassifique os produtos antes de excluí-la.`);
    await prisma.category.delete({ where: { id } });
    res.status(204).end();
  });
  app.get('/api/products', async (req, res) => {
    const slug = req.query.categorySlug;
    if (slug !== undefined && typeof slug !== 'string') throw new HttpError(400, 'Categoria inválida.');
    res.json(await prisma.product.findMany({ where: slug ? { category: { slug } } : {}, include: { category: true }, orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }, { id: 'asc' }] }));
  });
  app.get('/api/products/:id', async (req, res) => {
    const product = await prisma.product.findUnique({ where: { id: String(req.params.id) }, include: { category: true } });
    if (!product) throw new HttpError(404, 'Produto não encontrado.');
    res.json(product);
  });
  async function productData(body: Record<string, unknown>) {
    const name = text(body.name, 'Nome');
    const price = number(body.price, 'Preço');
    if (price <= 0 || Math.abs(price * 100 - Math.round(price * 100)) > 0.00001) throw new HttpError(400, 'Informe um preço positivo com até duas casas decimais.');
    const stock = number(body.stock, 'Estoque', true);
    const categoryId = text(body.categoryId, 'Categoria');
    const category = await prisma.category.findFirst({ where: { OR: [{ id: categoryId }, { slug: categoryId }] } });
    if (!category) throw new HttpError(400, 'Categoria não encontrada.');
    const description = body.description ? text(body.description, 'Descrição', 5000) : '';
    const featured = Boolean(body.featured);
    return { name, price, stock, categoryId: category.id, description, featured };
  }
  app.post('/api/products', ...manage, upload.single('image'), async (req, res) => {
    const data = await productData(req.body || {});
    const customUrl = typeof req.body?.imageUrl === 'string' && req.body.imageUrl.trim() ? req.body.imageUrl.trim() : null;
    const image = req.file ? await imageUrl(req.file) : customUrl;
    res.status(201).json(await prisma.product.create({ data: { ...data, imageUrl: image }, include: { category: true } }));
  });
  app.put('/api/products/:id', ...manage, upload.single('image'), async (req, res) => {
    const data = await productData(req.body || {});
    const customUrl = typeof req.body?.imageUrl === 'string' && req.body.imageUrl.trim() ? req.body.imageUrl.trim() : undefined;
    const image = req.file ? { imageUrl: await imageUrl(req.file) } : (customUrl !== undefined ? { imageUrl: customUrl } : {});
    res.json(await prisma.product.update({ where: { id: String(req.params.id) }, data: { ...data, ...image }, include: { category: true } }));
  });
  app.put('/api/products/:id/toggle-featured', ...manage, async (req, res) => {
    const product = await prisma.product.findUnique({ where: { id: String(req.params.id) } });
    if (!product) throw new HttpError(404, 'Produto não encontrado.');
    res.json(await prisma.product.update({ where: { id: product.id }, data: { featured: !product.featured }, include: { category: true } }));
  });
  app.delete('/api/products/:id', ...manage, async (req, res) => {
    await prisma.product.deleteMany({ where: { id: String(req.params.id) } }); res.status(204).end();
  });
  app.post('/api/sales/close-day', authenticate, permit(...roles), async (req, res) => {
    const user = res.locals.user;
    const customItems = validateCustomItems(req.body?.customItems);
    const items = salesItems(req.body?.itemsSoldData, customItems.length > 0);
    if (items.length === 0 && customItems.length === 0) {
      throw new HttpError(400, 'Informe ao menos um produto do estoque ou um item avulso.');
    }
    const notes = req.body?.notes ? text(req.body.notes, 'Observações', 2000) : '';
    const saleDate = validateSaleDate(req.body?.date, user.role as Role);
    const paymentMethod = req.body?.paymentMethod ? text(req.body.paymentMethod, 'Forma de pagamento', 50) : null;
    const sale = await prisma.$transaction(async tx => {
      let cents = 0; let itemsSold = 0;
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new HttpError(404, 'Um produto não está mais disponível.');
        const updated = await tx.product.updateMany({ where: { id: item.productId, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity }, salesCount: { increment: item.quantity } } });
        if (!updated.count) throw new HttpError(409, 'Estoque insuficiente. Atualize os produtos e confira as quantidades.');
        cents += Math.round(product.price * 100) * item.quantity; itemsSold += item.quantity;
      }
      for (const ci of customItems) {
        cents += Math.round(ci.price * 100) * ci.quantity;
        itemsSold += ci.quantity;
      }
      let desc = `Venda registrada (${itemsSold} ${itemsSold === 1 ? 'peça' : 'peças'})`;
      if (customItems.length > 0 && items.length === 0) {
        desc = `Venda avulsa: ${customItems.map(c => `${c.quantity > 1 ? c.quantity + 'x ' : ''}${c.description}`).join(', ')}`;
      } else if (customItems.length > 0) {
        desc = `Venda mista (${itemsSold} ${itemsSold === 1 ? 'peça' : 'peças'}, incl. avulsos)`;
      }
      const createdSale = await tx.dailySales.create({
        data: {
          date: saleDate,
          totalRevenue: cents / 100,
          itemsSold,
          notes,
          userId: user.id,
          userName: user.name,
        }
      });
      await tx.cashTransaction.create({
        data: {
          type: 'INFLOW',
          category: 'SALE',
          amount: cents / 100,
          description: desc,
          date: saleDate,
          paymentMethod,
          notes,
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          dailySalesId: createdSale.id,
        }
      });
      return createdSale;
    });
    res.status(201).json(sale);
  });
  app.get('/api/sales/history', authenticate, permit(...roles), async (req, res) => {
    const user = res.locals.user;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const todaySales = await prisma.dailySales.findMany({
      where: {
        date: {
          gte: startOfToday,
          lte: endOfToday,
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    let todayRevenue = 0;
    let todayItemsSold = 0;
    for (const s of todaySales) {
      todayRevenue += Math.round(s.totalRevenue * 100);
      todayItemsSold += s.itemsSold;
    }

    const todaySummary = {
      totalRevenue: todayRevenue / 100,
      salesCount: todaySales.length,
      itemsSold: todayItemsSold,
    };

    const userRecentSales = await prisma.dailySales.findMany({
      where: { userId: user.id },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      take: 10,
    });

    // Also get paymentMethod and description from cashTransaction for these sales
    const saleIds = userRecentSales.map(s => s.id);
    const txs = saleIds.length > 0 ? await prisma.cashTransaction.findMany({
      where: { dailySalesId: { in: saleIds } },
      select: { dailySalesId: true, paymentMethod: true, description: true }
    }) : [];
    const txMap = new Map(txs.map(t => [t.dailySalesId, t]));

    const formattedRecent = userRecentSales.map(s => {
      const match = txMap.get(s.id);
      return {
        id: s.id,
        date: s.date,
        createdAt: s.createdAt,
        totalRevenue: s.totalRevenue,
        itemsSold: s.itemsSold,
        notes: s.notes,
        userName: s.userName,
        paymentMethod: match?.paymentMethod || null,
        description: match?.description || null,
      };
    });

    res.json({ todaySummary, userRecentSales: formattedRecent });
  });
  app.get('/api/cash-flow', ...manage, async (req, res) => {
    const { startDate, endDate, type, category } = req.query;
    const where: Prisma.CashTransactionWhereInput = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate && typeof startDate === 'string') {
        const start = new Date(startDate.includes('T') ? startDate : `${startDate}T00:00:00.000Z`);
        if (!isNaN(start.getTime())) where.date.gte = start;
      }
      if (endDate && typeof endDate === 'string') {
        const end = new Date(endDate.includes('T') ? endDate : `${endDate}T23:59:59.999Z`);
        if (!isNaN(end.getTime())) where.date.lte = end;
      }
    }
    if (typeof type === 'string' && ['INFLOW', 'OUTFLOW'].includes(type)) {
      where.type = type;
    }
    if (typeof category === 'string' && category) {
      where.category = category;
    }
    const transactions = await prisma.cashTransaction.findMany({
      where,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });
    let totalInflows = 0;
    let totalOutflows = 0;
    let salesTotal = 0;
    for (const t of transactions) {
      const amountCents = Math.round(t.amount * 100);
      if (t.type === 'INFLOW') {
        totalInflows += amountCents;
        if (t.category === 'SALE') salesTotal += amountCents;
      } else if (t.type === 'OUTFLOW') {
        totalOutflows += amountCents;
      }
    }
    const summary = {
      totalInflows: totalInflows / 100,
      totalOutflows: totalOutflows / 100,
      netBalance: (totalInflows - totalOutflows) / 100,
      salesTotal: salesTotal / 100,
      transactionCount: transactions.length,
    };
    res.json({ summary, transactions });
  });
  app.post('/api/cash-flow', ...manage, async (req, res) => {
    const user = res.locals.user;
    const data = validateTransaction(req.body || {}, user.role as Role);
    const transaction = await prisma.cashTransaction.create({
      data: {
        ...data,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
      }
    });
    res.status(201).json(transaction);
  });
  app.delete('/api/cash-flow/:id', ...admin, async (req, res) => {
    const id = String(req.params.id);
    const tx = await prisma.cashTransaction.findUnique({ where: { id } });
    if (!tx) throw new HttpError(404, 'Movimentação não encontrada.');
    await prisma.$transaction(async txClient => {
      await txClient.cashTransaction.delete({ where: { id } });
      if (tx.dailySalesId) {
        await txClient.dailySales.delete({ where: { id: tx.dailySalesId } }).catch(() => null);
      }
    });
    res.status(204).end();
  });


  app.get('/api/popup/active', async (_req, res) => res.json(await prisma.marketingPopup.findFirst({ where: { active: true }, orderBy: { updatedAt: 'desc' } })));
  app.get('/api/popup', ...admin, async (_req, res) => res.json(await prisma.marketingPopup.findFirst({ orderBy: { createdAt: 'desc' } })));
  async function campaign<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) {
    return prisma.$transaction(async tx => { await tx.$executeRaw`SELECT pg_advisory_xact_lock(918204)`; return fn(tx); });
  }
  app.post('/api/popup', ...admin, upload.single('image'), async (req, res) => {
    if (!req.file) throw new HttpError(400, 'Selecione uma imagem.');
    const image = await imageUrl(req.file);
    const popup = await campaign(async tx => { await tx.marketingPopup.updateMany({ data: { active: false } }); return tx.marketingPopup.create({ data: { imageUrl: image, active: true } }); });
    res.status(201).json(popup);
  });
  app.put('/api/popup/:id/toggle', ...admin, async (req, res) => {
    if (typeof req.body?.active !== 'boolean') throw new HttpError(400, 'Estado da campanha inválido.');
    const active: boolean = req.body.active;
    res.json(await campaign(async tx => { if (active) await tx.marketingPopup.updateMany({ data: { active: false } }); return tx.marketingPopup.update({ where: { id: String(req.params.id) }, data: { active } }); }));
  });
  app.delete('/api/popup/:id', ...admin, async (req, res) => { await prisma.marketingPopup.delete({ where: { id: String(req.params.id) } }); res.status(204).end(); });
  app.get('/api/health', async (_req, res) => { await prisma.$queryRaw`SELECT 1`; res.json({ status: 'ok' }); });
  app.get('/', (_req, res) => res.json({ service: 'Chique Detalhes API' }));
  app.use((_req, _res) => { throw new HttpError(404, 'Endpoint não encontrado.'); });
  const errors: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
    if (error instanceof HttpError) { res.status(error.status).json({ error: error.message }); return; }
    if (error instanceof multer.MulterError) { res.status(400).json({ error: 'Upload inválido. Envie uma imagem de até 5 MB.' }); return; }
    const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
    if (code === 'P2002') { res.status(409).json({ error: 'Este nome já está cadastrado.' }); return; }
    if (code === 'P2025') { res.status(404).json({ error: 'Registro não encontrado.' }); return; }
    if (error instanceof SyntaxError) { res.status(400).json({ error: 'Requisição inválida.' }); return; }
    console.error('API request failed:', error);
    res.status(500).json({ error: 'Não foi possível concluir a operação. Tente novamente.' });
  };
  app.use(errors);
  return app;
}
