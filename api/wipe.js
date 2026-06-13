import { redis } from './_lib/store.js';
import { send } from './_lib/rp.js';

// On-demand cleanup: flush all keys from the (Realness-only) Redis store.
// Guarded so a crawler / accidental GET can't trigger it.
// Usage: POST /api/wipe?confirm=realness
export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
  if (req.query.confirm !== 'realness') {
    return send(res, 400, { error: 'add ?confirm=realness to wipe' });
  }
  try {
    await redis.flushdb();
    return send(res, 200, { wiped: true });
  } catch (e) {
    return send(res, 500, { wiped: false, error: e.message });
  }
}
