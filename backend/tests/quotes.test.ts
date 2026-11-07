/* eslint-disable @typescript-eslint/no-explicit-any -- compact in-memory Prisma test double */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';

const secret = 'quotes-tests-secret-with-at-least-32-characters';

async function fixture() {
  const products = [
    { id: 'p1', name: 'Anel', price: 10, stock: 3, salesCount: 0 },
    { id: 'p2', name: 'Bolsa', price: 25, stock: 2, salesCount: 0 },
  ];
  const quotes: any[] = [];
  const sales: any[] = [];
  const cash: any[] = [];
  const db: any = {
    adminUser: { findUnique: async ({ where }: any) => where.id === 'seller' ? { id: 'seller', name: 'Vendedora', role: 'SELLER' } : null },
    product: {
      findUnique: async ({ where }: any) => products.find(p => p.id === where.id) || null,
      updateMany: async ({ where, data }: any) => {
        const p = products.find(item => item.id === where.id && item.stock >= where.stock.gte);
        if (!p) return { count: 0 };
        p.stock -= data.stock.decrement; p.salesCount += data.salesCount.increment;
        return { count: 1 };
      },
    },
    quote: {
      create: async ({ data }: any) => { const q = { id: `q${quotes.length}`, status: 'OPEN', saleId: null, ...data }; quotes.push(q); return q; },
      deleteMany: async ({ where }: any) => { for (let i = quotes.length - 1; i >= 0; i--) if (quotes[i].status === where.status && quotes[i].expiresAt <= where.expiresAt.lte) quotes.splice(i, 1); return { count: 0 }; },
      findUnique: async ({ where }: any) => { const q = quotes.find(item => item.tokenHash === where.tokenHash); return q ? { ...q, sale: sales.find(s => s.id === q.saleId) || null } : null; },
      updateMany: async ({ where, data }: any) => {
        const q = quotes.find(item => item.tokenHash === where.tokenHash && item.status === where.status && item.expiresAt > where.expiresAt.gt);
        if (!q) return { count: 0 };
        Object.assign(q, data); return { count: 1 };
      },
      update: async ({ where, data }: any) => Object.assign(quotes.find(q => q.tokenHash === where.tokenHash), data),
    },
    dailySales: { create: async ({ data }: any) => { const s = { id: `s${sales.length}`, ...data }; sales.push(s); return s; } },
    cashTransaction: { create: async ({ data }: any) => { cash.push(data); return data; } },
    $transaction: async (run: any) => {
      const before = { products: structuredClone(products), quotes: structuredClone(quotes), sales: structuredClone(sales), cash: structuredClone(cash) };
      try { return await run(db); } catch (error) {
        products.splice(0, products.length, ...before.products); quotes.splice(0, quotes.length, ...before.quotes);
        sales.splice(0, sales.length, ...before.sales); cash.splice(0, cash.length, ...before.cash);
        throw error;
      }
    },
  };
  const server = createApp({ prisma: db, jwtSecret: secret, uploadImage: async () => '' }).listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const address = server.address(); assert.ok(address && typeof address === 'object');
  const token = jwt.sign({ id: 'seller' }, secret, { audience: 'chique-admin', issuer: 'chique-api' });
  const request = (path: string, method = 'GET', body?: unknown, authenticated = false) => fetch(`http://127.0.0.1:${address.port}/api${path}`, {
    method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(authenticated ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined,
  });
  return { request, products, quotes, sales, cash, close: async () => { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); } };
}

test('public quote creation validates products, keeps authoritative values and requires login to read', async () => {
  const f = await fixture();
  try {
    assert.equal((await f.request('/quotes', 'POST', { items: [{ productId: 'p1', quantity: 4 }] })).status, 409);
    assert.equal((await f.request('/quotes', 'POST', { items: [{ productId: 'missing', quantity: 1 }] })).status, 404);
    const created = await f.request('/quotes', 'POST', { items: [{ productId: 'p1', quantity: 2, price: 0.01 }, { productId: 'p2', quantity: 1 }] });
    assert.equal(created.status, 201);
    const { token } = await created.json();
    assert.match(token, /^[A-Za-z0-9_-]{43}$/);
    assert.notEqual(f.quotes[0].tokenHash, token);
    assert.equal((await f.request(`/quotes/${token}`)).status, 401);
    const quote = await (await f.request(`/quotes/${token}`, 'GET', undefined, true)).json();
    assert.deepEqual(quote.items.map((i: any) => [i.productId, i.quantity, i.price]), [['p1', 2, 10], ['p2', 1, 25]]);
    assert.equal(f.sales.length, 0); assert.equal(f.cash.length, 0); assert.equal(f.products[0].stock, 3);
    f.quotes[0].expiresAt = new Date(0);
    assert.equal((await f.request(`/quotes/${token}`, 'GET', undefined, true)).status, 410);
  } finally { await f.close(); }
});

test('failed stock validation rolls back the quote claim and allows a later retry', async () => {
  const f = await fixture();
  try {
    const created = await (await f.request('/quotes', 'POST', { items: [{ productId: 'p1', quantity: 2 }] })).json();
    f.products[0].stock = 1;
    const body = { quoteToken: created.token, itemsSoldData: [{ productId: 'p1', quantity: 2 }] };
    assert.equal((await f.request('/sales/close-day', 'POST', body, true)).status, 409);
    assert.equal(f.quotes[0].status, 'OPEN');
    assert.equal(f.sales.length, 0); assert.equal(f.cash.length, 0);
    f.products[0].stock = 2;
    assert.equal((await f.request('/sales/close-day', 'POST', body, true)).status, 201);
  } finally { await f.close(); }
});

test('a confirmed quote creates one linked sale and cash entry and cannot be reused', async () => {
  const f = await fixture();
  try {
    const created = await (await f.request('/quotes', 'POST', { items: [{ productId: 'p1', quantity: 2 }] })).json();
    const body = { quoteToken: created.token, itemsSoldData: [{ productId: 'p1', quantity: 2 }], paymentMethod: 'PIX' };
    assert.equal((await f.request('/sales/close-day', 'POST', body)).status, 401);
    const result = await f.request('/sales/close-day', 'POST', body, true);
    assert.equal(result.status, 201);
    assert.equal(f.sales.length, 1); assert.equal(f.sales[0].totalRevenue, 20);
    assert.equal(f.cash.length, 1); assert.equal(f.cash[0].dailySalesId, f.sales[0].id);
    assert.equal(f.quotes[0].saleId, f.sales[0].id); assert.equal(f.products[0].stock, 1);
    assert.equal((await f.request('/sales/close-day', 'POST', body, true)).status, 409);
    assert.equal(f.sales.length, 1); assert.equal(f.cash.length, 1);
    const quote = await (await f.request(`/quotes/${created.token}`, 'GET', undefined, true)).json();
    assert.equal(quote.status, 'COMPLETED');
    assert.equal(quote.sale.id, f.sales[0].id);
  } finally { await f.close(); }
});
