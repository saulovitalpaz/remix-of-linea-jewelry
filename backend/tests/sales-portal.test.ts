/* eslint-disable @typescript-eslint/no-explicit-any -- compact in-memory Prisma test double */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';

const secret = 'sales-portal-tests-secret-with-32-characters';
const initialUsers = [
  { id: 'admin', name: 'Admin', role: 'ADMIN' },
  { id: 'admin2', name: 'Admin 2', role: 'ADMIN' },
  { id: 'manager', name: 'Manager', role: 'MANAGER' },
  { id: 'seller', name: 'Seller', role: 'SELLER' },
  { id: 'seller2', name: 'Seller 2', role: 'SELLER' },
];

function token(id: string) {
  return jwt.sign({ id }, secret, { expiresIn: '1h', audience: 'chique-admin', issuer: 'chique-api' });
}

async function fixture() {
  const users = initialUsers.map(user => ({ ...user }));
  const products = [{ id: 'p1', name: 'Ring', price: 10, stock: 2, featured: true, onOffer: true, categoryId: 'c1', category: { id: 'c1', slug: 'rings' } }];
  const sales = [
    { id: 's1', userId: 'seller', userName: 'Seller', date: new Date(), createdAt: new Date(), totalRevenue: 12.34, itemsSold: 1, notes: '' },
    { id: 's2', userId: 'seller2', userName: 'Seller 2', date: new Date(), createdAt: new Date(), totalRevenue: 99, itemsSold: 9, notes: '' },
  ];
  const cash = [{ id: 'cash1', userId: 'seller', userName: 'Seller', dailySalesId: 's1' }];
  const goals = new Map<string, { userId: string; month: string; target: number }>();
  const db: any = {
    adminUser: {
      findUnique: async ({ where }: any) => users.find(user => user.id === where.id) ?? null,
      count: async ({ where }: any) => users.filter(user => !where?.role || user.role === where.role).length,
      delete: async ({ where }: any) => { const index = users.findIndex(user => user.id === where.id); if (index < 0) throw Object.assign(new Error(), { code: 'P2025' }); users.splice(index, 1); },
    },
    product: {
      findMany: async () => products,
      findUnique: async ({ where }: any) => products.find(product => product.id === where.id) ?? null,
      create: async ({ data }: any) => ({ id: 'created', ...data, category: { id: 'c1' } }),
      update: async ({ where, data }: any) => Object.assign(products.find(product => product.id === where.id)!, data),
    },
    category: { findFirst: async () => ({ id: 'c1' }) },
    dailySales: {
      create: async ({ data }: any) => { const sale = { id: `sale-${sales.length}`, createdAt: new Date(), ...data }; sales.push(sale); return sale; },
      findMany: async ({ where = {} }: any) => sales.filter(sale => (!where.userId || sale.userId === where.userId) && (!where.date?.gte || sale.date >= where.date.gte) && (!where.date?.lt || sale.date < where.date.lt)),
    },
    cashTransaction: { findMany: async () => [], create: async ({ data }: any) => ({ id: 'cash-sale', ...data }) },
    monthlySalesGoal: {
      findUnique: async ({ where }: any) => goals.get(`${where.userId_month.userId}:${where.userId_month.month}`) ?? null,
      upsert: async ({ where, create, update }: any) => { const goal = { ...create, ...update }; goals.set(`${where.userId_month.userId}:${where.userId_month.month}`, goal); return goal; },
    },
    $transaction: async (run: any) => run(db),
  };
  const app = createApp({ prisma: db, jwtSecret: secret, uploadImage: async () => 'image' });
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const address = server.address(); assert.ok(address && typeof address === 'object');
  const request = (path: string, method = 'GET', id?: string, body?: any) => fetch(`http://127.0.0.1:${address.port}/api${path}`, {
    method, headers: { ...(id ? { Authorization: `Bearer ${token(id)}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined,
  });
  return { request, products, sales, cash, goals, close: async () => { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); } };
}

test('admin deletion preserves history, blocks self/last admin, and invalidates authentication', async () => {
  const f = await fixture();
  try {
    assert.equal((await f.request('/users/seller', 'DELETE', 'manager')).status, 403);
    assert.equal((await f.request('/users/admin', 'DELETE', 'admin')).status, 400);
    assert.equal((await f.request('/users/seller', 'DELETE', 'admin')).status, 204);
    assert.equal(f.sales.length, 2); assert.equal(f.cash.length, 1);
    assert.equal((await f.request('/auth/me', 'GET', 'seller')).status, 401);
    assert.equal((await f.request('/users/admin2', 'DELETE', 'admin')).status, 204);
    assert.equal((await f.request('/users/admin', 'DELETE', 'admin2')).status, 401);
  } finally { await f.close(); }
});

test('sales history daily summary is restricted to the authenticated seller', async () => {
  const f = await fixture();
  try {
    const response = await f.request('/sales/history', 'GET', 'seller');
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json()).todaySummary, { totalRevenue: 12.34, salesCount: 1, itemsSold: 1 });
  } finally { await f.close(); }
});

test('monthly goals are private per user, preserve months, and return personal revenue', async () => {
  const f = await fixture();
  try {
    const unset = await (await f.request('/sales/goal?month=2026-09', 'GET', 'seller')).json();
    assert.equal(unset.target, null);
    assert.equal((await f.request('/sales/goal', 'PUT', 'seller', { month: '2026-09', target: 1000.55 })).status, 200);
    assert.equal((await f.request('/sales/goal', 'PUT', 'seller', { month: '2026-08', target: 500 })).status, 200);
    assert.equal((await f.request('/sales/goal', 'PUT', 'seller2', { month: '2026-09', target: 2000 })).status, 200);
    assert.equal((await (await f.request('/sales/goal?month=2026-09', 'GET', 'seller')).json()).target, 1000.55);
    assert.equal((await (await f.request('/sales/goal?month=2026-08', 'GET', 'seller')).json()).target, 500);
    assert.equal((await f.request('/sales/goal', 'PUT', 'seller', { month: '2026-9', target: 1 })).status, 400);
    assert.equal((await f.request('/sales/goal', 'PUT', 'seller', { month: '2026-09', target: 0 })).status, 400);
    assert.equal((await f.request('/sales/goal', 'PUT', 'seller', { month: '2026-09', target: 1.001 })).status, 400);
  } finally { await f.close(); }
});

test('monthly revenue uses Sao Paulo midnight and an exclusive next-month boundary', async () => {
  const f = await fixture();
  try {
    f.sales[0].date = new Date('2026-09-15T12:00:00.000Z');
    f.sales.push(
      { id: 'before', userId: 'seller', userName: 'Seller', date: new Date('2026-09-01T02:59:59.999Z'), createdAt: new Date(), totalRevenue: 1, itemsSold: 1, notes: '' },
      { id: 'start', userId: 'seller', userName: 'Seller', date: new Date('2026-09-01T03:00:00.000Z'), createdAt: new Date(), totalRevenue: 2, itemsSold: 1, notes: '' },
      { id: 'end', userId: 'seller', userName: 'Seller', date: new Date('2026-10-01T02:59:59.999Z'), createdAt: new Date(), totalRevenue: 4, itemsSold: 1, notes: '' },
      { id: 'next', userId: 'seller', userName: 'Seller', date: new Date('2026-10-01T03:00:00.000Z'), createdAt: new Date(), totalRevenue: 8, itemsSold: 1, notes: '' },
      { id: 'other', userId: 'seller2', userName: 'Seller 2', date: new Date('2026-09-10T12:00:00.000Z'), createdAt: new Date(), totalRevenue: 100, itemsSold: 1, notes: '' },
    );
    const result = await (await f.request('/sales/goal?month=2026-09', 'GET', 'seller')).json();
    assert.equal(result.totalRevenue, 18.34);
  } finally { await f.close(); }
});

test('date-only sales stay in their business month and appear in today personal totals', async () => {
  const f = await fixture();
  try {
    const sale = await f.request('/sales/close-day', 'POST', 'admin', { date: '2021-01-01', customItems: [{ description: 'Anel', price: 10, quantity: 1 }] });
    assert.equal(sale.status, 201);
    assert.equal((await sale.json()).date, '2021-01-01T03:00:00.000Z');
    const month = await (await f.request('/sales/goal?month=2021-01', 'GET', 'admin')).json();
    assert.equal(month.totalRevenue, 10);
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    assert.equal((await f.request('/sales/close-day', 'POST', 'manager', { date: today, customItems: [{ description: 'Colar', price: 7, quantity: 1 }] })).status, 201);
    const history = await (await f.request('/sales/history', 'GET', 'manager')).json();
    assert.equal(history.todaySummary.totalRevenue, 7);
  } finally { await f.close(); }
});

test('offers remain private publicly and only admins can set them while multipart booleans parse correctly', async () => {
  const f = await fixture();
  try {
    const list = await (await f.request('/products')).json();
    const one = await (await f.request('/products/p1')).json();
    assert.equal('onOffer' in list[0], false); assert.equal('onOffer' in one, false);
    const privateList = await (await f.request('/admin/products', 'GET', 'seller')).json();
    assert.equal(privateList[0].onOffer, true);
    assert.equal((await f.request('/products/p1', 'PUT', 'manager', { name: 'Ring', price: 10, stock: 2, categoryId: 'c1', onOffer: false })).status, 403);
    const edited = await (await f.request('/products/p1', 'PUT', 'admin', { name: 'Ring', price: 10, stock: 2, categoryId: 'c1', featured: 'false', onOffer: 'false' })).json();
    assert.equal(edited.featured, false); assert.equal(edited.onOffer, false);
    const preserved = await (await f.request('/products/p1', 'PUT', 'admin', { name: 'Ring', price: 10, stock: 2, categoryId: 'c1' })).json();
    assert.equal(preserved.featured, false); assert.equal(preserved.onOffer, false);
  } finally { await f.close(); }
});
