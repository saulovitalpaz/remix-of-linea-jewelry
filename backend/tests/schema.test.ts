import { test } from 'node:test';
import assert from 'node:assert/strict';
import { upgradeCashFlow, upgradeSalesPortal } from '../src/schema.js';

test('cash flow upgrade prepares sales attribution and cash table in one transaction', async () => {
  const statements: string[] = [];
  await upgradeCashFlow({
    $transaction: async (run: (tx: { $executeRawUnsafe: (sql: string) => Promise<number> }) => Promise<void>) =>
      run({ $executeRawUnsafe: async (sql: string) => { statements.push(sql); return 0; } }),
  });
  assert.ok(statements.some(sql => sql.includes('ALTER TABLE "DailySales" ADD COLUMN IF NOT EXISTS "userId"')));
  assert.ok(statements.some(sql => sql.includes('ALTER TABLE "DailySales" ADD COLUMN IF NOT EXISTS "userName"')));
  assert.ok(statements.some(sql => sql.includes('CREATE TABLE IF NOT EXISTS "CashTransaction"')));
  assert.ok(statements.some(sql => sql.includes('CashTransaction_date_idx')));
});

test('cash flow upgrade propagates failure so startup cannot report a healthy API', async () => {
  await assert.rejects(upgradeCashFlow({ $transaction: async () => { throw new Error('database unavailable'); } }), /database unavailable/);
});

test('sales portal upgrade adds private offers and monthly goals idempotently', async () => {
  const statements: string[] = [];
  await upgradeSalesPortal({
    $transaction: async (run: (tx: { $executeRawUnsafe: (sql: string) => Promise<number> }) => Promise<void>) =>
      run({ $executeRawUnsafe: async (sql: string) => { statements.push(sql); return 0; } }),
  });
  assert.ok(statements.some(sql => sql.includes('ADD COLUMN IF NOT EXISTS "onOffer"')));
  assert.ok(statements.some(sql => sql.includes('CREATE TABLE IF NOT EXISTS "MonthlySalesGoal"')));
  assert.ok(statements.some(sql => sql.includes('MonthlySalesGoal_userId_month_key')));
  assert.ok(statements.some(sql => sql.includes('ON DELETE CASCADE')));
});
