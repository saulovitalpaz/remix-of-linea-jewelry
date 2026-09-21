import { test } from 'node:test';
import assert from 'node:assert/strict';
const module = await import('../../src/lib/catalog.js').catch(() => ({}));
const filterCatalog = 'filterCatalog' in module ? module.filterCatalog : undefined;
test('catalog filtering is available for the storefront', () => assert.equal(typeof filterCatalog, 'function'));
test('search ignores accents, filters stock and sorts without changing the source', { skip: !filterCatalog }, () => {
  const products = [
    { id: 'a', name: 'Anél dourado', description: '', price: 100, stock: 2, salesCount: 0, category: { id: 'rings', slug: 'aneis', name: 'Anéis' } },
    { id: 'b', name: 'Anel prata', description: '', price: 30, stock: 0, salesCount: 0, category: { id: 'rings', slug: 'aneis', name: 'Anéis' } },
    { id: 'c', name: 'Bolsa', description: '', price: 250, stock: 1, salesCount: 0, category: 'bolsas' },
  ];
  assert.deepEqual(filterCatalog!(products, { query: 'anel', sort: 'price-low' }).map(p => p.id), ['b', 'a']);
  assert.deepEqual(filterCatalog!(products, { category: 'aneis', available: true }).map(p => p.id), ['a']);
  assert.deepEqual(filterCatalog!(products, { price: 'under50' }).map(p => p.id), ['b']);
  assert.deepEqual(filterCatalog!(products, { query: 'inexistente' }), []);
  assert.deepEqual(products.map(p => p.id), ['a', 'b', 'c']);
});
