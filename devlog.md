# Dev Log

---
## Session: 2026-06-13

### Goal
- Build "Realness" from the PRD for a 2-hour B2C hackathon: prove a real, live human is on the other end of a remote conversation, with a Steve-Jobs-grade "magic moment" GREEN demo.
- Judged on Originality, UI/UX, and Execution (a real deployed thing a judge can try on their own phone).

### Status
- Fully built, deployed, and server-side verified. Live at https://realness.vercel.app/ ; public repo at github.com/pearl04/realness. Only the real two-phone biometric run remains (inherent to WebAuthn — can't be tested without devices).

### Built
- Backend (Vercel serverless, ESM): `api/setup/options.js` + `verify.js` (passkey enrollment), `api/session/create.js` + `[id].js` (shared session create/poll), `api/handshake/options.js` + `verify.js` + `fail.js` (live auth ceremony), `api/health.js` (diagnostic), `api/wipe.js` (guarded data flush).
- Shared libs: `api/_lib/store.js` (Upstash Redis wrapper, multi-name env fallback), `api/_lib/rp.js` (derives RP ID/origin from host header at runtime).
- Frontend: `index.html` — single-file vanilla-JS SPA, Aurora Bloom dark theme, WebAuthn via vendored `@simplewebauthn/browser`, QR via vendored `qrcode-generator`.
- PWA: `manifest.webmanifest` + hand-drawn PNG icons via `scripts/generate-icons.mjs` (dependency-free PNG encoder).
- Three approval mocks in `mocks/` (A Aurora Bloom, B Brutalist, C Soft Trust); A chosen.

### Key Decisions
- Stack: Node serverless on Vercel (Pearl's GitHub already connected) + Upstash Redis for the cross-phone shared session; polling (not websockets) for the requester's live update.
- Static assets moved to repo root (not `public/`) to guarantee reliable Vercel static serving alongside `api/`.
- RP ID derived from the live request host so it works on any Vercel domain; `userVerification: required`, `residentKey: required`, platform authenticator forced.
- Handshake = authentication ceremony with `allowCredentials: []` (discoverable passkeys); RED state = cancelled biometric or unenrolled device, rendered as a designed state.

### Milestones
- First deploy live on HTTPS with correct RP ID (realness.vercel.app).
- Public GitHub repo created and pushed.
- Full non-biometric API path verified live (session round-trip, options generation, fresh challenges, Redis ok).

### Skipped
- Per PRD out-of-scope: accounts, revocation, deepfake/video, AI-detection scoring, any LLM call.
- Declined a TTL on the `cred:*` public key (Pearl chose an on-demand wipe endpoint instead).

### Pivots
- Hosting: initially recommended Render; switched to Vercel because Pearl's GitHub was already connected there — added Upstash Redis to cover serverless statelessness.

### Mistakes & Fixes
- Used Pearl's personal email as git author — flagged as a privacy violation; rewrote the commit to `pearl04@users.noreply.github.com` and scanned history clean before any push.
- First API smoke test 500'd (`Failed to parse URL from /pipeline`) because Redis env vars weren't wired yet; added `/api/health` to confirm, resolved once Upstash was connected + redeployed.
- Two CSS typos in mock A and one in mock C caught and fixed immediately after writing.

### Learnings
- @simplewebauthn/server v13: `registrationInfo.credential.{id,publicKey,counter}` and `verifyAuthenticationResponse` takes a `credential` (not `authenticator`) param; `userID` must be a Uint8Array.
- WebAuthn privacy thesis holds end-to-end: only a public key + one-time signatures ever leave the device; server stores no biometric/PII.
- Upstash-via-Vercel injects `KV_REST_API_URL/TOKEN` (also exposes `REDIS_URL`); supporting both name sets up front avoided a wiring dead-end.

### Watch Out For
- Use `realness.vercel.app` EXACTLY for every phone — passkeys bind to the domain; a preview URL won't find enrollments.
- RED demo phone should CANCEL the Face ID prompt; a second iPhone on the same Apple ID may have an iCloud-synced passkey and falsely go GREEN.
- `cred:*` keys have no expiry (by choice) — use `POST /api/wipe?confirm=realness` to flush.

### Next Steps
- Run the live two-phone test (enroll on phone A, request handshake on phone B, confirm GREEN bloom + RED on cancel).
- Tune bloom intensity, copy, and timing after seeing it on a real device.
- Rehearse the ~80s demo choreography; optionally verify PWA home-screen install.
---
