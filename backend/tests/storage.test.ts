import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import jwt from 'jsonwebtoken';
import type { PrismaClient } from '@prisma/client';
import { storageConfig, uploadToObjectStorage, readFromObjectStorage } from '../src/utils/object-storage.js';
import { createApp } from '../src/app.js';

test('storage accepts Railway references and AWS variable names', () => {
  const railway = storageConfig({ ENDPOINT: 'https://s3.example', BUCKET: 'images', ACCESS_KEY_ID: 'id', SECRET_ACCESS_KEY: 'secret', REGION: 'auto' });
  assert.equal(railway.bucket, 'images');
  assert.equal(railway.accessKeyId, 'id');
  const aws = storageConfig({ AWS_ENDPOINT_URL: 'https://s3.example', AWS_S3_BUCKET_NAME: 'images', AWS_ACCESS_KEY_ID: 'id', AWS_SECRET_ACCESS_KEY: 'secret' });
  assert.deepEqual(aws, railway);
  assert.equal(storageConfig({ STORAGE_BUCKET: 'custom', BUCKET: 'default' }).bucket, 'custom');
});

test('private bucket upload and public image delivery work without frontend credentials', async () => {
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLttAAAAABJRU5ErkJggg==', 'base64');
  const objects = new Map<string, Buffer>();
  const bucket = createServer(async (req, res) => {
    assert.match(req.headers.authorization || '', /^AWS4-HMAC-SHA256/);
    const key = req.url!.split('?')[0];
    if (req.method === 'PUT') {
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(chunk);
      objects.set(key, Buffer.concat(chunks));
      res.writeHead(200).end();
    } else if (objects.has(key)) {
      res.writeHead(200, { 'Content-Type': 'image/png' }).end(objects.get(key));
    } else res.writeHead(404).end();
  });
  bucket.listen(0, '127.0.0.1');
  await once(bucket, 'listening');
  const address = bucket.address();
  assert.ok(address && typeof address === 'object');
  const vars = { STORAGE_ENDPOINT: `http://127.0.0.1:${address.port}`, STORAGE_BUCKET: 'private-images', STORAGE_ACCESS_KEY_ID: 'test', STORAGE_SECRET_ACCESS_KEY: 'test', STORAGE_PUBLIC_BASE_URL: '' };
  const previous = Object.fromEntries(Object.keys(vars).map(key => [key, process.env[key]]));
  Object.assign(process.env, vars);
  const secret = 'storage-test-secret-at-least-32-characters';
  const db = {
    adminUser: { findUnique: async ({ where }: { where: { id: string } }) => ({ id: where.id, name: where.id, role: where.id }) },
    category: { findFirst: async () => ({ id: 'category' }) },
    product: { create: async ({ data }: { data: object }) => ({ id: 'product', ...data }) },
  } as unknown as PrismaClient;
  const server = createApp({ prisma: db, jwtSecret: secret, uploadImage: uploadToObjectStorage, readImage: readFromObjectStorage }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const apiAddress = server.address();
  assert.ok(apiAddress && typeof apiAddress === 'object');
  const base = `http://127.0.0.1:${apiAddress.port}`;
  const form = (valid = true) => {
    const body = new FormData();
    body.set('name', 'Anel'); body.set('price', '20'); body.set('stock', '1'); body.set('categoryId', 'category');
    body.set('image', new Blob([valid ? png : Buffer.from('not an image')], { type: 'image/png' }), 'image.png');
    return body;
  };
  const upload = (role: string, valid = true) => fetch(`${base}/api/products`, { method: 'POST', body: form(valid), headers: { Authorization: `Bearer ${jwt.sign({ id: role }, secret, { audience: 'chique-admin', issuer: 'chique-api' })}` } });
  try {
    assert.equal((await upload('SELLER')).status, 403);
    assert.equal((await upload('ADMIN', false)).status, 400);
    for (const role of ['ADMIN', 'MANAGER']) {
      const response = await upload(role);
      assert.equal(response.status, 201);
      const product = await response.json();
      assert.match(product.imageUrl, /^\/api\/images\/products\//);
      const image = await fetch(base + product.imageUrl);
      assert.equal(image.status, 200);
      assert.equal(image.headers.get('content-type'), 'image/png');
      assert.match(image.headers.get('cache-control')!, /immutable/);
      assert.deepEqual(Buffer.from(await image.arrayBuffer()), png);
    }
    assert.equal((await fetch(base + '/api/images/private/secret.txt')).status, 404);
  } finally {
    for (const [key, value] of Object.entries(previous)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
    server.closeAllConnections(); bucket.closeAllConnections();
    await Promise.all([new Promise<void>(resolve => server.close(() => resolve())), new Promise<void>(resolve => bucket.close(() => resolve()))]);
  }
});
