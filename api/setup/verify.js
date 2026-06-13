import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { rpFromReq, readBody, send } from '../_lib/rp.js';
import { getJSON, setJSON, del } from '../_lib/store.js';

// Finish enrollment: verify the attestation and store the credential public key
// so we can later verify this human's live signature during a handshake.
export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
  try {
    const { rpID, origin } = rpFromReq(req);
    const { flowId, response } = readBody(req);
    const rec = await getJSON(`chal:reg:${flowId}`);
    if (!rec) return send(res, 400, { verified: false, error: 'challenge expired' });

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: rec.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return send(res, 400, { verified: false });
    }

    const { credential } = verification.registrationInfo;
    await setJSON(`cred:${credential.id}`, {
      publicKey: Buffer.from(credential.publicKey).toString('base64url'),
      counter: credential.counter,
      transports: credential.transports || [],
    });

    let completedSession = false;
    if (rec.sessionId) {
      const sess = await getJSON(`sess:${rec.sessionId}`);
      if (sess && sess.status === 'pending') {
        await setJSON(
          `sess:${rec.sessionId}`,
          { ...sess, status: 'verified', verifiedAt: Date.now() },
          600,
        );
        completedSession = true;
      }
    }

    await del(`chal:reg:${flowId}`);

    return send(res, 200, { verified: true, completedSession });
  } catch (e) {
    return send(res, 400, { verified: false, error: e.message });
  }
}
