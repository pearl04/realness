import { randomBytes } from 'node:crypto';
import { send } from '../_lib/rp.js';
import { setJSON } from '../_lib/store.js';

// Requester opens a one-time handshake. The session is the shared channel the
// two phones talk through: responder writes a verified signature, requester polls.
export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
  try {
    const sessionId = randomBytes(6).toString('base64url'); // 8 url-safe chars
    await setJSON(
      `sess:${sessionId}`,
      { status: 'pending', createdAt: Date.now() },
      600,
    );
    return send(res, 200, { sessionId });
  } catch (e) {
    return send(res, 500, { error: e.message });
  }
}
