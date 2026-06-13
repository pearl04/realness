import { readBody, send } from '../_lib/rp.js';
import { getJSON, setJSON } from '../_lib/store.js';

// Responder cancelled the biometric, or a non-human / unenrolled device bailed.
// Flip the session to a designed RED state immediately (no waiting).
export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
  try {
    const { sessionId } = readBody(req);
    const sess = await getJSON(`sess:${sessionId}`);
    if (sess && sess.status === 'pending') {
      await setJSON(`sess:${sessionId}`, { ...sess, status: 'failed' }, 600);
    }
    return send(res, 200, { ok: true });
  } catch (e) {
    return send(res, 500, { error: e.message });
  }
}
