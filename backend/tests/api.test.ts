import { test } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const secret = 'test-only-secret-with-at-least-32-characters';
const module = await import('../src/app.js').catch(() => ({}));
const createApp = 'createApp' in module ? module.createApp : undefined;

test('API exposes an independently testable application', () => {
  assert.equal(typeof createApp, 'function');
});

test('HTTP authorization, validation, stock and authentication', { skip: !createApp }, async () => {
  const hash = await bcrypt.hash('a-test-password', 4);
  const users = [
    { id: 'admin', name: 'Bárbara Paz', username: 'bárbara paz', email: 'private@example.com', role: 'ADMIN', passwordHash: hash },
    { id: 'manager', name: 'Gerente', username: 'gerente', role: 'MANAGER', passwordHash: hash },
    { id: 'seller', name: 'Vendedor', username: 'vendedor', role: 'SELLER', passwordHash: hash },
  ];
  let stock = 2;
  const db = {
    adminUser: {
      findUnique: async ({ where }: { where: { id?: string; username?: string } }) => users.find(u => u.id === where.id || u.username === where.username) ?? null,
      findFirst: async ({ where }: { where: { id?: string; username?: string; OR?: Array<{ username?: string; email?: string }> } }) => {
        if (where.OR) {
          const match = where.OR.find(cond => cond.username || cond.email);
          const val = match?.username || match?.email;
          return users.find(u => u.username === val || u.email === val) ?? null;
        }
        return users.find(u => u.id === where.id || u.username === where.username) ?? null;
      },
      findMany: async () => users,
      create: async ({ data }: { data: object }) => ({ id: 'new', ...data }),
    },
    product: {
      findUnique: async () => ({ id: 'p1', price: 19.9, stock }),
      updateMany: async ({ where, data }: { where: { stock: { gte: number } }; data: { stock: { decrement: number } } }) => {
        if (stock < where.stock.gte) return { count: 0 };
        stock -= data.stock.decrement;
        return { count: 1 };
      },
    },
    dailySales: { create: async ({ data }: { data: object }) => data },
    $transaction: async (fn: (tx: unknown) => Promise<unknown>) => fn(db),
  };
  const app = createApp!({ prisma: db, jwtSecret: secret, uploadImage: async () => 'https://example.com/image.png' });
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const base = `http://127.0.0.1:${address.port}/api`;
  const request = (path: string, method = 'GET', role?: string, body?: object) => fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(role ? { Authorization: `Bearer ${jwt.sign({ id: role }, secret, { expiresIn: '1h', audience: 'chique-admin', issuer: 'chique-api' })}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  try {
    assert.equal((await request('/users')).status, 401);
    assert.equal((await request('/users', 'GET', 'seller')).status, 403);
    assert.equal((await request('/users', 'GET', 'manager')).status, 403);
    assert.equal((await request('/popup', 'POST', 'manager')).status, 403);
    assert.equal((await request('/products/p1', 'DELETE', 'seller')).status, 403);
    assert.equal((await request('/auth/me', 'GET', 'deleted')).status, 401);
    const userList = await (await request('/users', 'GET', 'admin')).json();
    assert.equal('passwordHash' in userList[0], false);
    assert.equal('email' in userList[0], false);
    assert.equal((await request('/users', 'POST', 'admin', { name: 'Novo', password: 'long-password', role: 'ROOT' })).status, 400);
    assert.equal((await request('/auth/login', 'POST', undefined, { username: 'Bárbara Paz', password: 'a-test-password' })).status, 200);
    assert.equal((await request('/auth/login', 'POST', undefined, { username: 'private@example.com', password: 'a-test-password' })).status, 200);
    assert.equal((await request('/auth/login', 'POST', undefined, { username: {}, password: [] })).status, 400);
    assert.equal((await request('/products', 'POST', 'manager', { name: 'Produto', price: -1, stock: 2, categoryId: 'x' })).status, 400);
    assert.equal((await request('/sales/close-day', 'POST', 'seller', { itemsSoldData: [{ productId: 'p1', quantity: -2 }] })).status, 400);
    assert.equal((await request('/sales/close-day', 'POST', 'seller', { itemsSoldData: [{ productId: 'p1', quantity: 3 }] })).status, 409);
    const sale = await request('/sales/close-day', 'POST', 'seller', { itemsSoldData: [{ productId: 'p1', quantity: 2, priceAtSale: 0.01 }] });
    assert.equal(sale.status, 201);
    assert.equal((await sale.json()).totalRevenue, 39.8);
    assert.equal(stock, 0);
    assert.equal((await request('/sales/close-day', 'POST', 'seller', { itemsSoldData: [{ productId: 'p1', quantity: 1 }] })).status, 409);
  } finally {
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
});
