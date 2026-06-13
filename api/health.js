import { redis } from './_lib/store.js';
import { send } from './_lib/rp.js';

// Diagnostic only: reports whether the Redis env vars are present (never their
// values) and whether a round-trip works. Safe to leave in; reveals no secrets.
export default async function handler(req, res) {
  const env = {
    KV_REST_API_URL: !!process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
    UPSTASH_REDIS_REST_URL: !!process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    REDIS_URL: !!process.env.REDIS_URL,
  };
  let redisOk = false;
  let error = null;
  try {
    await redis.set('health:ping', '1', { ex: 30 });
    redisOk = (await redis.get('health:ping')) == 1 || (await redis.get('health:ping')) === '1';
  } catch (e) {
    error = e.message;
  }
  return send(res, 200, { redisOk, env, error });
}
