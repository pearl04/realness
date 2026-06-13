import { send } from '../_lib/rp.js';
import { getJSON } from '../_lib/store.js';

// Requester polls this until status flips to 'verified' (GREEN) or 'failed' (RED).
export default async function handler(req, res) {
  try {
    const { id } = req.query;
    const sess = await getJSON(`sess:${id}`);
    if (!sess) return send(res, 200, { status: 'expired' });
    return send(res, 200, { status: sess.status, verifiedAt: sess.verifiedAt || null });
  } catch (e) {
    return send(res, 500, { error: e.message });
  }
}
