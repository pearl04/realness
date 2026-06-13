// Derive the WebAuthn Relying Party ID + origin from the live request so the
// app works on whatever Vercel domain it lands on (preview or production)
// without hardcoding. RP ID must equal the registrable domain (host, no port).
export function rpFromReq(req) {
  const host =
    (req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
  const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const rpID = host.split(':')[0];
  const origin = `${proto}://${host}`;
  return { rpID, origin, rpName: 'Realness' };
}

export function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.length) {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return {};
}

export function send(res, status, payload) {
  res.status(status).setHeader('content-type', 'application/json');
  res.end(JSON.stringify(payload));
}
