import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import crypto from 'node:crypto';

const endpoint = process.env.STORAGE_ENDPOINT;
const region = process.env.STORAGE_REGION || 'auto';
const bucket = process.env.STORAGE_BUCKET;
const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID;
const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY;
const publicBaseUrl = process.env.STORAGE_PUBLIC_BASE_URL?.replace(/\/$/, '');

const client = endpoint && bucket && accessKeyId && secretAccessKey
  ? new S3Client({ endpoint, region, forcePathStyle: true, credentials: { accessKeyId, secretAccessKey } })
  : null;

function publicUrl(key: string) {
  if (publicBaseUrl) return `${publicBaseUrl}/${key}`;
  if (!endpoint || !bucket) throw new Error('STORAGE_PUBLIC_BASE_URL ou STORAGE_ENDPOINT/STORAGE_BUCKET não configurado.');
  return `${endpoint.replace(/\/$/, '')}/${bucket}/${key}`;
}

export async function uploadToObjectStorage(fileBuffer: Buffer, contentType = 'application/octet-stream') {
  if (!client || !bucket) throw new Error('Armazenamento S3-compatible não configurado.');
  const extension = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg';
  const key = `products/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  }));
  return publicUrl(key);
}
