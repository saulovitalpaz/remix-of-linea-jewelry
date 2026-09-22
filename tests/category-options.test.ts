import { test } from 'node:test';
import assert from 'node:assert/strict';
import { categoryEmojiOptions, categoryIllustration } from '../src/lib/category-illustrations.ts';

test('each catalog category has five distinct labeled options of its own', () => {
  const slugs = ['aneis', 'brincos', 'colares', 'conjuntos', 'pulseiras', 'infantil', 'semijoias', 'make', 'bolsas'];
  const groups = slugs.map(slug => {
    const options = categoryEmojiOptions(slug);
    assert.equal(options.length, 5, slug);
    assert.equal(new Set(options.map(option => option.emoji)).size, 5, slug);
    assert.ok(options.every(option => option.label && !option.label.startsWith('Ilustração ')), slug);
    return options.map(option => option.emoji).join(',');
  });
  assert.equal(new Set(groups).size, slugs.length);
});

test('category aliases, accents and legacy illustration URLs remain compatible', () => {
  assert.deepEqual(categoryEmojiOptions('Anéis'), categoryEmojiOptions('rings'));
  assert.deepEqual(categoryEmojiOptions('beleza-e-make'), categoryEmojiOptions('maquiagem'));
  assert.equal(categoryEmojiOptions('minha-categoria').length, 5);
  assert.equal(categoryIllustration('💍'), '/emoji/ring.png');
  assert.equal(categoryIllustration('🪶'), undefined);
});
