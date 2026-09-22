import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterTeamProducts, goalProgress, bestSellers, salesDay, salesMonth } from '../src/lib/sales-portal.ts';

const products = [
  { id: 'a', name: 'Anél dourado', category: 'Anéis', description: null, price: 100, stock: 0, salesCount: 5, featured: true, onOffer: false },
  { id: 'b', name: 'Bolsa', category: 'Bolsas', description: null, price: 50, stock: 2, salesCount: 8, featured: false, onOffer: true },
  { id: 'c', name: 'Colar', category: 'Colares', description: null, price: 20, stock: 3, salesCount: 0, featured: true, onOffer: true },
];

test('sales date defaults follow Sao Paulo across the UTC month boundary', () => {
  const instant = new Date('2026-09-01T02:59:59.000Z');
  assert.equal(salesDay(instant), '2026-08-31');
  assert.equal(salesMonth(instant), '2026-08');
  assert.equal(salesDay(new Date('2026-09-01T03:00:00.000Z')), '2026-09-01');
});

test('team catalog combines accent-insensitive search and independent offer/stock filters', () => {
  assert.deepEqual(filterTeamProducts(products, { query: 'anel', stock: 'out' }).map(p => p.id), ['a']);
  assert.deepEqual(filterTeamProducts(products, { selection: 'offer' }).map(p => p.id), ['b', 'c']);
  assert.deepEqual(filterTeamProducts(products, { selection: 'featured', stock: 'available' }).map(p => p.id), ['c']);
  assert.deepEqual(filterTeamProducts(products, { query: 'inexistente' }), []);
});

test('goal progress rounds currency, caps illustration, and has no false achievement without target', () => {
  assert.deepEqual(goalProgress(null, 80), { percent: 0, remaining: 0, achieved: false });
  assert.deepEqual(goalProgress(100, 33.33), { percent: 33, remaining: 66.67, achieved: false });
  assert.deepEqual(goalProgress(100, 125), { percent: 100, remaining: 0, achieved: true });
  assert.deepEqual(goalProgress(100, 99.99), { percent: 99, remaining: 0.01, achieved: false });
});

test('best sellers exclude unsold products and do not reorder the catalog', () => {
  assert.deepEqual(bestSellers(products).map(p => p.id), ['b', 'a']);
  assert.deepEqual(products.map(p => p.id), ['a', 'b', 'c']);
});
