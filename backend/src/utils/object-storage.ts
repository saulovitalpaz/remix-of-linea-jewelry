import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import crypto from 'node:crypto';
import { HttpError } from '../validation.js';

export function storageConfig(env: NodeJS.ProcessEnv = process.env) {
  return {
    endpoint: env.STORAGE_ENDPOINT || env.AWS_ENDPOINT_URL_S3 || env.AWS_ENDPOINT_URL || env.ENDPOINT,
    region: env.STORAGE_REGION || env.AWS_REGION || env.AWS_DEFAULT_REGION || env.REGION || 'auto',
    bucket: env.STORAGE_BUCKET || env.AWS_S3_BUCKET_NAME || env.AWS_BUCKET_NAME || env.BUCKET,
    accessKeyId: env.STORAGE_ACCESS_KEY_ID || env.AWS_ACCESS_KEY_ID || env.ACCESS_KEY_ID,
    secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY || env.AWS_SECRET_ACCESS_KEY || env.SECRET_ACCESS_KEY,
    publicBaseUrl: env.STORAGE_PUBLIC_BASE_URL?.replace(/\/$/, ''),
  };
}

function storage() {
  const config = storageConfig();
  const { endpoint, region, bucket, accessKeyId, secretAccessKey } = config;
  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) throw new HttpError(503, 'Confira as variáveis do bucket no serviço backend.');
  const client = new S3Client({ endpoint, region, forcePathStyle: true, credentials: { accessKeyId, secretAccessKey }, requestChecksumCalculation: 'WHEN_REQUIRED', responseChecksumValidation: 'WHEN_REQUIRED' });
  return { client, bucket, publicBaseUrl: config.publicBaseUrl };
}

export function isProductImageKey(key: string) {
  return /^products\/\d{4}-\d{2}-\d{2}\/[0-9a-f-]{36}\.(png|webp|jpg)$/.test(key);
}

export async function uploadToObjectStorage(fileBuffer: Buffer, contentType = 'application/octet-stream') {
  const { client, bucket, publicBaseUrl } = storage();
  const extension = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg';
  const key = `products/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;
  try { await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  })); } catch (error) {
    console.error('Object storage upload failed:', error instanceof Error ? error.name : 'UnknownError');
    throw new HttpError(502, 'Não foi possível enviar a imagem ao bucket. Confira a conexão e as credenciais do backend.');
  } finally { client.destroy(); }
  return publicBaseUrl ? `${publicBaseUrl}/${key}` : `/api/images/${key}`;
}

export async function readFromObjectStorage(key: string) {
  if (!isProductImageKey(key)) throw new HttpError(404, 'Imagem não encontrada.');
  const { client, bucket } = storage();
  try {
    const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    if (!result.Body) throw new HttpError(404, 'Imagem não encontrada.');
    return { body: Buffer.from(await result.Body.transformToByteArray()), contentType: result.ContentType || 'image/jpeg' };
  } catch (error) {
    if (error instanceof HttpError) throw error;
    if (error instanceof Error && error.name === 'NoSuchKey') throw new HttpError(404, 'Imagem não encontrada.');
    throw new HttpError(502, 'Não foi possível carregar a imagem.');
  } finally { client.destroy(); }
}
