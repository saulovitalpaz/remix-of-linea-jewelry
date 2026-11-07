import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addCartItem, changeCartQuantity, parseCart, whatsappMessage } from '../src/lib/cart';

const ring = { id: 'ring', name: 'Anel', price: 20, stock: 3, imageUrl: null };
const bag = { id: 'bag', name: 'Bolsa', price: 50, stock: 2, imageUrl: null };

test('cart retains multiple selections for 24 hours from its creation', () => {
  const first = addCartItem(null, ring, 1, 1000);
  const cart = addCartItem(first, bag, 2, 2000);
  assert.equal(cart.expiresAt, 1000 + 24 * 60 * 60 * 1000);
  assert.deepEqual(cart.items.map(item => [item.id, item.quantity]), [['ring', 1], ['bag', 2]]);
  assert.deepEqual(parseCart(JSON.stringify(cart), cart.expiresAt - 1), cart);
  assert.equal(parseCart(JSON.stringify(cart), cart.expiresAt), null);
  assert.equal(parseCart('invalid', 0), null);
});

test('quantities are limited by stock and can be removed', () => {
  const cart = addCartItem(addCartItem(null, ring, 2, 0), ring, 2, 1);
  assert.equal(cart.items[0].quantity, 3);
  assert.equal(changeCartQuantity(cart, 'ring', 0)?.items.length, 0);
});

test('WhatsApp messages are concise and distinguish purchase from questions', () => {
  const cart = addCartItem(addCartItem(null, ring, 1, 0), bag, 2, 0);
  const purchase = whatsappMessage(cart.items, 'purchase', 'https://example.com/admin?quote=token');
  assert.match(purchase, /1x Anel/);
  assert.match(purchase, /2x Bolsa/);
  assert.match(purchase, /https:\/\/example.com\/admin\?quote=token/);
  const questions = whatsappMessage(cart.items, 'questions');
  assert.match(questions, /dúvidas/i);
  assert.doesNotMatch(questions, /https?:\/\//);
});
