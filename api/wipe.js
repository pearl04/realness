import { redis } from './_lib/store.js';
import { send } from './_lib/rp.js';

// On-demand cleanup: flush all keys from the (Realness-only) Redis store.
// Guarded by a secret kept only in the Vercel env (WIPE_TOKEN), not in the repo.
// Fails closed: if WIPE_TOKEN is unset, nothing can trigger a wipe.
// Usage: POST /api/wipe?confirm=$WIPE_TOKEN
export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
  const token = process.env.WIPE_TOKEN;
  if (!token || req.query.confirm !== token) {
    return send(res, 403, { error: 'invalid or missing confirm token' });
  }
  try {
    await redis.flushdb();
    return send(res, 200, { wiped: true });
  } catch (e) {
    return send(res, 500, { wiped: false, error: e.message });
  }
}
