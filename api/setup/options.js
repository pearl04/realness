import { randomBytes } from 'node:crypto';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { rpFromReq, send } from '../_lib/rp.js';
import { setJSON } from '../_lib/store.js';

// Begin enrollment: phone will create a device-bound passkey behind the live
// biometric. We return the options + a flowId used to recall the challenge.
export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
  try {
    const { rpID, rpName } = rpFromReq(req);
    const userID = randomBytes(16);
    const flowId = Buffer.from(userID).toString('base64url');

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID,
      userName: `human-${flowId.slice(0, 6)}`,
      userDisplayName: 'Verified human',
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'required',
        requireResidentKey: true,
        userVerification: 'required',
        authenticatorAttachment: 'platform',
      },
    });

    await setJSON(`chal:reg:${flowId}`, { challenge: options.challenge }, 300);
    return send(res, 200, { flowId, options });
  } catch (e) {
    return send(res, 500, { error: e.message });
  }
}
