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
    dailySales: {
      create: async ({ data }: { data: any }) => {
        const item = { id: 'ds-' + (salesList.length + 1), createdAt: new Date(), ...data };
        salesList.push(item);
        return item;
      },
      findMany: async ({ where }: { where?: any } = {}) => {
        if (where?.userId) return salesList.filter(s => s.userId === where.userId);
        return salesList;
      },
      delete: async ({ where }: { where: { id: string } }) => {
        const idx = salesList.findIndex(s => s.id === where.id);
        if (idx >= 0) salesList.splice(idx, 1);
      }
    },
    cashTransaction: {
      create: async ({ data }: { data: any }) => {
        const item = { id: 'ctx-' + (cashTransactions.length + 1), createdAt: new Date(), ...data };
        cashTransactions.push(item);
        return item;
      },
      findMany: async ({ where }: { where?: any } = {}) => {
        if (where?.dailySalesId?.in) {
          return cashTransactions.filter(t => where.dailySalesId.in.includes(t.dailySalesId));
        }
        return cashTransactions;
      },
      findUnique: async ({ where }: { where: { id: string } }) => cashTransactions.find(t => t.id === where.id) ?? null,
      delete: async ({ where }: { where: { id: string } }) => {
        const idx = cashTransactions.findIndex(t => t.id === where.id);
        if (idx >= 0) cashTransactions.splice(idx, 1);
      }
    },
    $transaction: async (fn: (tx: unknown) => Promise<unknown>) => fn(db),
  };
  const salesList: any[] = [];
  const cashTransactions: any[] = [];
  const app = createApp!({ prisma: db as any, jwtSecret: secret, uploadImage: async () => 'https://example.com/image.png' });

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

    // Sales and retroactive date tests
    // Seller attempting retroactive sale should fail with 403
    const sellerRetro = await request('/sales/close-day', 'POST', 'seller', {
      itemsSoldData: [{ productId: 'p1', quantity: 1 }],
      date: '2026-01-15T12:00:00.000Z'
    });
    assert.equal(sellerRetro.status, 403);

    assert.equal((await request('/sales/close-day', 'POST', 'seller', { itemsSoldData: [{ productId: 'p1', quantity: -2 }] })).status, 400);
    assert.equal((await request('/sales/close-day', 'POST', 'seller', { itemsSoldData: [{ productId: 'p1', quantity: 3 }] })).status, 409);
    
    // Seller making today's sale succeeds
    const sale = await request('/sales/close-day', 'POST', 'seller', { itemsSoldData: [{ productId: 'p1', quantity: 2, priceAtSale: 0.01 }] });
    assert.equal(sale.status, 201);
    assert.equal((await sale.json()).totalRevenue, 39.8);
    assert.equal(stock, 0);
    assert.equal((await request('/sales/close-day', 'POST', 'seller', { itemsSoldData: [{ productId: 'p1', quantity: 1 }] })).status, 409);

    // Verify cash transaction was automatically created with seller attribution
    assert.equal(cashTransactions.length, 1);
    assert.equal(cashTransactions[0].type, 'INFLOW');
    assert.equal(cashTransactions[0].category, 'SALE');
    assert.equal(cashTransactions[0].amount, 39.8);
    assert.equal(cashTransactions[0].userName, 'Vendedor');
    assert.equal(cashTransactions[0].userRole, 'SELLER');

    // Admin making retroactive sale succeeds
    stock = 5;
    const adminRetro = await request('/sales/close-day', 'POST', 'admin', {
      itemsSoldData: [{ productId: 'p1', quantity: 1 }],
      date: '2026-01-15T12:00:00.000Z'
    });
    assert.equal(adminRetro.status, 201);
    assert.equal(cashTransactions.length, 2);
    assert.equal(cashTransactions[1].userName, 'Bárbara Paz');
    assert.equal(cashTransactions[1].userRole, 'ADMIN');

    // Cash flow endpoints tests
    // Seller cannot access cash flow (403)
    assert.equal((await request('/cash-flow', 'GET', 'seller')).status, 403);

    // Admin / Manager can access cash flow
    const cfRes = await request('/cash-flow', 'GET', 'admin');
    assert.equal(cfRes.status, 200);
    const cfData = await cfRes.json();
    assert.equal(cfData.summary.transactionCount, 2);
    assert.equal(cfData.summary.salesTotal, 59.7);

    // Manual withdrawal / expense
    const expenseRes = await request('/cash-flow', 'POST', 'manager', {
      type: 'OUTFLOW',
      category: 'EXPENSE',
      amount: 15.50,
      description: 'Embalagens para joias',
      paymentMethod: 'PIX'
    });
    assert.equal(expenseRes.status, 201);
    const expData = await expenseRes.json();
    assert.equal(expData.amount, 15.50);
    assert.equal(expData.userName, 'Gerente');
    assert.equal(expData.userRole, 'MANAGER');

    // Cash flow balance after expense
    const cfUpdated = await (await request('/cash-flow', 'GET', 'admin')).json();
    assert.equal(cfUpdated.summary.totalOutflows, 15.50);
    assert.equal(cfUpdated.summary.netBalance, 44.20);

    // Venda avulsa (customItems only)
    const customSaleRes = await request('/sales/close-day', 'POST', 'seller', {
      customItems: [
        { description: 'Colar artesanal avulso', price: 80.00, quantity: 1 },
        { description: 'Embalagem presente', price: 10.00, quantity: 2 }
      ],
      paymentMethod: 'PIX'
    });
    assert.equal(customSaleRes.status, 201);
    const customSaleData = await customSaleRes.json();
    assert.equal(customSaleData.totalRevenue, 100.00);
    assert.equal(customSaleData.itemsSold, 3);

    // Sales history endpoint
    const historyRes = await request('/sales/history', 'GET', 'seller');
    assert.equal(historyRes.status, 200);
    const historyData = await historyRes.json();
    assert.ok(historyData.todaySummary);
    assert.ok(Array.isArray(historyData.userRecentSales));
    assert.ok(historyData.userRecentSales.length >= 2);

    // Admin deleting cash flow entry linked to a sale
    const saleTx = cashTransactions.find(t => t.category === 'SALE');
    assert.ok(saleTx);
    const delRes = await request(`/cash-flow/${saleTx.id}`, 'DELETE', 'admin');
    assert.equal(delRes.status, 204);
    assert.equal(cashTransactions.some(t => t.id === saleTx.id), false);
  } finally {
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
  }


});
