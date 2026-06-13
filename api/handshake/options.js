import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { rpFromReq, readBody, send } from '../_lib/rp.js';
import { getJSON, setJSON } from '../_lib/store.js';

// Responder begins proving they're real: issue a FRESH challenge tied to this
// session (anti-replay). allowCredentials empty => phone offers its passkeys.
export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
  try {
    const { rpID } = rpFromReq(req);
    const { sessionId } = readBody(req);
    const sess = await getJSON(`sess:${sessionId}`);
    if (!sess) return send(res, 404, { error: 'session expired' });

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: [],
      userVerification: 'required',
    });

    await setJSON(`chal:hs:${sessionId}`, { challenge: options.challenge }, 120);
    return send(res, 200, { options });
  } catch (e) {
    return send(res, 500, { error: e.message });
  }
}
