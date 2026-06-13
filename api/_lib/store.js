import { Redis } from '@upstash/redis';

// Vercel's "Upstash" and "Redis" storage integrations inject env vars under
// slightly different names. Accept either so setup is one click in the dashboard.
const url =
  process.env.KV_REST_API_URL ||
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.REDIS_URL;
const token =
  process.env.KV_REST_API_TOKEN ||
  process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = new Redis({ url, token });

const j = (v) => (typeof v === 'string' ? JSON.parse(v) : v);

export async function setJSON(key, value, ttlSeconds) {
  await redis.set(key, JSON.stringify(value), ttlSeconds ? { ex: ttlSeconds } : undefined);
}
export async function getJSON(key) {
  const v = await redis.get(key);
  return v == null ? null : j(v);
}
export async function del(key) {
  await redis.del(key);
}
