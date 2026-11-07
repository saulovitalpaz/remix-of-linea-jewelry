import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('service worker registration uses the cache version to bypass stale CDN scripts', async () => {
  const [entry, worker] = await Promise.all([
    readFile(new URL('../src/main.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../public/sw.js', import.meta.url), 'utf8'),
  ]);
  const cacheVersion = /CACHE_NAME\s*=\s*['"]chique-admin-pwa-v(\d+)['"]/.exec(worker)?.[1];
  const registration = /serviceWorker\.register\(['"]([^'"]+)['"]\)/.exec(entry)?.[1];
  assert.ok(cacheVersion);
  assert.ok(registration);
  assert.equal(new URL(registration, 'https://example.com').searchParams.get('v'), cacheVersion);
});
