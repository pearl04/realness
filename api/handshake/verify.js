import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { rpFromReq, readBody, send } from '../_lib/rp.js';
import { getJSON, setJSON } from '../_lib/store.js';

// Responder finishes. We verify the live signature over the session's fresh
// challenge against the enrolled public key. Success flips the session GREEN.
export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
  try {
    const { rpID, origin } = rpFromReq(req);
    const { sessionId, response } = readBody(req);

    const sess = await getJSON(`sess:${sessionId}`);
    if (!sess) return send(res, 404, { verified: false, error: 'session expired' });

    const chal = await getJSON(`chal:hs:${sessionId}`);
    const cred = await getJSON(`cred:${response?.id}`);
    if (!chal || !cred) {
      await setJSON(`sess:${sessionId}`, { ...sess, status: 'failed' }, 600);
      return send(res, 200, { verified: false, reason: 'not_enrolled' });
    }

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: chal.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
      credential: {
        id: response.id,
        publicKey: new Uint8Array(Buffer.from(cred.publicKey, 'base64url')),
        counter: cred.counter,
        transports: cred.transports,
      },
    });

    if (!verification.verified) {
      await setJSON(`sess:${sessionId}`, { ...sess, status: 'failed' }, 600);
      return send(res, 200, { verified: false });
    }

    await setJSON(`cred:${response.id}`, {
      ...cred,
      counter: verification.authenticationInfo.newCounter,
    });
    await setJSON(
      `sess:${sessionId}`,
      { ...sess, status: 'verified', verifiedAt: Date.now() },
      600,
    );
    return send(res, 200, { verified: true });
  } catch (e) {
    return send(res, 400, { verified: false, error: e.message });
  }
}
